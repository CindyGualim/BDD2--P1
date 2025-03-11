import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/rec.css"; // Asegúrate de que el archivo de estilos existe

function Directors() {
  const [directors, setDirectors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDirectors = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:5000/directors");

        console.log("📢 Datos recibidos del servidor:", response.data);

        if (Array.isArray(response.data)) {
          const topDirectors = response.data
            .map(director => ({
              name: director.name || "Desconocido",
              estilo: director.estilo || "No especificado",
              premios: isNaN(Number(director.premios)) ? 0 : Number(director.premios), // Corrección
            }))
            .sort((a, b) => b.premios - a.premios) // Ordenar de mayor a menor
            .slice(0, 10);

          console.log("🏆 Top 10 directores:", topDirectors);
          setDirectors(topDirectors);
        } else {
          throw new Error("Formato de datos incorrecto en la respuesta del servidor");
        }
      } catch (error) {
        console.error("❌ Error al obtener directores:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDirectors();
  }, []);

  // Manejar clic en director
  const handleDirectorClick = (name) => {
    console.log("🎬 Director clickeado:", name);
    navigate(`/director/${encodeURIComponent(name)}`);
  };

  return (
    <div className="recommendations-container">
      <h1>🎬 Directores Destacados (Top 10 por premios)</h1>

      {/* Estado de carga */}
      {loading && <p className="loading-message">⏳ Cargando directores...</p>}

      {/* Estado de error */}
      {error && <p className="error-message">❌ Error: {error}</p>}

      {/* Listado de directores */}
      {!loading && !error && (
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
      )}
    </div>
  );
}

export default Directors;
