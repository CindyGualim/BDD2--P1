import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/rec.css";

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
      .then(response => setWatchedMovies(response.data))
      .catch(error => console.error("❌ Error al obtener historial:", error));

    axios.get(`http://localhost:5000/re-watch-movies/${userEmail}`)
      .then(response => setReWatchMovies(response.data))
      .catch(error => console.error("❌ Error al obtener volver a ver:", error));
  }, [userEmail]);

  // Función para navegar a MovieDetails.js cuando el usuario hace clic en una película
  const handleMovieClick = (title) => {
    navigate(`/movie/${encodeURIComponent(title)}`);
  };

  return (
    <div className="recommendations-container">
      <h1>🎬 Películas Recomendadas</h1>

      {/* Sección de recomendaciones personalizadas */}
      <h2>📌 Basado en tus gustos</h2>
      <div className="movies-grid">
        {personalized.map((movie, index) => (
          <div 
            key={index} 
            className="movie-card"
            onClick={() => handleMovieClick(movie.title)}
            style={{ cursor: "pointer" }}
          >
            <h3>{movie.title}</h3>
            <p>🎯 Relevancia: {movie.relevancia}</p>
            <p>🎭 Géneros: {movie.generosCoincidentes?.join(", ")}</p>
          </div>
        ))}
      </div>

      {/* Sección del top global */}
      <h2>🔥 Top Global</h2>
      <div className="movies-grid">
        {global.length > 0 ? (
          global.map((movie, index) => (
            <div 
              key={index} 
              className="movie-card"
              onClick={() => handleMovieClick(movie.title)}
              style={{ cursor: "pointer" }}
            >
              <h3>{movie.title}</h3>
              <p>🌎 Popularidad: {movie.popularidad}</p>
            </div>
          ))
        ) : (
          <p className="empty-message">📌 No hay películas populares disponibles.</p>
        )}
      </div>

      {/* Sección de historial de películas vistas */}
      <h2>🎞️ Historial de Películas Vistas</h2>
      <div className="movies-grid">
        {watchedMovies.map((movie, index) => {
          let formattedDate = "Fecha desconocida";
          if (movie.watchedDate && typeof movie.watchedDate === "object") {
            const { year, month, day } = movie.watchedDate;
            formattedDate = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
          }

          return (
            <div 
              key={index} 
              className="movie-card"
              onClick={() => handleMovieClick(movie.title)}
              style={{ cursor: "pointer" }}
            >
              <h3>{movie.title}</h3>
              <p>📅 Vista el: {formattedDate}</p>
              <p>🎭 Géneros: {movie.genres?.join(", ") || "No disponibles"}</p>
            </div>
          );
        })}
      </div>

      {/* Sección de películas recomendadas para "Volver a ver" */}
      <h2>🔄 Volver a Ver</h2>
      <div className="movies-grid">
        {reWatchMovies.map((movie, index) => (
          <div 
            key={index} 
            className="movie-card"
            onClick={() => handleMovieClick(movie.title)}
            style={{ cursor: "pointer" }}
          >
            <h3>{movie.title}</h3>
            <p>⭐ Calificación: {movie.rating}/10</p>
            <p>🎭 Géneros: {movie.genres?.join(", ")}</p>
          </div>
        ))}
      </div>

      <button className="back-button" onClick={() => navigate("/profile")}>
        🔙 Volver al Perfil
      </button>
    </div>
  );
}

export default Recommendations;
