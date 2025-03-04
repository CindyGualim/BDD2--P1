import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/rec.css"; // ✅ Se usa el CSS correctamente

function Recommendations() {
  const [personalized, setPersonalized] = useState([]);
  const [global, setGlobal] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [reWatchMovies, setReWatchMovies] = useState([]);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userEmail) return;

    axios.get(`http://localhost:5000/recommendations/${userEmail}`)
      .then(response => setPersonalized(response.data))
      .catch(error => console.error("❌ Error al obtener recomendaciones:", error));

    axios.get(`http://localhost:5000/top-movies`)
      .then(response => setGlobal(response.data))
      .catch(error => console.error("❌ Error al obtener top global:", error));

    axios.get(`http://localhost:5000/watched-movies/${userEmail}`)
      .then(response => {
        console.log("🎞️ Historial de películas vistas actualizado:", response.data);
        setWatchedMovies(response.data);
      })
      .catch(error => console.error("❌ Error al obtener historial:", error));

    axios.get(`http://localhost:5000/re-watch-movies/${userEmail}`)
      .then(response => setReWatchMovies(response.data))
      .catch(error => console.error("❌ Error al obtener volver a ver:", error));
  }, [userEmail]);

  const handleMovieClick = (title) => {
    navigate(`/movie/${encodeURIComponent(title)}`);
  };

  return (
    <div className="recommendations-container">
      <h1>🎬 Películas Recomendadas</h1>

      <h2>📌 Basado en tus gustos</h2>
      <div className="movies-grid">
        {personalized.map((movie, index) => (
          <div 
            key={index} 
            className="movie-card"
            onClick={() => handleMovieClick(movie.title)}
          >
            <h3>{movie.title}</h3>
            <p>🎯 Relevancia: {movie.relevancia}</p>
            <p>🎭 Géneros: {movie.generosCoincidentes?.join(", ")}</p>
          </div>
        ))}
      </div>

      <h2>🔥 Top Global</h2>
      <div className="movies-grid">
        {global.map((movie, index) => (
          <div 
            key={index} 
            className="movie-card"
            onClick={() => handleMovieClick(movie.title)}
          >
            <h3>{movie.title}</h3>
            <p>🌎 Popularidad: {movie.popularidad}</p>
          </div>
        ))}
      </div>

      <h2>🎞️ Historial de Películas Vistas</h2>
      <div className="movies-grid">
        {watchedMovies.length > 0 ? (
          watchedMovies.map((movie, index) => {
            let formattedDate = "Fecha desconocida";
            if (movie.watchedDate && typeof movie.watchedDate === "object") {
              const { year, month, day } = movie.watchedDate;
              formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            }

            return (
              <div key={index} className="movie-card">
                <h3>{movie.title}</h3>
                <p>📅 Vista el: {formattedDate}</p>
                <p>🎭 Géneros: {movie.genres?.join(", ") || "No disponibles"}</p>
                <p>⭐ Calificación: {movie.rating ? `${movie.rating}/10` : "No calificada"}</p>
              </div>
            );
          })
        ) : (
          <p className="empty-message">📌 No hay películas vistas aún.</p>
        )}
      </div>

      <button className="back-button" onClick={() => navigate("/profile")}>
        🔙 Volver al Perfil
      </button>
    </div>
  );
}

export default Recommendations;
