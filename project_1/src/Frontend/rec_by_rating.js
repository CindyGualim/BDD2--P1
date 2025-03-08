import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import "../styles/MoviesGrid.css";

function RecommendedByRating() {
  const { email } = useParams();
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:5000/recommended-by-rating/${email}`)
      .then(response => setMovies(response.data))
      .catch(error => console.error("❌ Error al obtener recomendaciones:", error));
  }, [email]);

  return (
    <div className="container">
      <h1>⭐ Recomendaciones Basadas en Calificaciones</h1>
      {movies.length > 0 ? (
        <div className="movies-grid">
          {movies.map((movie, index) => (
            <div key={index} className="movie-card">
              <h3>{movie.title}</h3>
              <p>🎭 Géneros: {movie.genres.join(", ")}</p>
              <p>🌟 Promedio de Calificación: {movie.avgRating}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="empty-message">⚠️ No hay recomendaciones disponibles.</p>
      )}
      <button className="back-button" onClick={() => navigate("/dashboard")}>🔙 Volver</button>
    </div>
  );
}

export default RecommendedByRating;
