import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/rec.css"; // Asegúrate de que el archivo de estilos existe

function Actors() {
  const [actors, setActors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:5000/actors")
      .then(response => {
        console.log("🎭 Datos de actores recibidos:", response.data);
        setActors(response.data);
      })
      .catch(error => console.error("❌ Error al obtener actores:", error));
  }, []);

  const handleActorClick = (name) => {
    navigate(`/actor/${encodeURIComponent(name)}`);
  };

  return (
    <div className="recommendations-container">
      <h1>🎭 Actores Destacados</h1>

      <div className="movies-grid">
        {actors.length > 0 ? (
          actors.map((actor, index) => (
            <div key={index} className="movie-card" onClick={() => handleActorClick(actor.name)}>
              <h3>{actor.name}</h3>
              <p>
                📅 Nacimiento: {actor.fechaNacimiento && typeof actor.fechaNacimiento === "object"
                  ? `${actor.fechaNacimiento.day?.low}/${actor.fechaNacimiento.month?.low}/${actor.fechaNacimiento.year?.low}`
                  : "Desconocido"}
              </p>


              <p>🎬 Filmografía: {actor.filmografia?.join(", ") || "No disponible"}</p>
              <p>📖 Biografía: {actor.biografia || "No disponible"}</p>
              <p>✅ Activo: {actor.activo ? "Sí" : "No"}</p>
            </div>
          ))
        ) : (
          <p className="empty-message">📌 No hay actores disponibles.</p>
        )}
      </div>
    </div>
  );
}

export default Actors;
