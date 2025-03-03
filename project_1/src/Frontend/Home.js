import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

    // Obtener recomendaciones personalizadas del usuario
    axios.get(`http://localhost:5000/recommendations/${userEmail}`)
      .then(response => {
        setRecommendedMovies(response.data);
      })
      .catch(error => {
        console.error("Error al obtener recomendaciones:", error);
      });

    // Obtener el top global de películas más populares
    axios.get("http://localhost:5000/top-movies")
      .then(response => {
        setTopMovies(response.data);
      })
      .catch(error => {
        console.error("Error al obtener top de películas:", error);
      })
      .finally(() => setLoading(false));

  }, [userEmail, navigate]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>🎬 Bienvenido a tu página de recomendaciones</h1>

      {loading ? (
        <p>⏳ Cargando recomendaciones...</p>
      ) : (
        <>
          <h2>📌 Películas Recomendadas para Ti</h2>
          {recommendedMovies.length > 0 ? (
            <ul>
              {recommendedMovies.map((movie, index) => (
                <li key={index} style={{ marginBottom: "10px" }}>
                  🎥 {movie.title} - ⭐ Relevancia: {movie.relevancia}
                </li>
              ))}
            </ul>
          ) : (
            <p>⚠️ No hay recomendaciones disponibles. ¿Seleccionaste géneros?</p>
          )}

          <h2>🏆 Top Global de Películas</h2>
          {topMovies.length > 0 ? (
            <ul>
              {topMovies.map((movie, index) => (
                <li key={index} style={{ marginBottom: "10px" }}>
                  🌟 {movie.title} - 📊 Popularidad: {movie.popularidad}
                </li>
              ))}
            </ul>
          ) : (
            <p>⚠️ No hay películas populares disponibles.</p>
          )}
        </>
      )}

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => navigate("/genre-selection")} style={{ marginRight: "10px", padding: "10px", fontSize: "16px" }}>
          🔄 Actualizar Preferencias
        </button>
        <button onClick={() => {
          localStorage.removeItem("userEmail");
          navigate("/login");
        }} style={{ padding: "10px", fontSize: "16px" }}>
          🚪 Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export default Home;
