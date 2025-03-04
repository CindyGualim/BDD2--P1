import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000"; // Asegúrate de usar el puerto correcto

function MovieDetails() {
  const { titulo } = useParams();
  const [movie, setMovie] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_URL}/movie/${encodeURIComponent(titulo)}`)
      .then(response => {
        const data = response.data;
        
        // 🛠️ Convertimos valores que podrían ser objetos {low, high}
        const fixedData = {
          ...data,
          anio: typeof data.anio === "object" ? data.anio.low : data.anio,
          calificacion: typeof data.calificacion === "object" ? data.calificacion.low : data.calificacion,
          popularidad: typeof data.popularidad === "object" ? data.popularidad.low : data.popularidad
        };
  
        setMovie(fixedData);
      })
      .catch(error => {
        console.error("❌ Error al obtener la película:", error);
      });
  }, [titulo]);
  

  if (!movie) return <p>📌 Cargando información de la película...</p>;

  return (
    <div>
      <h1>{movie.titulo} ({movie.anio || "Desconocido"})</h1>
      <p><strong>🎭 Géneros:</strong> {movie.generos && movie.generos.length > 0 ? movie.generos.join(", ") : "No disponible"}</p>
      <p><strong>🎬 Director:</strong> {movie.director || "Desconocido"}</p>
      <p><strong>⭐ Calificación:</strong> {movie.calificacion ? `${movie.calificacion}/10` : "No calificada"}</p>
      <p><strong>🔥 Popularidad:</strong> {movie.popularidad !== undefined ? movie.popularidad : "No disponible"}</p>
      <button onClick={() => navigate(-1)}>🔙 Volver</button>
    </div>
  );
  
}

export default MovieDetails;
