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

app.get("/directors", async (req, res) => {
  const session = driver.session();

  try {
    console.log("📢 Buscando directores en la base de datos...");

    const query = `
      MATCH (d:Director)
      RETURN d.nombre AS name, d.estilo AS estilo, COALESCE(d.premios, 0) AS premios
      ORDER BY premios DESC
      LIMIT 10;
    `;

    const result = await session.run(query);

    const directors = result.records.map(record => ({
      name: record.get("name") || "Desconocido",
      estilo: record.get("estilo") || "No especificado",
      premios: record.get("premios") ? record.get("premios").toNumber() : 0,
    }));

    console.log("✅ Directores encontrados:", directors);
    res.json(directors);
  } catch (error) {
    console.error("❌ Error al obtener directores:", error);
    res.status(500).json({ error: "Error al obtener directores" });
  } finally {
    await session.close();
  }
});



app.get("/actors", async (req, res) => {
  const session = driver.session();
  try {
    console.log("📢 Buscando actores en la base de datos...");

    const query = `
      MATCH (a:Actor)
      OPTIONAL MATCH (a)-[:ACTUO_EN]->(p:Película)
      RETURN 
        a.nombre AS name, 
        a.fechaNacimiento AS fechaNacimiento, 
        a.biografia AS biografia, 
        COLLECT(p.titulo) AS filmografia, 
        COALESCE(a.activo, false) AS activo
    `;

    const result = await session.run(query);

    const actors = result.records.map(record => ({
      name: record.get("name") || "Desconocido",
      fechaNacimiento: record.get("fechaNacimiento") || "No disponible",
      biografia: record.get("biografia") || "No disponible",
      filmografia: record.get("filmografia").filter(title => title), // Evitar valores nulos
      activo: record.get("activo"),
    }));

    console.log("✅ Actores encontrados:", actors);
    res.json(actors);
  } catch (error) {
    console.error("❌ Error al obtener actores:", error);
    res.status(500).json({ error: "Error al obtener actores" });
  } finally {
    await session.close();
  }
});


//   GET: Obtener todas las películas
app.get("/movies", async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run("MATCH (p:Película) RETURN p.titulo AS title, p.popularidad AS popularity");
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

// GET: Obtener el top global de películas basado en calificaciones de usuarios
app.get("/top-movies", async (req, res) => {
  const session = driver.session();

  try {
    const query = `
      MATCH (p:Película)<-[r:CALIFICA]-(u:Usuario)
      RETURN 
        p.titulo AS title, 
        COUNT(r) AS totalCalificaciones,
        AVG(r.puntuacion) AS promedioCalificacion
      ORDER BY promedioCalificacion DESC, totalCalificaciones DESC
      LIMIT 10;
    `;

    const result = await session.run(query);

    const topMovies = result.records.map(record => ({
      title: record.get("title"),
      totalCalificaciones: record.get("totalCalificaciones").toNumber(),
      promedioCalificacion: record.get("promedioCalificacion").toFixed(2),
    }));

    console.log("🔹 Datos enviados al frontend (Top Global basado en calificaciones):", topMovies);
    res.json(topMovies);
  } catch (error) {
    console.error("❌ Error en la consulta de top de películas por calificación:", error);
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
// Nota: estamos asumiendo que recibes el email de tu usuario en req.query.email
// o en req.body.email. Adáptalo a tu caso.
app.get("/movie/:titulo", async (req, res) => {
  const { titulo } = req.params;
  const userEmail = req.query.email || req.body.email;
  const normalizedTitulo = titulo.trim();

  const session = driver.session();
  try {
    const query = `
      MATCH (p:Película {titulo: $normalizedTitulo})
      OPTIONAL MATCH (u:Usuario {email: $userEmail})-[vio:VIO]->(p)
      OPTIONAL MATCH (p)-[:PERTENECE_A]->(g:Genero)
      OPTIONAL MATCH (p)-[:DIRIGIDA_POR]->(d:Director)
      OPTIONAL MATCH (p)-[:ACTUO_EN]-(a:Actor)
      RETURN
         p.titulo AS titulo,
         p.popularidad AS popularidad,
         p.sinopsis AS sinopsis,
         p.fechaLanzamiento AS fechaLanzamiento,
         p.publicoObjetivo AS publicoObjetivo,
         p.formato AS formato,
         COLLECT(DISTINCT g.nombre) AS generosAsociados,
         COLLECT(DISTINCT d.nombre) AS director,
         COLLECT(DISTINCT a.nombre) AS actores,
         CASE WHEN vio IS NOT NULL THEN "Visto" ELSE "No visto" END AS estado
    `;

    const result = await session.run(query, { normalizedTitulo, userEmail });

    if (result.records.length === 0) {
      return res.status(404).json({ error: "Película no encontrada" });
    }

    const record = result.records[0];
    let fechaLanzamiento = record.get("fechaLanzamiento");

    if (fechaLanzamiento) {
      try {
        fechaLanzamiento = new Date(fechaLanzamiento).toISOString().split("T")[0];
      } catch (e) {
        fechaLanzamiento = "Fecha desconocida";
      }
    } else {
      fechaLanzamiento = "Fecha desconocida";
    }

    const response = {
      titulo: record.get("titulo"),
      popularidad: record.get("popularidad") || 0,
      sinopsis: record.get("sinopsis") || "Sinopsis no disponible",
      fechaLanzamiento: fechaLanzamiento,
      publicoObjetivo: record.get("publicoObjetivo") || "Desconocido",
      formato: record.get("formato") || "No definido",
      generosAsociados: record.get("generosAsociados").length ? record.get("generosAsociados") : ["No especificados"],
      director: record.get("director").length ? record.get("director")[0] : "Desconocido",
      actores: record.get("actores").length ? record.get("actores") : ["Sin información"],
      estado: record.get("estado"),
    };

    res.json(response);
  } catch (error) {
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
      MATCH (p:Película {titulo: $title})-[:PERTENECE_A]->(g:Genero)
      MATCH (similar:Película)-[:PERTENECE_A]->(g)
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


//   Devuelve todas las reseñas de la película y si el usuario actual ya calificó.
app.get("/movie-reviews/:title", async (req, res) => {
  const { title } = req.params;
  const userEmail = req.query.email;  
  const session = driver.session();

  try {
    const query = `
      MATCH (p:Película {titulo: $title})<-[:SOBRE]-(r:Reseña)<-[:ESCRIBIO]-(author:Usuario)
      OPTIONAL MATCH (u:Usuario {email: $userEmail})-[cal:CALIFICA]->(p)
      RETURN 
         r.puntuacion AS puntuacion,
         r.fechaReseña AS fechaReseña,
         r.comentario AS comentario,
         COALESCE(r.likes, 0) AS likes,
         r.spoiler AS spoiler,
         author.email AS reviewAuthor,
         author.nombre AS authorName,
         CASE WHEN cal IS NULL THEN false ELSE true END AS userHasRated
    `;

    const result = await session.run(query, { title, userEmail });
    let reviews = [];
    let userHasRated = false;

    for (const record of result.records) {
      const puntuacion = record.get("puntuacion");
      const fechaReseñaObj = record.get("fechaReseña");
      const comentario = record.get("comentario");
      const likes = record.get("likes");
      const spoiler = record.get("spoiler");
      const reviewAuthor = record.get("reviewAuthor");
      const authorName = record.get("authorName") || "Usuario anónimo";
      const rated = record.get("userHasRated");

      // Si en algún registro se detecta que userHasRated = true, lo guardamos
      if (rated) {
        userHasRated = true;
      }

      // Convertir la fecha de objeto a string (YYYY-MM-DD)
      let fechaReseña = "Fecha desconocida";
      if (fechaReseñaObj && fechaReseñaObj.year) {
        fechaReseña = `${fechaReseñaObj.year.low}-${String(fechaReseñaObj.month.low).padStart(2, "0")}-${String(fechaReseñaObj.day.low).padStart(2, "0")}`;
      }

      // Guardamos cada reseña
      reviews.push({
        puntuacion: puntuacion?.low ?? puntuacion,
        fechaReseña,
        comentario: comentario || "",
        likes: likes?.low ?? likes,
        spoiler: !!spoiler,
        reviewAuthor,
        authorName
      });
    }

    return res.json({ reviews, userHasRated });
  } catch (error) {
    console.error("Error en GET /movie-reviews/:title:", error);
    return res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});


// POST /movie-reviews 
//   Crea una nueva reseña (nodo :Reseña) y las relaciones con Usuario y Película.
//   También asigna la relación CALIFICA para guardar puntuación en la relación (opcional).
app.post("/movie-reviews", async (req, res) => {
  const { email, title, puntuacion, comentario, spoiler } = req.body;
  const session = driver.session();

  try {
    // Verificar si la película existe
    const checkMovie = await session.run(
      `OPTIONAL MATCH (p:Película {titulo: $title}) RETURN p`,
      { title }
    );

    if (checkMovie.records.length === 0 || !checkMovie.records[0].get("p")) {
      return res.status(404).json({ message: "Película no encontrada." });
    }

    // Crear la reseña con fecha actual
    const fechaReseña = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const initialLikes = 0;

    const result = await session.run(
      `
      MATCH (u:Usuario {email: $email}), (p:Película {titulo: $title})
      CREATE (r:Reseña {
        puntuacion: $puntuacion,
        fechaReseña: $fechaReseña,
        comentario: $comentario,
        spoiler: $spoiler,
        likes: $initialLikes
      })
      MERGE (u)-[:ESCRIBIO]->(r)
      MERGE (r)-[:SOBRE]->(p)
      MERGE (u)-[c:CALIFICA]->(p)
      SET c.puntuacion = $puntuacion
      RETURN r
      `,
      {
        email,
        title,
        puntuacion: parseInt(puntuacion, 10),
        fechaReseña,
        comentario,
        spoiler: !!spoiler,
        initialLikes
      }
    );

    if (result.records.length === 0) {
      return res.status(400).json({ message: "No se pudo guardar la reseña." });
    }

    return res.json({ message: "Reseña creada correctamente." });
  } catch (error) {
    console.error("Error en POST /movie-reviews:", error);
    return res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});



//   Incrementa la propiedad 'likes' de la reseña indicada
app.post("/movie-reviews/:reviewId/like", async (req, res) => {
  const { reviewId } = req.params;
  const session = driver.session();

  try {
    // reviewId es un numeric ID de Neo4j (ID(r)) o algún otro identificador
    // si estás usando ID(r), asegúrate de que en la creación de la reseña
    // obtengas su ID con 'RETURN r, ID(r) as rId'
    const result = await session.run(
      `
      MATCH (r:Reseña)
      WHERE ID(r) = $reviewId
      SET r.likes = COALESCE(r.likes, 0) + 1
      RETURN r.likes AS newLikes
      `,
      { reviewId: parseInt(reviewId, 10) }
    );

    if (result.records.length === 0) {
      return res.status(404).json({ message: "No se encontró la reseña." });
    }

    const newLikes = result.records[0].get("newLikes");
    return res.json({ newLikes });
  } catch (error) {
    console.error("Error al dar like a la reseña:", error);
    return res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

app.get("/", (req, res) => {
    res.send("Servidor funcionando correctamente  ");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));