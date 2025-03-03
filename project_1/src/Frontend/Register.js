import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/log-Reg.css";
import registerBg from "./css/login-pp.png";

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
        localStorage.setItem("userEmail", email); // Guardar email en localStorage
        console.log("✅ Email guardado en localStorage:", email);

        setMessage("Escoje tus Géneros favoritos...");
        setTimeout(() => {
          navigate("/genre-selection");
        }, 2000);
      }
    } catch (error) {
      setMessage("Error al registrar usuario. Intente de nuevo.");
    }
  };

  return (
    <div className="login">
      <img src={registerBg} alt="login background" className="login__img" />
      
      <form onSubmit={handleRegister} className="login__form">
      <h1>Registro</h1>
      {message && <p className="login__message">{message}</p>}

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
                placeholder=""
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <label className="login__label">Contraseña</label>
            </div>
          </div>
        </div>
        <button type="submit" className="login__button">Registrarse</button>
        <button  type="submit" onClick={() => navigate("../")} className="login__register">
          Ir a Login
        </button>
      </form>
      <button onClick={() => navigate("/genre-selection")}>Ir a Login</button>
    </div>
  );
}

export default Register;
