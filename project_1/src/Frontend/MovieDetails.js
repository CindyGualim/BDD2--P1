import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000"; // Asegúrate de usar el puerto correcto

function MovieDetails() {
  const { titulo } = useParams();
  const [movie, setMovie] = useState(null);
  const [userRating, setUserRating] = useState(null);  // Para almacenar la calificación del usuario
  const [hasSeen, setHasSeen] = useState(false); // Para verificar si el usuario ya vio la película
  const [usuarioNombre, setUsuarioNombre] = useState("UsuarioEjemplo"); // Aquí debe estar el nombre del usuario
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
        setHasSeen(fixedData.estado === "Visto");
        setUserRating(fixedData.usuario_calificacion); // Si ya hay calificación, la seteamos
      })
      .catch(error => {
        console.error("❌ Error al obtener la película:", error);
      });
  }, [titulo]);

  const handleRatingChange = (newRating) => {
    setUserRating(newRating);
    updateMovieStatus(true, newRating); // Cuando califique, marcamos que ya la vio
  };

  const updateMovieStatus = (visto, calificacion) => {
    axios.put(`${API_URL}/movie/${encodeURIComponent(titulo)}`, { visto, calificacion, usuarioNombre })
      .then(response => {
        console.log("✅ Película actualizada:", response.data);
        setMovie(response.data);
        setHasSeen(true); // Marcar la película como vista
      })
      .catch(error => {
        console.error("❌ Error al actualizar la película:", error);
      });
  };

  const handleMarkAsSeen = () => {
    updateMovieStatus(true, userRating); // Si ya la vio, la marcamos y actualizamos la calificación
  };

  if (!movie) return <p>📌 Cargando información de la película...</p>;

  return (
    <div>
      <h1>{movie.titulo} ({movie.anio || "Desconocido"})</h1>
      <p><strong>🎭 Géneros:</strong> {movie.generos && movie.generos.length > 0 ? movie.generos.join(", ") : "No disponible"}</p>
      <p><strong>🎬 Director:</strong> {movie.director || "Desconocido"}</p>
      <p><strong>⭐ Calificación:</strong> {movie.calificacion ? `${movie.calificacion}/10` : "No calificada"}</p>
      <p><strong>🔥 Popularidad:</strong> {movie.popularidad !== undefined ? movie.popularidad : "No disponible"}</p>
      <p><strong>🎬 Actores principales:</strong> {movie.actores.length > 0 ? movie.actores.join(", ") : "No disponibles"}</p>
      <p><strong>📜 Sinopsis:</strong> {movie.sinopsis}</p>

      {/* Si la película no está vista, mostrar la opción para marcar como vista */}
      {!hasSeen && (
        <div>
          <p><strong>¿Ya viste esta película?</strong></p>
          <button onClick={handleMarkAsSeen}>✅ Marcar como vista</button>
        </div>
      )}

      {/* Si el usuario ha visto la película, habilitar la opción para calificar */}
      {hasSeen && (
        <div>
          <p><strong>¿Te gustó la película? Califica:</strong></p>
          <button onClick={() => handleRatingChange(1)}>1</button>
          <button onClick={() => handleRatingChange(2)}>2</button>
          <button onClick={() => handleRatingChange(3)}>3</button>
          <button onClick={() => handleRatingChange(4)}>4</button>
          <button onClick={() => handleRatingChange(5)}>5</button>
          <button onClick={() => handleRatingChange(6)}>6</button>
          <button onClick={() => handleRatingChange(7)}>7</button>
          <button onClick={() => handleRatingChange(8)}>8</button>
          <button onClick={() => handleRatingChange(9)}>9</button>
          <button onClick={() => handleRatingChange(10)}>10</button>
        </div>
      )}

      <p><strong>Tu calificación:</strong> {userRating ? `${userRating}/10` : "No calificada"}</p>
      <button onClick={() => navigate(-1)}>🔙 Volver</button>
    </div>
  );
}

export default MovieDetails;
