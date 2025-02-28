require("dotenv").config();
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
    const result = await session.run("MATCH (u:User) RETURN u");
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
  const { email, password } = req.body;
  const session = driver.session();

  try {
    if (!email || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Verificar si el usuario ya existe
    const existingUser = await session.run("MATCH (u:User {email: $email}) RETURN u", { email });

    if (existingUser.records.length > 0) {
      return res.status(400).json({ message: "El usuario ya está registrado" });
    }

    // Si no existe, crear el usuario
    await session.run("CREATE (u:User {email: $email, password: $password}) RETURN u", { email, password });

    res.status(201).json({ message: "Usuario registrado con éxito" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

// POST: Login de usuario
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const session = driver.session();

  try {
    const result = await session.run("MATCH (u:User {email: $email, password: $password}) RETURN u", { email, password });

    if (result.records.length === 0) {
      return res.status(401).json({ message: "Credenciales inválidas" });
    }

    res.json({ message: "Inicio de sesión exitoso", user: result.records[0].get("u").properties });
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
    const result = await session.run("MATCH (g:Genre) RETURN g.name AS name");
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
    const result = await session.run("MATCH (d:Director) RETURN d.name AS name");
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
    const result = await session.run("MATCH (a:Actor) RETURN a.name AS name");
    const actors = result.records.map(record => record.get("name"));
    res.json(actors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  } finally {
    await session.close();
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
