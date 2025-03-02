import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setMessage("Por favor, complete todos los campos.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/register", {
        email,
        password,
      });

      if (response.status === 201) {
        setMessage("Escoje tus Generos favoritos...");
        setTimeout(() => {
          navigate("/genre-selection");
        }, 2000);
      }
    } catch (error) {
      setMessage("Error al registrar usuario. Intente de nuevo.");
    }
  };

  return (
    <div>
      <h1>Registro</h1>
      {message && <p>{message}</p>}
      <form onSubmit={handleRegister}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Registrarse</button>
      </form>
      <button onClick={() => navigate("/genre-selection")}>Ir a Login</button>
    </div>
  );
}

export default Register;
