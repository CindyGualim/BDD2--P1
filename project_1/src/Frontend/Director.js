import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/rec.css"; // Asegúrate de que el archivo de estilos existe

function Directors() {
  const [directors, setDirectors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDirectors = async () => {
      try {
        const response = await axios.get("http://localhost:5000/directors");
        console.log("Datos recibidos del servidor:", response.data);

        if (Array.isArray(response.data)) {
          const topDirectors = response.data
            .map(director => ({
              name: director.name || "Desconocido",
              estilo: director.estilo || "No especificado",
              premios: Number(director.premios) || 0, // Asegurar que es un número
            }))
            .sort((a, b) => b.premios - a.premios) // Ordenar de mayor a menor
            .slice(0, 10);

          console.log("Top 10 directores:", topDirectors);
          setDirectors(topDirectors);
        } else {
          console.error("❌ Datos de directores no válidos:", response.data);
        }
      } catch (error) {
        console.error("❌ Error al obtener directores:", error);
      }
    };

    fetchDirectors();
  }, []);

  // Manejar clic en director
  const handleDirectorClick = (name) => {
    console.log("Director clickeado:", name);
    navigate(`/director/${encodeURIComponent(name)}`);
  };

  return (
    <div className="recommendations-container">
      <h1>🎬 Directores Destacados (Top 10 por premios)</h1>

      <div className="movies-grid">
        {directors.length > 0 ? (
          directors.map((director, index) => (
            <div key={index} className="movie-card" onClick={() => handleDirectorClick(director.name)}>
              <h3>{director.name}</h3>
              <p>🏆 Premios: {director.premios}</p>
              <p>🎭 Estilo: {director.estilo}</p>
            </div>
          ))
        ) : (
          <p className="empty-message">📌 No hay directores disponibles.</p>
        )}
      </div>
    </div>
  );
}

export default Directors;
