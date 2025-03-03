import React, { useState, useEffect } from "react";
import axios from "axios";

function GenreSelection() {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);

  // Obtener géneros desde el backend
  useEffect(() => {
    axios.get("http://localhost:5000/genres")
      .then(response => {
        setGenres(response.data);
      })
      .catch(error => {
        console.error("Error al obtener géneros:", error);
      });
  }, []);

  // Manejar selección de géneros
  const handleCheckboxChange = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  // Enviar selección al servidor
  const handleSavePreferences = () => {
    axios.post("http://localhost:5000/save-preferences", { genres: selectedGenres })
      .then(response => {
        alert("¡Preferencias guardadas con éxito!");
      })
      .catch(error => {
        console.error("Error al guardar preferencias:", error);
      });
  };

  return (
    <div>
      <h1>Selecciona tus géneros favoritos</h1>
      <form>
        {genres.map((genre, index) => (
          <div key={index}>
            <input
              type="checkbox"
              id={genre}
              value={genre}
              onChange={() => handleCheckboxChange(genre)}
            />
            <label htmlFor={genre}>{genre}</label>
          </div>
        ))}
      </form>
      <button onClick={handleSavePreferences}>Guardar Preferencias</button>
    </div>
  );
}

export default GenreSelection;
