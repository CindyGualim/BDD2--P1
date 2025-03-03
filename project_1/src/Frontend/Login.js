import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/log-Reg.css";
import loginBg from "./css/login-pp.png";

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
    <div className="login">
      <img src={loginBg} alt="login background" className="login__img" />
      <form className="login__form" onSubmit={handleLogin}>
        <h1 className="login__title">Iniciar Sesión</h1>
        {errorMessage && <p className="login__error">{errorMessage}</p>}
        
        <div className="login__content">
          <div className="login__box">
            <i className="bx bx-user login__icon"></i>
            <div className="login__box-input">
              <input
                type="email"
                className="login__input"
                placeholder=""
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <label className="login__label">Email</label>
            </div>
          </div>
          
          <div className="login__box">
            <i className="ri-lock-2-line login__icon"></i>
            <div className="login__box-input">
              <input
                type="password"
                className="login__input"
                id="login-pass"
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label className="login__label">Contraseña</label>
            </div>
          </div>
        </div>
        <button type="submit" className="login__button">Ingresar</button>
        <button  type="submit"onClick={() => navigate("/register")} className="login__register">Ir a Registro</button>
      </form>
      
    </div>
  );
};

export default Login;
