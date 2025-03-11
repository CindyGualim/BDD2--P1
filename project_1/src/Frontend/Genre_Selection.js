import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/GenreSelection.css"; // Importamos el CSS corregido

function GenreSelection() {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    if (!userEmail) {
      alert("⚠️ No hay usuario autenticado. Por favor, inicia sesión.");
      navigate("/login");
      return;
    }

    // Obtener todos los géneros disponibles
    axios.get("http://localhost:5000/genres")
      .then(response => setGenres(response.data))
      .catch(error => console.error("❌ Error al obtener géneros:", error));

    // Obtener los géneros previamente seleccionados por el usuario
    axios.get(`http://localhost:5000/user-genres/${userEmail}`)
      .then(response => setSelectedGenres(response.data))
      .catch(error => console.error("❌ Error al obtener géneros seleccionados:", error))
      .finally(() => setLoading(false));
  }, [userEmail, navigate]);

  // Función para alternar selección de géneros
  const handleGenreToggle = (genre) => {
    setSelectedGenres(prevSelected =>
      prevSelected.includes(genre)
        ? prevSelected.filter(g => g !== genre)
        : [...prevSelected, genre]
    );
  };

  // Guardar preferencias
  const handleSavePreferences = async () => {
    if (selectedGenres.length === 0) {
      alert("⚠️ Debes seleccionar al menos un género.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/save-preferences", {
        email: userEmail,
        genres: selectedGenres
      });

      alert("✅ Preferencias guardadas correctamente.");
      navigate("/recommendations");
    } catch (error) {
      console.error("❌ Error al guardar preferencias:", error);
      alert("❌ Hubo un problema al guardar las preferencias.");
    }
  };

  return (
    <div className="genre-selection-container">
      <h1 className="genre-title">🎭 Selecciona tus Géneros Favoritos</h1>

      {loading ? (
        <p className="loading-text">⏳ Cargando géneros...</p>
      ) : (
        <div className="genre-buttons">
          {genres.map((genre, index) => (
            <button
              key={index}
              onClick={() => handleGenreToggle(genre)}
              className={`genre-button ${selectedGenres.includes(genre) ? "selected" : ""}`}
            >
              {genre}
            </button>
          ))}
        </div>
      )}

      <button className="save-button" onClick={handleSavePreferences}>💾 Guardar y Continuar</button>
    </div>
  );
}

export default GenreSelection;
