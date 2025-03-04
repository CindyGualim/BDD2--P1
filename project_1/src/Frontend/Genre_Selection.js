import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function GenreSelection() {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    axios.get("http://localhost:5000/genres")
      .then(response => setGenres(response.data))
      .catch(error => console.error("❌ Error al obtener géneros:", error));
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
      console.error("❌ Error al guardar preferencias:", error);
    }
  };

  return (
    <div>
      <h1>Selecciona tus Géneros Favoritos</h1>
      <div>
        {genres.map((genre, index) => (
          <button
            key={index}
            onClick={() => handleGenreToggle(genre)}
            style={{ backgroundColor: selectedGenres.includes(genre) ? "lightblue" : "white" }}
          >
            {genre}
          </button>
        ))}
      </div>
      <button onClick={handleSavePreferences}>Guardar y Continuar</button>
    </div>
  );
}

export default GenreSelection;
