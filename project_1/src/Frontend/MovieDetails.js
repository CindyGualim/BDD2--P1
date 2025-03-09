import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function MovieDetails() {
  const { titulo } = useParams();
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        // Enviamos el email como query param para que el backend sepa quién es el usuario
        const response = await axios.get(
          `http://localhost:5000/movie/${encodeURIComponent(titulo)}?email=${encodeURIComponent(userEmail)}`
        );
        setMovie(response.data);
      } catch (error) {
        console.error("Error al obtener datos de la película:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMovie();
  }, [titulo, userEmail]);

  const handleMarkAsWatched = async () => {
    try {
      await axios.post("http://localhost:5000/mark-as-watched", {
        email: userEmail,
        movieTitle: movie.titulo,
      });
      setMovie((prev) => ({ ...prev, estado: "Visto" }));
    } catch (error) {
      console.error("Error al marcar la película como vista:", error);
    }
  };

  // Ahora pasamos también el email como query param para la pantalla de reseñas
  const handleGoToReview = () => {
    navigate(`/review/${encodeURIComponent(movie.titulo)}?email=${encodeURIComponent(userEmail)}`);
  };

  if (loading) {
    return <div style={{ color: "#fff" }}>Cargando datos de la película...</div>;
  }

  if (!movie) {
    return <div style={{ color: "#fff" }}>No se encontró la película.</div>;
  }

  // Manejo de fecha simple si tuvieras "fechaLanzamiento" real
  let fechaFormateada = "Sin fecha";
  if (movie.fechaLanzamiento) {
    try {
      const dateObj = new Date(movie.fechaLanzamiento);
      fechaFormateada = dateObj.toLocaleDateString("es-ES");
    } catch (e) {
      fechaFormateada = movie.fechaLanzamiento.toString();
    }
  }

  return (
    <div style={{ color: "#fff", backgroundColor: "#000", minHeight: "100vh", padding: "1rem" }}>
      <h1>
        {movie.titulo} ({fechaFormateada})
      </h1>

      <p>
        <strong>Géneros asociados:</strong>{" "}
        {movie.generosAsociados?.join(", ") || "No especificados"}
      </p>
      <p><strong>Actores:</strong> {movie.actores?.join(", ") || "Sin información"}</p>
      <p><strong>Director:</strong> {movie.director || "Desconocido"}</p>
      <p><strong>Estado:</strong> {movie.estado || "No visto"}</p>
      <p><strong>Público objetivo:</strong> {movie.publicoObjetivo || "Desconocido"}</p>
      <p><strong>Formato:</strong> {movie.formato || "No definido"}</p>

      {movie.estado === "Visto" ? (
        <button
          onClick={handleGoToReview}
          style={{
            backgroundColor: "yellow",
            border: "none",
            padding: "0.7rem 1rem",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Ver reseña
        </button>
      ) : (
        <button
          onClick={handleMarkAsWatched}
          style={{
            backgroundColor: "yellow",
            border: "none",
            padding: "0.7rem 1rem",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Marcar como visto
        </button>
      )}
    </div>
  );
}

export default MovieDetails;
