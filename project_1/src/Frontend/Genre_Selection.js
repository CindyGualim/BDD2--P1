import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function GenreSelection() {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const navigate = useNavigate();

  // Obtiene el email desde localStorage
  const userEmail = localStorage.getItem("userEmail");

  useEffect(() => {
    axios.get("http://localhost:5000/genres")
      .then(response => {
        setGenres(response.data);
      })
      .catch(error => {
        console.error("Error al obtener géneros:", error);
      });
  }, []);

  const handleGenreChange = (genre) => {
    setSelectedGenres(prevSelected =>
      prevSelected.includes(genre)
        ? prevSelected.filter(g => g !== genre)
        : [...prevSelected, genre]
    );
  };

  const handleSavePreferences = () => {
    if (!userEmail) {
      alert("Error: No hay usuario autenticado.");
      return;
    }

    if (selectedGenres.length === 0) {
      alert("Selecciona al menos un género.");
      return;
    }

    axios.post("http://localhost:5000/save-preferences", {
      email: userEmail, // Usa el email almacenado
      genres: selectedGenres,
    })
    .then(() => {
      alert("Preferencias guardadas con éxito!");
      navigate("/"); // 🔥 Ahora redirige a Home.js en lugar de /recommendations
    })
    .catch(error => {
      console.error("Error al guardar preferencias:", error);
      alert("Hubo un error al guardar tus preferencias.");
    });
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Selecciona tus géneros favoritos</h1>
      <div>
        {genres.map((genre, index) => (
          <div key={index}>
            <input
              type="checkbox"
              id={`genre-${index}`}
              value={genre}
              checked={selectedGenres.includes(genre)}
              onChange={() => handleGenreChange(genre)}
            />
            <label htmlFor={`genre-${index}`}>{genre}</label>
          </div>
        ))}
      </div>
      <button onClick={handleSavePreferences} style={{ marginTop: "10px" }}>
        Guardar Preferencias
      </button>
    </div>
  );
}

export default GenreSelection;
