import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/MovieReviewView.css";  // (Opcional) Para colocar estilos

function MovieReviewView() {
  const { titulo } = useParams();              // Toma el título desde la URL ("/review/:titulo")
  const [reviews, setReviews] = useState([]);  // Lista de reseñas existentes
  const [userHasRated, setUserHasRated] = useState(false);

  // Campos para nueva reseña
  const [rating, setRating] = useState(0);       // número de estrellas (1-5)
  const [comment, setComment] = useState("");
  const [spoiler, setSpoiler] = useState(false);

  const userEmail = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  // Cargar reseñas de la película al montar o cambiar de título
  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [titulo]);

  // Obtener reseñas desde el backend
  const fetchReviews = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/movie-reviews/${encodeURIComponent(titulo)}`, {
        params: { email: userEmail },  // Indica al backend el usuario actual
      });
      setReviews(res.data.reviews || []);
      setUserHasRated(res.data.userHasRated || false);
    } catch (error) {
      console.error("Error al obtener reseñas:", error);
    }
  };

  // Asignar valor de estrellas al hacer clic
  const handleStarClick = (starIndex) => {
    // Si hace clic en la estrella #3, rating = 3
    setRating(starIndex);
  };

  // Enviar nueva reseña al backend
  const handleCreateReview = async () => {
    // Validar que esté en el rango
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
        spoiler
      });

      // Mostrar un mensaje con los datos
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

  // Dar 'like' a una reseña existente (si tienes un endpoint /movie-reviews/:reviewId/like)
  const handleLike = async (index) => {
    const review = reviews[index];
    // Suponiendo que tu backend devuelva un 'reviewId' para cada reseña
    if (!review.reviewId) {
      alert("Esta reseña no tiene un ID asignado para poder dar like.");
      return;
    }
    try {
      const res = await axios.post(`http://localhost:5000/movie-reviews/${review.reviewId}/like`);
      const newLikes = res.data.newLikes;
      // Actualizamos localmente la cantidad de likes
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

      {/* Formulario de reseña solo si el usuario no ha calificado */}
      {!userHasRated && (
        <div className="review-form">
          <h2>¿Deseas calificar esta película?</h2>

          {/* Sección de estrellas */}
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
            {/* Estrellas llenas/vacías según puntuación */}
            <div className="stars-display">
              {"★".repeat(r.puntuacion) + "☆".repeat(5 - r.puntuacion)}
            </div>
            <p>Fecha de reseña: {r.fechaReseña}</p>
            <p>Comentario: {r.comentario}</p>
            <p>Likes: {r.likes}</p>
            <p>Spoiler: {r.spoiler ? "Sí" : "No"}</p>
            <p>Autor: {r.authorName} ({r.reviewAuthor})</p>

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
