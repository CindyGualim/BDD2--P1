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

// Middleware para manejar sesiones de Neo4j
app.use((req, res, next) => {
  req.session = driver.session();
  next();
});

// Middleware para cerrar sesiones de Neo4j
app.use((req, res, next) => {
  res.on("finish", () => {
    if (req.session) {
      req.session.close();
    }
  });
  next();
});

// Operación CREATE: Crear un nodo con 1 label
app.post("/create-node-single-label", async (req, res) => {
  const { label, properties } = req.body;
  try {
    const result = await req.session.run(
      `CREATE (n:${label} $props) RETURN n`,
      { props: properties }
    );
    res.status(201).json(result.records[0].get("n").properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Operación CREATE: Crear un nodo con 2+ labels
app.post("/create-node-multiple-labels", async (req, res) => {
  const { labels, properties } = req.body;
  try {
    const labelString = labels.join(":");
    const result = await req.session.run(
      `CREATE (n:${labelString} $props) RETURN n`,
      { props: properties }
    );
    res.status(201).json(result.records[0].get("n").properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Operación CREATE: Crear un nodo con 5+ propiedades
app.post("/create-node-with-properties", async (req, res) => {
  const { label, properties } = req.body;
  try {
    const result = await req.session.run(
      `CREATE (n:${label} $props) RETURN n`,
      { props: properties }
    );
    res.status(201).json(result.records[0].get("n").properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Operación READ: Consultar 1 nodo
app.get("/get-node/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await req.session.run(
      `MATCH (n) WHERE ID(n) = $id RETURN n`,
      { id: parseInt(id) }
    );
    if (result.records.length === 0) {
      return res.status(404).json({ message: "Nodo no encontrado" });
    }
    res.json(result.records[0].get("n").properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Operación READ: Consultar muchos nodos
app.get("/get-nodes", async (req, res) => {
  const { label } = req.query;
  try {
    const query = label ? `MATCH (n:${label}) RETURN n` : `MATCH (n) RETURN n`;
    const result = await req.session.run(query);
    const nodes = result.records.map(record => record.get("n").properties);
    res.json(nodes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Operación UPDATE: Agregar propiedades a un nodo
app.put("/add-properties/:id", async (req, res) => {
  const { id } = req.params;
  const { properties } = req.body;
  try {
    const result = await req.session.run(
      `MATCH (n) WHERE ID(n) = $id SET n += $props RETURN n`,
      { id: parseInt(id), props: properties }
    );
    res.json(result.records[0].get("n").properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Operación UPDATE: Actualizar propiedades de un nodo
app.put("/update-properties/:id", async (req, res) => {
  const { id } = req.params;
  const { properties } = req.body;
  try {
    const result = await req.session.run(
      `MATCH (n) WHERE ID(n) = $id SET n = $props RETURN n`,
      { id: parseInt(id), props: properties }
    );
    res.json(result.records[0].get("n").properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Operación DELETE: Eliminar propiedades de un nodo
app.put("/remove-properties/:id", async (req, res) => {
  const { id } = req.params;
  const { properties } = req.body;
  try {
    const result = await req.session.run(
      `MATCH (n) WHERE ID(n) = $id REMOVE n.${properties.join(", n.")} RETURN n`,
      { id: parseInt(id) }
    );
    res.json(result.records[0].get("n").properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Operación CREATE: Crear una relación entre 2 nodos con propiedades
app.post("/create-relationship", async (req, res) => {
  const { fromId, toId, type, properties } = req.body;
  try {
    const result = await req.session.run(
      `MATCH (a), (b) WHERE ID(a) = $fromId AND ID(b) = $toId
       CREATE (a)-[r:${type} $props]->(b) RETURN r`,
      { fromId: parseInt(fromId), toId: parseInt(toId), props: properties }
    );
    res.status(201).json(result.records[0].get("r").properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Operación UPDATE: Agregar propiedades a una relación
app.put("/add-relationship-properties", async (req, res) => {
  const { fromId, toId, type, properties } = req.body;
  try {
    const result = await req.session.run(
      `MATCH (a)-[r:${type}]->(b) WHERE ID(a) = $fromId AND ID(b) = $toId
       SET r += $props RETURN r`,
      { fromId: parseInt(fromId), toId: parseInt(toId), props: properties }
    );
    res.json(result.records[0].get("r").properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Operación DELETE: Eliminar una relación
app.delete("/delete-relationship", async (req, res) => {
  const { fromId, toId, type } = req.body;
  try {
    await req.session.run(
      `MATCH (a)-[r:${type}]->(b) WHERE ID(a) = $fromId AND ID(b) = $toId DELETE r`,
      { fromId: parseInt(fromId), toId: parseInt(toId) }
    );
    res.json({ message: "Relación eliminada correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Operación DELETE: Eliminar un nodo
app.delete("/delete-node/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await req.session.run(
      `MATCH (n) WHERE ID(n) = $id DETACH DELETE n`,
      { id: parseInt(id) }
    );
    res.json({ message: "Nodo eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Operación DELETE: Eliminar múltiples nodos
app.delete("/delete-nodes", async (req, res) => {
  const { ids } = req.body;
  try {
    await req.session.run(
      `MATCH (n) WHERE ID(n) IN $ids DETACH DELETE n`,
      { ids: ids.map(id => parseInt(id)) }
    );
    res.json({ message: "Nodos eliminados correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


//   GET: Obtener todos los usuarios
app.get("/users", async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run("MATCH (u:Usuario) RETURN u LIMIT 15");
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
    console.error(" Error en el registro:", error);
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
  console.log(" Datos recibidos en el backend:", email, genres); // Agregado para verificar

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
      console.log(` Creando relación entre ${email} y ${genre}`); // Agregado para verificar
      await session.run(
        "MATCH (u:Usuario {email: $email}), (g:Genero {nombre: $genre}) CREATE (u)-[:GUSTA]->(g)",
        { email, genre }
      );
    }

    res.status(200).json({ message: "Preferencias guardadas con éxito" });
  } catch (error) {
    console.error("  Error en /save-preferences:", error);
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
    console.error("  Error en la consulta de top de películas:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});


// GET: Obtener recomendaciones de películas basadas en los géneros preferidos del usuario
app.get("/recommendations/:email", async (req, res) => {
  const { email } = req.params;
  console.log(`  Recibiendo solicitud de recomendaciones personalizadas para: ${email}`);
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

    console.log("  Datos enviados al frontend (Recomendaciones Personalizadas):", JSON.stringify(personalizedRecommendations, null, 2));
    res.json(personalizedRecommendations);
  } catch (error) {
    console.error("  Error en la consulta de recomendaciones personalizadas:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

// GET: Obtener detalles de una película por su título
app.get("/movie/:titulo", async (req, res) => {
  let { titulo } = req.params;
  console.log(`  Buscando información de la película: '${titulo}'`);

  const normalizedTitulo = titulo.trim();
  console.log(`Título normalizado recibido en el backend: '${normalizedTitulo}'`);

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

    console.log(`Ejecutando consulta con título: '${normalizedTitulo}'`);

    const result = await session.run(query, { normalizedTitulo });

    if (result.records.length === 0) {
      console.error("  Película no encontrada en Neo4j:", titulo);
      return res.status(404).json({ error: "Película no encontrada" });
    }

    console.log(`   Película encontrada en Neo4j: '${titulo}'`);

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
    console.error("  Error en /movie/:titulo:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});




//   Ruta para marcar una película como vista
app.post("/mark-as-watched", async (req, res) => {
  const { email, movieTitle } = req.body;
  const session = driver.session();

  try {
    await session.run(
      `MATCH (u:Usuario {email: $email}), (p:Película {titulo: $movieTitle})
       MERGE (u)-[:VIO {fecha: date()}]->(p)`,
      { email, movieTitle }
    );

    res.status(200).json({ message: "Película marcada como vista" });
  } catch (error) {
    console.error("  Error al marcar película como vista:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

//   GET: Obtener historial de películas vistas correctamente
app.get("/watched-movies/:email", async (req, res) => {
  const { email } = req.params;
  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (u:Usuario {email: $email})-[v:VIO]->(p:Película)
       OPTIONAL MATCH (p)-[:PERTENECE_A]->(g:Genero)
       OPTIONAL MATCH (u)-[r:CALIFICA]->(p)
       RETURN 
          p.titulo AS title, 
          v.fecha AS watchedDate, 
          COLLECT(DISTINCT g.nombre) AS genres,  
          COALESCE(r.puntuacion, 0) AS rating
       ORDER BY v.fecha DESC`,
      { email }
    );

    const watchedMovies = result.records.map(record => {
      const watchedDate = record.get("watchedDate");
      const formattedDate = watchedDate
        ? `${watchedDate.year.low}-${String(watchedDate.month.low).padStart(2, "0")}-${String(watchedDate.day.low).padStart(2, "0")}`
        : "Fecha desconocida";

      const ratingValue = record.get("rating");
      const rating = (ratingValue && ratingValue.low !== undefined)
        ? ratingValue.low
        : ratingValue || 0;

      return {
        title: record.get("title"),
        genres: record.get("genres").length > 0 ? record.get("genres") : ["No disponibles"],
        watchedDate: formattedDate,
        rating
      };
    });

    res.json(watchedMovies);
  } catch (error) {
    console.error("  Error al obtener historial de películas vistas:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});


/// ¡Solo dejar esta!
app.put("/movie/:titulo", async (req, res) => {
  const { titulo } = req.params;
  const { email, calificacion } = req.body;
  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (u:Usuario {email: $email}), (p:Película {titulo: $titulo})
       MERGE (u)-[r:CALIFICA]->(p)
       SET r.puntuacion = $calificacion
       RETURN r.puntuacion AS nuevaCalificacion`,
      { email, titulo, calificacion }
    );

    res.json({ message: "   Calificación guardada correctamente", calificacion });
  } catch (error) {
    console.error("  Error al actualizar la calificación:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});



//   GET: Obtener películas recomendadas para "Volver a ver" según calificación alta
app.get("/re-watch-movies/:email", async (req, res) => {
  const { email } = req.params;
  const session = driver.session();

  try {
    const result = await session.run(
      `MATCH (u:Usuario {email: $email})-[r:CALIFICA]->(p)
       WHERE r.puntuacion >= 7
       RETURN p.titulo AS title, p.generos AS genres, r.puntuacion AS rating
       ORDER BY r.puntuacion DESC`,
      { email }
    );

    const reWatchMovies = result.records.map(record => ({
      title: record.get("title"),
      genres: record.get("genres") || [],
      rating: record.get("rating").low || 0,
    }));

    res.json(reWatchMovies);
  } catch (error) {
    console.error("  Error al obtener películas para volver a ver:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

//   GET: Obtener películas similares a una ya vista
app.get("/similar-movies/:title", async (req, res) => {
  const { title } = req.params;
  console.log(`  Buscando películas similares a: '${title}'`);

  const session = driver.session();
  try {
    const query = `
      MATCH (p:Pelicula {titulo: $title})-[:PERTENECE_A]->(g:Genero)
      MATCH (similar:Pelicula)-[:PERTENECE_A]->(g)
      WHERE similar.titulo <> $title
      RETURN DISTINCT similar.titulo AS title, similar.popularidad AS popularidad
      ORDER BY similar.popularidad DESC
      LIMIT 10
    `;

    const result = await session.run(query, { title });

    if (result.records.length === 0) {
      return res.status(404).json({ message: "No se encontraron películas similares." });
    }

    const similarMovies = result.records.map(record => ({
      title: record.get("title"),
      popularidad: record.get("popularidad") ? record.get("popularidad").toNumber() : 0,
    }));

    console.log(`   Películas similares encontradas: ${JSON.stringify(similarMovies, null, 2)}`);
    res.json(similarMovies);
  } catch (error) {
    console.error("  Error en la consulta de películas similares:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

app.get("/recommended-by-rating/:email", async (req, res) => {
  const { email } = req.params;
  const session = driver.session();

  try {
    const query = `
      MATCH (u:Usuario {email: $email})-[:GUSTA]->(g:Genero)
      MATCH (p:Película)-[:PERTENECE_A]->(g)
      MATCH (p)<-[r:CALIFICA]-(otherUser)
      WHERE otherUser.email <> $email AND r.puntuacion >= 7
      RETURN p.titulo AS title, AVG(r.puntuacion) AS avgRating, COLLECT(DISTINCT g.nombre) AS genres
      ORDER BY avgRating DESC
      LIMIT 10;
    `;

    const result = await session.run(query, { email });

    const recommendations = result.records.map(record => ({
      title: record.get("title"),
      avgRating: record.get("avgRating") ? record.get("avgRating").toFixed(1) : "N/A",
      genres: record.get("genres"),
    }));

    res.json(recommendations);
  } catch (error) {
    console.error("Error en la consulta de recomendaciones por calificación:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

app.get("/active-users", async (req, res) => {
  const session = driver.session();

  try {
    const query = `
      MATCH (u:Usuario) 
      WHERE EXISTS(u.ultimaConexion) AND datetime(u.ultimaConexion) >= datetime() - duration({minutes: 30})
      RETURN u.nombre AS name, u.email AS email, u.ultimaConexion AS lastSeen
      ORDER BY u.ultimaConexion DESC;
    `;

    const result = await session.run(query);

    const activeUsers = result.records.map(record => ({
      name: record.get("name"),
      email: record.get("email"),
      lastSeen: record.get("lastSeen"),
    }));

    res.json(activeUsers);
  } catch (error) {
    console.error("Error en la consulta de usuarios activos:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});


app.post("/update-last-seen", async (req, res) => {
  const { email } = req.body;
  const session = driver.session();

  try {
    await session.run(
      "MATCH (u:Usuario {email: $email}) SET u.ultimaConexion = datetime() RETURN u",
      { email }
    );

    res.json({ message: "Última conexión actualizada correctamente." });
  } catch (error) {
    console.error("Error al actualizar última conexión:", error);
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});


app.get("/", (req, res) => {
    res.send("Servidor funcionando correctamente  ");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));