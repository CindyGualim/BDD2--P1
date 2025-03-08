import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/MoviesGrid.css";

function ActiveUsers() {
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/active-users")
      .then(response => setUsers(response.data))
      .catch(error => console.error("❌ Error al obtener usuarios activos:", error));
  }, []);

  return (
    <div className="container">
      <h1>🟢 Usuarios Activos</h1>
      {users.length > 0 ? (
        <ul className="user-list">
          {users.map((user, index) => (
            <li key={index} className="user-card">
              <h3>{user.name}</h3>
              <p>📧 {user.email}</p>
              <p>🕒 Última conexión: {new Date(user.lastSeen).toLocaleString()}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="empty-message">⚠️ No hay usuarios activos en este momento.</p>
      )}
      <button className="back-button" onClick={() => navigate("/dashboard")}>🔙 Volver</button>
    </div>
  );
}

export default ActiveUsers;
