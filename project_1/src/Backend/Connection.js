require("dotenv").config({ path: __dirname + "/.env" });
const express = require("express");
const neo4j = require("neo4j-driver");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Conectar con Neo4j Aura usando credenciales
const driver = neo4j.driver(
  process.env.NEO4J_URI,
  neo4j.auth.basic(process.env.NEO4J_USER, process.env.NEO4J_PASSWORD)
);



//   GET: Obtener todos los usuarios
app.get("/users", async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run("MATCH (u:Usuario) RETURN u");
    const users = result.records.map(record => record.get("u").properties);
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

//   POST: Registro de usuario
app.post("/register", async (req, res) => {
  const { nombre, edad, email, password } = req.body;
  const session = driver.session();

  try {
    if (!nombre || !edad || !email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Verificar si el usuario ya existe
    const existingUser = await session.run(
      "MATCH (u:Usuario {email: $email}) RETURN u",
      { email }
    );

    if (existingUser.records.length > 0) {
      return res.status(400).json({ message: "El usuario ya está registrado" });
    }

    // Crear el usuario en la base de datos
    await session.run(
      "CREATE (u:Usuario {nombre: $nombre, edad: $edad, email: $email, password: $password}) RETURN u",
      { nombre, edad: parseInt(edad), email, password }
    );

    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    console.error("❌ Error en el registro:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});


//   POST: Login de usuario (Corrección aplicada)
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    const session = driver.session();
  
    try {
      const result = await session.run(
        "MATCH (u:Usuario {email: $email}) RETURN u.password AS password, u.nombre AS nombre, u.email AS email",
        { email }
      );
  
      if (result.records.length === 0) {
        return res.status(401).json({ message: "Usuario no encontrado" });
      }
  
      // Obtener datos del usuario sin duplicar variables
      let storedPassword = result.records[0].get("password");
      let nombre = result.records[0].get("nombre") ? result.records[0].get("nombre") : "Sin nombre";
      let emailUser = result.records[0].get("email");
  
      if (password !== storedPassword) {
        return res.status(401).json({ message: "Contraseña incorrecta" });
      }
  
      res.json({ message: "Inicio de sesión exitoso", nombre, email: emailUser });
  
    } catch (error) {
      res.status(500).json({ error: error.message });
    } finally {
      await session.close();
    }
  });
  


//   GET: Obtener todos los géneros de películas
app.get("/genres", async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run("MATCH (g:Genero) RETURN g.nombre AS name");
    const genres = result.records.map(record => record.get("name"));
    res.json(genres);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

//   GET: Obtener todos los directores
app.get("/directors", async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run("MATCH (d:Director) RETURN d.nombre AS name");
    const directors = result.records.map(record => record.get("name"));
    res.json(directors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

//   GET: Obtener todos los actores
app.get("/actors", async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run("MATCH (a:Actor) RETURN a.nombre AS name");
    const actors = result.records.map(record => record.get("name"));
    res.json(actors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

//   GET: Obtener todas las películas
app.get("/movies", async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run("MATCH (p:Pelicula) RETURN p.titulo AS title, p.popularidad AS popularity");
    const movies = result.records.map(record => ({
      title: record.get("title"),
      popularity: record.get("popularity"),
    }));
    res.json(movies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});
//   POST: Guardar preferencias de usuario
app.post("/save-preferences", async (req, res) => {
  const { email, genres } = req.body;
  console.log("📩 Datos recibidos en el backend:", email, genres); // Agregado para verificar

  const session = driver.session();

  try {
    if (!email || !genres || genres.length === 0) {
      return res.status(400).json({ message: "Faltan datos o géneros seleccionados." });
    }

    // Eliminar relaciones previas
    await session.run(
      "MATCH (u:Usuario {email: $email})-[r:GUSTA]->(g:Genero) DELETE r",
      { email }
    );

    // Crear nuevas relaciones GUSTA
    for (let genre of genres) {
      console.log(`🔗 Creando relación entre ${email} y ${genre}`); // Agregado para verificar
      await session.run(
        "MATCH (u:Usuario {email: $email}), (g:Genero {nombre: $genre}) CREATE (u)-[:GUSTA]->(g)",
        { email, genre }
      );
    }

    res.status(200).json({ message: "Preferencias guardadas con éxito" });
  } catch (error) {
    console.error("❌ Error en /save-preferences:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

// GET: Obtener el top global de películas más populares
app.get("/top-movies", async (req, res) => {
  const session = driver.session();

  try {
    const query = `
      MATCH (p:Película)  
      WHERE p.popularidad IS NOT NULL
      RETURN p.titulo AS title, p.popularidad AS popularidad
      ORDER BY p.popularidad DESC
      LIMIT 10;
    `;


    const result = await session.run(query);

    const topMovies = result.records.map(record => ({
      title: record.get("title"),
      popularidad: record.get("popularidad") ? record.get("popularidad").toNumber() : 0,
    }));

    console.log("🔹 Datos enviados al frontend (Top Global):", topMovies); // Agrega este log para verificar

    res.json(topMovies);
  } catch (error) {
    console.error("❌ Error en la consulta de top de películas:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});


// GET: Obtener recomendaciones de películas basadas en los géneros preferidos del usuario
app.get("/recommendations/:email", async (req, res) => {
  const { email } = req.params;
  console.log(`📩 Recibiendo solicitud de recomendaciones personalizadas para: ${email}`);
  const session = driver.session();

  try {
    const query = `
      MATCH (u:Usuario {email: $email})-[:GUSTA]->(g:Genero)
      MATCH (p:Película)-[:PERTENECE_A]->(g)
      WITH p, COLLECT(g.nombre) AS generosCoincidentes, COUNT(g) AS relevancia, COALESCE(p.popularidad, 0) AS popularidad
      ORDER BY relevancia DESC, popularidad DESC
      LIMIT 10
      RETURN p.titulo AS title, generosCoincidentes, relevancia, popularidad;
    `;

    const result = await session.run(query, { email });

    const personalizedRecommendations = result.records.map(record => ({
      title: record.get("title"),
      generosCoincidentes: record.get("generosCoincidentes"),
      relevancia: record.get("relevancia").toNumber(),
      popularidad: record.get("popularidad").toNumber(),
    }));

    console.log("📌 Datos enviados al frontend (Recomendaciones Personalizadas):", JSON.stringify(personalizedRecommendations, null, 2));
    res.json(personalizedRecommendations);
  } catch (error) {
    console.error("❌ Error en la consulta de recomendaciones personalizadas:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

// GET: Obtener detalles de una película por su título
// GET: Obtener detalles de una película por su título
app.get("/movie/:titulo", async (req, res) => {
  let { titulo } = req.params;
  console.log(`📩 Buscando información de la película: '${titulo}'`);

  const normalizedTitulo = titulo.trim();
  console.log(`🔎 Título normalizado recibido en el backend: '${normalizedTitulo}'`);

  const session = driver.session();
  try {
    const query = `
      MATCH (p:Película)
      WHERE p.titulo = $normalizedTitulo
      OPTIONAL MATCH (p)-[:PERTENECE_A]->(g:Genero)
      OPTIONAL MATCH (p)-[:TRABAJA_CON]->(d:Director)
      OPTIONAL MATCH (p)-[:TIENE_ACTOR]->(a:Actor)
      OPTIONAL MATCH (u:Usuario)-[r:CALIFICA]->(p)
      RETURN p.titulo AS titulo, 
             p.anio AS anio, 
             p.calificacion AS calificacion, 
             p.popularidad AS popularidad, 
             p.sinopsis AS sinopsis,
             COLLECT(g.nombre) AS generos, 
             d.nombre AS director,
             COLLECT(a.nombre) AS actores,
             r.puntuacion AS usuario_calificacion, 
             p.estadoParaUsuario AS estado
    `;

    console.log(`🟡 Ejecutando consulta con título: '${normalizedTitulo}'`);

    const result = await session.run(query, { normalizedTitulo });

    if (result.records.length === 0) {
      console.error("❌ Película no encontrada en Neo4j:", titulo);
      return res.status(404).json({ error: "Película no encontrada" });
    }

    console.log(`✅ Película encontrada en Neo4j: '${titulo}'`);

    const movie = result.records[0];

    res.json({
      titulo: movie.get("titulo"),
      anio: movie.get("anio") ? movie.get("anio").low : "Desconocido",
      calificacion: movie.get("calificacion") || "Sin calificación",
      popularidad: movie.get("popularidad") || 0,
      generos: movie.get("generos"),
      director: movie.get("director") || "Desconocido",
      actores: movie.get("actores") || [],
      sinopsis: movie.get("sinopsis") || "Sinopsis no disponible",
      usuario_calificacion: movie.get("usuario_calificacion"),
      estado: movie.get("estado") || "No visto"
    });

  } catch (error) {
    console.error("❌ Error en /movie/:titulo:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});


// PUT: Actualizar la calificación y el estado de visualización de la película
app.put("/movie/:titulo", async (req, res) => {
  const { titulo } = req.params;
  const { visto, calificacion, usuarioNombre } = req.body; // Recibimos el estado de si se vio y la calificación
  console.log(`📩 Actualizando película: '${titulo}'`);

  const session = driver.session();
  try {
    const query = `
      MATCH (u:Usuario)-[r:CALIFICA]->(p:Película)
      WHERE p.titulo = $titulo AND u.nombre = $usuarioNombre
      SET p.estadoParaUsuario = CASE WHEN $visto = true THEN 'Visto' ELSE p.estadoParaUsuario END,
          r.puntuacion = $calificacion
      RETURN p.titulo AS titulo, p.estadoParaUsuario AS estado, r.puntuacion AS calificacion
    `;

    console.log(`🟡 Ejecutando actualización para: '${titulo}'`);

    const result = await session.run(query, { titulo, visto, calificacion, usuarioNombre });

    if (result.records.length === 0) {
      console.error("❌ No se pudo actualizar la película:", titulo);
      return res.status(404).json({ error: "No se pudo actualizar la película" });
    }

    console.log(`✅ Película actualizada correctamente: '${titulo}'`);

    const updatedMovie = result.records[0];
    res.json({
      titulo: updatedMovie.get("titulo"),
      estado: updatedMovie.get("estado"),
      calificacion: updatedMovie.get("calificacion") || "No calificada",
    });

  } catch (error) {
    console.error("❌ Error al actualizar película:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});




app.get("/", (req, res) => {
    res.send("Servidor funcionando correctamente 🚀");
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
