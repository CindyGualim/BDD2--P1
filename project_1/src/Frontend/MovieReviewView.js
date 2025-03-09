import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/MovieReviewView.css";  // (Opcional) Para colocar estilos

function MovieReviewView() {
  const { titulo } = useParams();
  const navigate = useNavigate();

  // Leemos email del localStorage (o podríamos tomarlo de la query)
  const userEmail = localStorage.getItem("userEmail");

  const [reviews, setReviews] = useState([]);
  const [userHasRated, setUserHasRated] = useState(false);

  // Campos para nueva reseña
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [spoiler, setSpoiler] = useState(false);

  // Cargar reseñas de la película
  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titulo]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/movie-reviews/${encodeURIComponent(titulo)}`, {
        params: { email: userEmail },  // Indicamos al backend quién soy
      });
      setReviews(res.data.reviews || []);
      setUserHasRated(res.data.userHasRated || false);
    } catch (error) {
      console.error("Error al obtener reseñas:", error);
    }
  };

  // Asignar valor de estrellas
  const handleStarClick = (starIndex) => {
    setRating(starIndex);
  };

  // Enviar nueva reseña
  const handleCreateReview = async () => {
    if (rating < 1 || rating > 5) {
      alert("Selecciona una puntuación entre 1 y 5 estrellas.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/movie-reviews", {
        email: userEmail,
        title: titulo,
        puntuacion: rating,
        comentario: comment,
        spoiler,
      });

      // Mostramos un alert
      alert(`
Reseña guardada con éxito.

Puntuación: ${rating} estrellas
Comentario: ${comment}
Spoiler?: ${spoiler ? "Sí" : "No"}
`);

      // Redirigir a /recommendations
      navigate("/recommendations");
    } catch (error) {
      console.error("Error al crear la reseña:", error);
      alert("Ocurrió un error al guardar la reseña.");
    }
  };

  // Dar Like
  const handleLike = async (index) => {
    const review = reviews[index];
    if (!review.reviewId) {
      alert("Esta reseña no tiene un ID asignado para poder dar like.");
      return;
    }
    try {
      const res = await axios.post(`http://localhost:5000/movie-reviews/${review.reviewId}/like`);
      const newLikes = res.data.newLikes;
      const updatedReviews = [...reviews];
      updatedReviews[index].likes = newLikes;
      setReviews(updatedReviews);
    } catch (error) {
      console.error("Error al dar like:", error);
    }
  };

  return (
    <div className="review-container">
      <h1>Reseñas de <span className="movie-title">{titulo}</span></h1>

      {/* Si el usuario YA calificó, no mostramos el formulario. */}
      {!userHasRated && (
        <div className="review-form">
          <h2>¿Deseas calificar esta película?</h2>

          <div className="stars">
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={star <= rating ? "star filled" : "star"}
                onClick={() => handleStarClick(star)}
              >
                ★
              </span>
            ))}
          </div>
          <p>{rating} de 5</p>

          <label>Comentario:</label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escribe tu opinión"
          />

          <label>
            <input
              type="checkbox"
              checked={spoiler}
              onChange={(e) => setSpoiler(e.target.checked)}
            />
            ¿Contiene spoilers?
          </label>

          <button className="btn-send" onClick={handleCreateReview}>
            Enviar reseña
          </button>
        </div>
      )}

      <h2>Otras reseñas:</h2>
      {reviews.length === 0 ? (
        <p>No hay reseñas todavía.</p>
      ) : (
        reviews.map((r, idx) => (
          <div className="review-card" key={idx}>
            <div className="stars-display">
              {"★".repeat(r.puntuacion) + "☆".repeat(5 - r.puntuacion)}
            </div>
            <p>Fecha de reseña: {r.fechaReseña}</p>
            <p>Comentario: {r.comentario}</p>
            <p>Likes: {r.likes}</p>
            <p>Spoiler: {r.spoiler ? "Sí" : "No"}</p>
            
            {/* Si la reseña es del usuario actual, lo indicamos */}
            {r.reviewAuthor === userEmail ? (
              <p>Autor: Tú (esta es tu reseña)</p>
            ) : (
              <p>Autor: {r.authorName} ({r.reviewAuthor})</p>
            )}

            <button className="btn-like" onClick={() => handleLike(idx)}>
              Dar Like
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default MovieReviewView;
