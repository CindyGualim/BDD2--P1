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

  const handleMovieClick = (title) => {
    navigate(`/movie/${encodeURIComponent(title)}?email=${userEmail}`);
  };

  return (
    <div className="recommendations-container">
      <div className="navigation-buttons">
        <button onClick={() => navigate("/home")} className="nav-button">Home</button>
        <button onClick={() => navigate("/director")} className="nav-button">Director</button>
        <button onClick={() => navigate("/actor")} className="nav-button">Actor</button>
        <button onClick={() => navigate("/follow-director")} className="nav-button">Follow Director</button>
        <button onClick={() => navigate("/rate-movie")} className="nav-button">Rate Movie</button>
      </div>
      <h1>🎬 Películas Recomendadas</h1>

      <h2>📌 Basado en tus gustos</h2>
      <div className="movies-grid">
        {personalized.map((movie, index) => (
          <div key={index} className="movie-card" onClick={() => handleMovieClick(movie.title)}>
            <h3>{movie.title}</h3>
            <p>🎯 Relevancia: {movie.relevancia}</p>
            <p>🎭 Géneros: {movie.generosCoincidentes?.join(", ")}</p>
          </div>
        ))}
      </div>

      <h2>🔥 Top Global</h2>
      <div className="movies-grid">
        {global.map((movie, index) => (
          <div key={index} className="movie-card" onClick={() => handleMovieClick(movie.title)}>
            <h3>{movie.title}</h3>
            <p>⭐ Promedio: {movie.promedioCalificacion}</p>
            <p>📊 Total Calificaciones: {movie.totalCalificaciones}</p>
          </div>
        ))}
      </div>

      <h2>🎞️ Historial de Películas Vistas</h2>
      <div className="movies-grid">
        {watchedMovies.length > 0 ? (
          watchedMovies.map((movie, index) => (
            <div key={index} className="movie-card" onClick={() => handleMovieClick(movie.title)}>
              <h3>{movie.title}</h3>
              <p>📅 Vista el: {movie.watchedDate}</p>
              <p>🎭 Géneros: {movie.genres?.join(", ") || "No disponibles"}</p>
              <p>⭐ Calificación: {movie.rating}/10</p>
            </div>
          ))
        ) : (
          <p className="empty-message">📌 No hay películas vistas aún.</p>
        )}
      </div>

      <h2>🔁 Volver a ver</h2>
      <div className="movies-grid">
        {reWatchMovies.map((movie, index) => (
          <div key={index} className="movie-card" onClick={() => handleMovieClick(movie.title)}>
            <h3>{movie.title}</h3>
            <p>⭐ Calificación: {movie.rating}/10</p>
            <p>🎭 Géneros: {movie.genres?.join(", ") || "No disponibles"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Recommendations;
