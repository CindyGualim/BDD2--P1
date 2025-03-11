import React, { useEffect, useState } from "react";
import axios from "axios";

function RateMovie() {
  const [movies, setMovies] = useState([]);
  const [selectedMovie, setSelectedMovie] = useState("");
  const [rating, setRating] = useState(1);
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    axios.get("http://localhost:5000/movies")
      .then(response => setMovies(response.data))
      .catch(error => console.error("Error al obtener películas:", error));
  }, []);

  const handleRateMovie = () => {
    if (!selectedMovie) {
      alert("Selecciona una película antes de calificar.");
      return;
    }

    axios.put(`http://localhost:5000/movie/${selectedMovie}`, {
      email: userEmail,
      calificacion: rating
    })
      .then(() => alert("✅ Calificación guardada correctamente."))
      .catch(error => console.error("Error al calificar película:", error));
  };

  return (
    <div className="container">
      <h2>🎥 Califica una película</h2>
      <select onChange={(e) => setSelectedMovie(e.target.value)} value={selectedMovie}>
        <option value="">-- Selecciona una película --</option>
        {movies.map((movie, index) => (
          <option key={index} value={movie.title}>{movie.title}</option>
        ))}
      </select>
      <input
        type="number"
        min="1"
        max="10"
        value={rating}
        onChange={(e) => setRating(e.target.value)}
      />
      <button onClick={handleRateMovie}>⭐ Calificar</button>
    </div>
  );
}

export default RateMovie;
