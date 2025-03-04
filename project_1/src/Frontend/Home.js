import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/home.css"; // Importar estilos

function Home() {
  const [recommendedMovies, setRecommendedMovies] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Obtener el email del usuario autenticado
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userEmail) {
      alert("Error: No hay usuario autenticado. Por favor, inicia sesión.");
      navigate("/login");
      return;
    }

    // Obtener recomendaciones personalizadas
    axios.get(`http://localhost:5000/recommendations/${userEmail}`)
      .then(response => setRecommendedMovies(response.data))
      .catch(error => console.error("Error al obtener recomendaciones:", error));

    // Obtener el top global de películas más populares
    axios.get("http://localhost:5000/top-movies")
      .then(response => {
        console.log("🏆 Top películas recibidas:", response.data);
        setTopMovies(response.data);
      })
      .catch(error => console.error("❌ Error al obtener top de películas:", error))
      .finally(() => setLoading(false));

  }, [userEmail, navigate]);

  return (
    <div className="home-container">
      <h1>🎬 Bienvenido a tu página de recomendaciones</h1>

      {loading ? (
        <p className="loading-text">⏳ Cargando recomendaciones...</p>
      ) : (
        <>
          {/* Sección de recomendaciones */}
          <h2>📌 Películas Recomendadas para Ti</h2>
          {recommendedMovies.length > 0 ? (
            <div className="movie-grid">
              {recommendedMovies.map((movie, index) => (
                <div key={index} className="movie-card">
                  <h3>{movie.title}</h3>
                  <p>⭐ Relevancia: {movie.relevancia}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">⚠️ No hay recomendaciones disponibles. ¿Seleccionaste géneros?</p>
          )}

          {/* Sección del top global */}
          <h2>🏆 Top Global de Películas</h2>
          {topMovies.length > 0 ? (
            <div className="movie-grid">
              {topMovies.map((movie, index) => (
                <div key={index} className="movie-card">
                  <h3>{movie.title}</h3>
                  <p>📊 Popularidad: {movie.popularidad}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-message">⚠️ No hay películas populares disponibles.</p>
          )}
        </>
      )}

      {/* Botones de acción */}
      <div className="buttons-container">
        <button className="update-button" onClick={() => navigate("/genre-selection")}>
          🔄 Actualizar Preferencias
        </button>
        <button className="logout-button" onClick={() => {
          localStorage.removeItem("userEmail");
          navigate("/login");
        }}>
          🚪 Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export default Home;
