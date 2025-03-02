import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  // 🔥 Agregamos estados que faltaban
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState(""); 
  const [errorMessage, setErrorMessage] = useState(""); 

  const navigate = useNavigate(); // 🔥 useNavigate() correctamente definido

  const handleLogin = async (event) => {
    event.preventDefault();
  
    if (!email || !password) {
      setErrorMessage("Por favor, ingrese sus credenciales.");
      return;
    }
  
    try {
      const response = await axios.post("http://localhost:5000/login", {
        email,
        password,
      });
  
      if (response.status === 200) {
        alert("Inicio de sesión exitoso");
        navigate("/dashboard"); // Redirige a otra página después de loguearse
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setErrorMessage("Correo o contraseña incorrectos.");
      } else {
        setErrorMessage("Error en el servidor. Intente nuevamente.");
      }
    }
  };

  return (
    <div>
      <h1>Iniciar Sesión</h1>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
      <form onSubmit={handleLogin}>
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
        <button type="submit">Ingresar</button>
      </form>
      <button onClick={() => navigate("/register")}>Ir a Registro</button>
    </div>
  );
}

export default Login;
