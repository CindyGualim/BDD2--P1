import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function MovieDetails() {
  const { titulo } = useParams();
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [director, setDirector] = useState(null);
  const [actors, setActors] = useState([]);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/movie/${encodeURIComponent(titulo)}?email=${encodeURIComponent(userEmail)}`
        );
        setMovie(response.data);

        // Obtener datos del director
        if (response.data.director) {
          const directorResponse = await axios.get(`http://localhost:5000/directors/${encodeURIComponent(response.data.director)}`);
          setDirector(directorResponse.data);
        }

        // Obtener datos de los actores
        if (response.data.actores && response.data.actores.length > 0) {
          const actorRequests = response.data.actores.map(actor => axios.get(`http://localhost:5000/actors/${encodeURIComponent(actor)}`));
          const actorResponses = await Promise.all(actorRequests);
          setActors(actorResponses.map(res => res.data));
        }
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

  const handleGoToReview = () => {
    navigate(`/review/${encodeURIComponent(movie.titulo)}?email=${encodeURIComponent(userEmail)}`);
  };

  if (loading) {
    return <div style={{ color: "#fff" }}>Cargando datos de la película...</div>;
  }

  if (!movie) {
    return <div style={{ color: "#fff" }}>No se encontró la película.</div>;
  }

  return (
    <div style={{ color: "#fff", backgroundColor: "#000", minHeight: "100vh", padding: "1rem" }}>
      <h1>{movie.titulo} ({movie.fechaLanzamiento || "Sin fecha"})</h1>
      <p><strong>Géneros:</strong> {movie.generosAsociados?.join(", ") || "No especificados"}</p>
      <p><strong>Estado:</strong> {movie.estado || "No visto"}</p>
      <p><strong>Público objetivo:</strong> {movie.publicoObjetivo || "Desconocido"}</p>
      <p><strong>Formato:</strong> {movie.formato || "No definido"}</p>

      {/* Tarjeta del Director */}
      {director && (
        <div style={{ border: "1px solid #fff", padding: "1rem", margin: "1rem 0", borderRadius: "8px", backgroundColor: "#222" }}>
          <h2>Director: {director.name}</h2>
          <p><strong>Estilo:</strong> {director.tematicaRecurrente || "No especificado"}</p>
          <p><strong>Premios:</strong> {director.premios || "No especificados"}</p>
          <p><strong>Películas destacadas:</strong> {director.peliculas?.join(", ") || "No especificadas"}</p>
        </div>
      )}

      {/* Tarjetas de Actores */}
      {actors.length > 0 && (
        <div>
          <h2>Reparto:</h2>
          {actors.map((actor) => (
            <div key={actor.name} style={{ border: "1px solid #fff", padding: "1rem", margin: "1rem 0", borderRadius: "8px", backgroundColor: "#333" }}>
              <h3>{actor.name}</h3>
              <p><strong>Fecha de nacimiento:</strong> {actor.fechaNacimiento?.day?.low}/{actor.fechaNacimiento?.month?.low}/{actor.fechaNacimiento?.year?.low}</p>
              <p><strong>Biografía:</strong> {actor.biografia || "No disponible"}</p>
              <p><strong>Filmografía:</strong> {actor.filmografia?.join(", ") || "No especificada"}</p>
              <p><strong>Estado:</strong> {actor.activo ? "Activo" : "Retirado/Inactivo"}</p>
            </div>
          ))}
        </div>
      )}

      {movie.estado === "Visto" ? (
        <button onClick={handleGoToReview} style={{ backgroundColor: "yellow", border: "none", padding: "0.7rem 1rem", cursor: "pointer", fontWeight: "bold" }}>Ver reseña</button>
      ) : (
        <button onClick={handleMarkAsWatched} style={{ backgroundColor: "yellow", border: "none", padding: "0.7rem 1rem", cursor: "pointer", fontWeight: "bold" }}>Marcar como visto</button>
      )}
    </div>
  );
}

export default MovieDetails;