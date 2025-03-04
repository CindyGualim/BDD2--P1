import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/rec.css"; // ✅ Usamos el CSS existente

const API_URL = "http://localhost:5000";

function MovieDetails() {
  const { titulo } = useParams();
  const [movie, setMovie] = useState(null);
  const [userRating, setUserRating] = useState(null);
  const [hasSeen, setHasSeen] = useState(false);
  const [watchedDate, setWatchedDate] = useState(null);
  const userEmail = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/movie/${encodeURIComponent(titulo)}`)
      .then(response => {
        const data = response.data;
        console.log("📌 Datos de la película recibidos:", data);

        const fixedData = {
          ...data,
          anio: typeof data.anio === "object" ? data.anio.low : data.anio,
          calificacion: typeof data.calificacion === "object" ? data.calificacion.low : data.calificacion,
          popularidad: typeof data.popularidad === "object" ? data.popularidad.low : data.popularidad
        };

        setMovie(fixedData);
        setHasSeen(fixedData.estado === "Visto");
        setUserRating(fixedData.usuario_calificacion || null);

        if (fixedData.watchedDate && typeof fixedData.watchedDate === "object") {
          const { year, month, day } = fixedData.watchedDate;
          setWatchedDate(`${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
        }
      })
      .catch(error => console.error("❌ Error al obtener la película:", error));
  }, [titulo]);

  const handleMarkAsSeen = () => {
    axios.post(`${API_URL}/mark-as-watched`, {
      email: userEmail,
      movieTitle: titulo
    })
    .then(response => {
      console.log("✅ Película marcada como vista:", response.data);
      setHasSeen(true);
      setWatchedDate(new Date().toISOString().split("T")[0]);
      setTimeout(() => navigate("/recommendations"), 1000); // Redirigir después de 1 segundo
    })
    .catch(error => console.error("❌ Error al marcar la película como vista:", error));
  };

  const handleRatingChange = (newRating) => {
    setUserRating(newRating);

    axios.put(`${API_URL}/movie/${encodeURIComponent(titulo)}`, {
      email: userEmail,
      calificacion: newRating
    })
    .then(response => {
      console.log("✅ Calificación actualizada:", response.data);
      setTimeout(() => navigate("/recommendations"), 1000); // Redirigir después de 1 segundo
    })
    .catch(error => console.error("❌ Error al actualizar la calificación:", error));
  };

  if (!movie) return <p>📌 Cargando información de la película...</p>;

  return (
    <div className="recommendations-container">
      <h1 style={{ color: "#ffcc00", fontWeight: "bold" }}>
        {movie.titulo} ({movie.anio || "Desconocido"})
      </h1>

      <p><strong>🎭 Géneros:</strong> {movie.generos?.join(", ") || "No disponible"}</p>
      <p><strong>🎬 Director:</strong> {movie.director || "Desconocido"}</p>
      <p><strong>🔥 Popularidad:</strong> {movie.popularidad || "No disponible"}</p>
      <p><strong>🎬 Actores principales:</strong> {movie.actores?.join(", ") || "No disponibles"}</p>
      <p><strong>📜 Sinopsis:</strong> {movie.sinopsis || "No disponible"}</p>

      {hasSeen && watchedDate && (
        <p><strong>📅 Vista el:</strong> {watchedDate}</p>
      )}

      {/* ✅ Sección para marcar como vista */}
      {!hasSeen && (
        <div>
          <p style={{ color: "#ffcc00", fontSize: "1.2rem" }}>
            ¿Ya viste esta película?
          </p>
          <button 
            onClick={handleMarkAsSeen} 
            className="mark-watched-button">
            Marcar como vista
          </button>
        </div>
      )}

      {/* ✅ Sección para calificar */}
      {hasSeen && (
        <div className="rating-container">
          <span className="rating-box">⭐ Calificación: {userRating ? `${userRating}/10` : "No calificada"}</span>
        </div>
      )}

      {/* ✅ Mostrar botones de calificación si la película ya fue vista */}
      {hasSeen && (
        <div className="rating-buttons">
          {[...Array(10)].map((_, index) => (
            <button 
              key={index + 1} 
              onClick={() => handleRatingChange(index + 1)}
              className="rating-button">
              {index + 1}
            </button>
          ))}
        </div>
      )}

      {/* ✅ Botón de regreso que redirige a Recommendations */}
      <button onClick={() => navigate("/recommendations")} className="back-button">
        🔙 Volver a recomendaciones
      </button>
    </div>
  );
}

export default MovieDetails;
