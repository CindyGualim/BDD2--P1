import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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

    // Llamada para recomendaciones personalizadas
    axios.get(`http://localhost:5000/recommendations/${userEmail}`)
      .then((response) => {
        console.log("📌 Respuesta del backend (recomendaciones):", response.data);
        const personalizedMovies = response.data.filter(movie => movie.generosCoincidentes.length > 0);
        setPersonalized(personalizedMovies);
      })
      .catch((error) => {
        console.error("❌ Error al obtener recomendaciones:", error);
      });

    // Llamada para el top global de películas
    axios.get(`http://localhost:5000/top-movies`)
      .then((response) => {
        console.log("🔥 Respuesta del backend (Top Global):", response.data);
        setGlobal(response.data);
      })
      .catch((error) => {
        console.error("❌ Error al obtener top global:", error);
      });

  }, [userEmail, navigate]);

  // Función para navegar a la página de detalles
  const handleMovieClick = (titulo) => {
    navigate(`/movie/${encodeURIComponent(titulo)}`);
  };

  return (
    <div>
      <h1>🎬 Películas Recomendadas</h1>

      <h2>📌 Basado en tus gustos</h2>
      {personalized.length > 0 ? (
        <ul>
          {personalized.map((movie, index) => (
            <li 
              key={index} 
              onClick={() => handleMovieClick(movie.title)}
              style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
            >
              {movie.title} - 🎯 Relevancia: {movie.relevancia} - 🎭 Géneros: {movie.generosCoincidentes.join(", ")}
            </li>
          ))}
        </ul>
      ) : (
        <p>⚠️ No hay recomendaciones personalizadas disponibles.</p>
      )}

      <h2>🔥 Top Global</h2>
      {global.length > 0 ? (
        <ul>
          {global.map((movie, index) => (
            <li 
              key={index} 
              onClick={() => handleMovieClick(movie.title)}
              style={{ cursor: "pointer", color: "blue", textDecoration: "underline" }}
            >
              {movie.title} - 🌎 Popularidad: {movie.popularidad}
            </li>
          ))}
        </ul>
      ) : (
        <p>📌 No hay películas populares disponibles.</p>
      )}

      <button onClick={() => navigate("/dashboard")}>🔙 Volver al Perfil</button>
    </div>
  );
}

export default Recommendations;
