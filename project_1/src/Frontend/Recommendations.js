import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/rec.css"; // Importar el CSS

function Recommendations() {
  const [personalized, setPersonalized] = useState([]);
  const [global, setGlobal] = useState([]);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userEmail) {
      console.error("❌ No hay usuario autenticado. Redirigiendo...");
      navigate("/");
      return;
    }

    axios.get(`http://localhost:5000/recommendations/${userEmail}`)
      .then((response) => {
        console.log("📌 Respuesta del backend (recomendaciones):", response.data);
        setPersonalized(response.data);
      })
      .catch((error) => console.error("❌ Error al obtener recomendaciones:", error));

    axios.get(`http://localhost:5000/top-movies`)
      .then((response) => {
        console.log("🔥 Respuesta del backend (Top Global):", response.data);
        setGlobal(response.data);
      })
      .catch((error) => console.error("❌ Error al obtener top global:", error));
  }, [userEmail, navigate]);

  const handleMovieClick = (titulo) => {
    navigate(`/movie/${encodeURIComponent(titulo)}`);
  };

  return (
    <div className="recommendations-container">
      <h1>🎬 Películas Recomendadas</h1>

      {/* Sección de recomendaciones personalizadas */}
      <h2>📌 Basado en tus gustos</h2>
      {personalized.length > 0 ? (
        <div className="movies-grid">
          {personalized.map((movie, index) => (
            <div key={index} className="movie-card" onClick={() => handleMovieClick(movie.title)}>
              <h3>{movie.title}</h3>
              <p>🎯 Relevancia: {movie.relevancia}</p>
              <p>🎭 Géneros: {movie.generosCoincidentes?.join(", ")}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-message">⚠️ No hay recomendaciones personalizadas disponibles.</p>
      )}

      {/* Sección del top global */}
      <h2>🔥 Top Global</h2>
      {global.length > 0 ? (
        <div className="movies-grid">
          {global.map((movie, index) => (
            <div key={index} className="movie-card" onClick={() => handleMovieClick(movie.title)}>
              <h3>{movie.title}</h3>
              <p>🌎 Popularidad: {movie.popularidad}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-message">📌 No hay películas populares disponibles.</p>
      )}

      <button className="back-button" onClick={() => navigate("/dashboard")}>🔙 Volver al Perfil</button>
    </div>
  );
}

export default Recommendations;
