import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/home.css"; 

function Home() {
  const [directors, setDirectors] = useState([]);
  const [movies, setMovies] = useState([]);
  const [ratedMovies, setRatedMovies] = useState([]);
  const [followedDirectors, setFollowedDirectors] = useState([]);

  const [selectedDirector, setSelectedDirector] = useState("");
  const [selectedMovie, setSelectedMovie] = useState("");
  const [rating, setRating] = useState(1);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userEmail) {
      alert("⚠️ No hay usuario autenticado. Por favor, inicia sesión.");
      navigate("/login");
      return;
    }

    // Obtener directores
    axios.get("http://localhost:5000/directors")
      .then(response => setDirectors(response.data))
      .catch(error => console.error("Error al obtener directores:", error));

    // Obtener películas
    axios.get("http://localhost:5000/movies")
      .then(response => setMovies(response.data))
      .catch(error => console.error("Error al obtener películas:", error));

    // Obtener directores seguidos
    axios.get(`http://localhost:5000/followed-directors/${userEmail}`)
      .then(response => setFollowedDirectors(response.data))
      .catch(error => console.error("Error al obtener directores seguidos:", error));

    // Obtener películas calificadas
    axios.get(`http://localhost:5000/rated-movies/${userEmail}`)
      .then(response => setRatedMovies(response.data))
      .catch(error => console.error("Error al obtener películas calificadas:", error))
      .finally(() => setLoading(false));
  }, [userEmail, navigate]);

  // Función para seguir un director
  const handleFollowDirector = async () => {
    if (!selectedDirector) {
      alert("⚠️ Selecciona un director antes de continuar.");
      return;
    }

    if (followedDirectors.some(director => director.name === selectedDirector)) {
      alert("⚠️ Ya sigues a este director.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/follow-director", {
        email: userEmail,
        directorName: selectedDirector
      });
      alert(`✅ Ahora sigues a ${selectedDirector}.`);
      setFollowedDirectors(prev => [...prev, { name: selectedDirector }]);
    } catch (error) {
      console.error("❌ Error al seguir director:", error);
      alert("❌ Hubo un problema al seguir al director.");
    }
  };

  // Función para dejar de seguir a un director
  const handleUnfollowDirector = async (directorName) => {
    try {
      await axios.delete("http://localhost:5000/unfollow-director", {
        data: { email: userEmail, directorName }
      });
      alert(`🚫 Dejaste de seguir a ${directorName}.`);
      setFollowedDirectors(prev => prev.filter(director => director.name !== directorName));
    } catch (error) {
      console.error("❌ Error al dejar de seguir director:", error);
      alert("❌ Hubo un problema al dejar de seguir al director.");
    }
  };

  // Función para calificar una película
  const handleRateMovie = async () => {
    if (!selectedMovie) {
      alert("⚠️ Selecciona una película antes de calificar.");
      return;
    }

    try {
      await axios.put("http://localhost:5000/rate-movie", {
        email: userEmail,
        movieTitle: selectedMovie,
        rating
      });
      alert("✅ Calificación guardada correctamente.");
      setRatedMovies(prev => {
        const updatedMovies = prev.filter(movie => movie.title !== selectedMovie);
        return [...updatedMovies, { title: selectedMovie, rating }];
      });
    } catch (error) {
      console.error("❌ Error al calificar película:", error);
      alert("❌ Hubo un problema al calificar la película.");
    }
  };

  // Función para eliminar una calificación
  const handleRemoveRating = async (movieTitle) => {
    try {
      await axios.delete("http://localhost:5000/remove-rating", {
        data: { email: userEmail, movieTitle }
      });
      alert(`🗑️ Eliminaste tu calificación de ${movieTitle}.`);
      setRatedMovies(prev => prev.filter(movie => movie.title !== movieTitle));
    } catch (error) {
      console.error("❌ Error al eliminar calificación:", error);
      alert("❌ Hubo un problema al eliminar la calificación.");
    }
  };

  return (
    <div className="home-container">
      <h1>🎬 Bienvenido a tu Panel de Opciones</h1>

      {loading ? (
        <p className="loading-text">⏳ Cargando opciones...</p>
      ) : (
        <>
          {/* Sección para seguir un director */}
          <h2>🎬 Seguir a un Director</h2>
          <select onChange={(e) => setSelectedDirector(e.target.value)} value={selectedDirector}>
            <option value="">-- Selecciona un director --</option>
            {directors.map((director, index) => (
              <option key={index} value={director.name}>{director.name}</option>
            ))}
          </select>
          <button onClick={handleFollowDirector}>👤 Seguir</button>

          {/* Sección para calificar una película */}
          <h2>⭐ Calificar una Película</h2>
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

          {/* Sección para mostrar directores seguidos */}
          <h2>📌 Directores que Sigues</h2>
          {followedDirectors.length > 0 ? (
            <ul>
              {followedDirectors.map((director, index) => (
                <li key={index}>
                  🎬 {director.name}{" "}
                  <button onClick={() => handleUnfollowDirector(director.name)}>🚫 Dejar de seguir</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-message">⚠️ No sigues a ningún director aún.</p>
          )}

          {/* Sección para mostrar películas calificadas */}
          <h2>🎥 Películas Calificadas</h2>
          {ratedMovies.length > 0 ? (
            <ul>
              {ratedMovies.map((movie, index) => (
                <li key={index}>
                  ⭐ {movie.title} - {movie.rating}/10{" "}
                  <button onClick={() => handleRemoveRating(movie.title)}>🗑️ Eliminar</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="empty-message">⚠️ No has calificado ninguna película aún.</p>
          )}
        </>
      )}

      {/* Botones de acción */}
      <div className="buttons-container">
        <button className="genre-button" onClick={() => navigate("/genre-selection")}>
           Editar Géneros Favoritos
        </button>
        <button className="logout-button" onClick={() => {
          localStorage.removeItem("userEmail");
          navigate("/login");
        }}>
           Cerrar Sesión
        </button>
      </div>
    </div>
  );
}

export default Home;
