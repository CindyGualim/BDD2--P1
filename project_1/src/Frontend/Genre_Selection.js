import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./css/GenreSelection.css"; // Importamos el CSS corregido

function GenreSelection() {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    axios.get("http://localhost:5000/genres")
      .then(response => setGenres(response.data))
      .catch(error => console.error("Error al obtener géneros:", error));
  }, []);

  const handleGenreToggle = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSavePreferences = async () => {
    if (selectedGenres.length === 0) {
      alert("Debes seleccionar al menos un género.");
      return;
    }

    try {
      await axios.post("http://localhost:5000/save-preferences", {
        email: userEmail,
        genres: selectedGenres
      });

      navigate("/recommendations");
    } catch (error) {
      console.error("Error al guardar preferencias:", error);
    }
  };

  return (
    <div className="genre-selection-container">
      <h1 className="genre-title">Selecciona tus Géneros Favoritos</h1>
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
      <button className="save-button" onClick={handleSavePreferences}>Guardar y Continuar</button>
    </div>
  );
}

export default GenreSelection;
