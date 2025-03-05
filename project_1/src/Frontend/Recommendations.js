import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/rec.css";

function Recommendations() {
  const [personalized, setPersonalized] = useState([]);
  const [global, setGlobal] = useState([]);
  const [watchedMovies, setWatchedMovies] = useState([]);
  const [reWatchMovies, setReWatchMovies] = useState([]);
  const [selectedRating, setSelectedRating] = useState({});
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
        setWatchedMovies(response.data);
        const ratings = {};
        response.data.forEach(movie => {
          ratings[movie.title] = movie.rating !== null ? movie.rating : 0;
        });
        setSelectedRating(ratings);
      })
      .catch(error => console.error("❌ Error al obtener historial:", error));

    axios.get(`http://localhost:5000/re-watch-movies/${userEmail}`)
      .then(response => setReWatchMovies(response.data))
      .catch(error => console.error("❌ Error al obtener volver a ver:", error));
  }, [userEmail]);

  const handleMovieClick = (title) => {
    navigate(`/movie/${encodeURIComponent(title)}`);
  };

  const handleSaveRating = async (title) => {
    if (selectedRating[title] === "" || isNaN(selectedRating[title])) return;

    
    try {
      await axios.put("http://localhost:5000/movie/" + encodeURIComponent(title), {
        email: userEmail,
        calificacion: parseInt(selectedRating[title], 10)
      });
      console.log("✅ Calificación guardada para:", title);
    } catch (error) {
      console.error("❌ Error al guardar calificación:", error);
    }
  };

  const handleSaveAndGoBack = async () => {
    const ratingPromises = Object.keys(selectedRating).map((title) =>
      handleSaveRating(title)
    );
  
    try {
      await Promise.all(ratingPromises);
      console.log("✅ Todas las calificaciones han sido guardadas correctamente.");
      navigate("/login");
    } catch (error) {
      console.error("❌ Error al guardar algunas calificaciones:", error);
    }
  };
  

  return (
    <div className="recommendations-container">
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
            <p>🌎 Popularidad: {movie.popularidad}</p>
          </div>
        ))}
      </div>

      <h2>🎞️ Historial de Películas Vistas</h2>
      <div className="movies-grid">
        {watchedMovies.length > 0 ? (
          watchedMovies.map((movie, index) => (
            <div key={index} className="movie-card">
              <h3>{movie.title}</h3>
              <p>📅 Vista el: {movie.watchedDate}</p>
              <p>🎭 Géneros: {movie.genres?.join(", ") || "No disponibles"}</p>
              <p>⭐ Calificación: 
                <input 
                  type="number" 
                  value={selectedRating[movie.title]}
                  onChange={(e) => setSelectedRating({...selectedRating, [movie.title]: e.target.value})}
                  min="0" max="10"
                />
              </p>
            </div>
          ))
        ) : (
          <p className="empty-message">📌 No hay películas vistas aún.</p>
        )}
      </div>

    </div>
  );
}

export default Recommendations;
