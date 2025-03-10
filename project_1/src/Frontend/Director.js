import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/rec.css"; // Asegúrate de incluir estilos adecuados

function Directors() {
  const [directors, setDirectors] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener los directores desde el servidor
    axios.get("http://localhost:5000/directors")
      .then(response => {
        // Log para verificar los datos que se reciben
        console.log("Datos recibidos del servidor:", response.data);

        const personalized = response.data;

        // Procesamos los directores, ordenándolos por premios
        const topDirectors = personalized
          .map((director) => {
            return {
              name: director.name, // Nombre del director
              estilo: director.estilo, // Estilo del director
              premios: director.premios || "No especificados" // Premios del director
            };
          })
          .sort((a, b) => {
            // Ordenamos por la cantidad de premios (de mayor a menor)
            const awardsA = parseInt(a.premios) || 0; // Si no tiene premios, es 0
            const awardsB = parseInt(b.premios) || 0;
            return awardsB - awardsA;
          })
          .slice(0, 10); // Tomamos solo los 10 directores con más premios

        // Log para verificar el resultado de los directores filtrados
        console.log("Top 10 directores:", topDirectors);

        // Establecemos los directores filtrados en el estado
        setDirectors(topDirectors);
      })
      .catch(error => console.error("❌ Error al obtener directores:", error));
  }, []);

  // Función para manejar el clic en un director
  const handleDirectorClick = (name) => {
    console.log("Director clickeado:", name); // Verifica si el nombre está bien
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
