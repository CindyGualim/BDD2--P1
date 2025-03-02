import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function GenreSelection() {
  const [genres, setGenres] = useState([]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Obtener géneros desde el backend
    axios.get("http://localhost:5000/genres")
      .then(response => {
        setGenres(response.data);
      })
      .catch(error => {
        console.error("Error al obtener los géneros", error);
      });
  }, []);

  const handleGenreChange = (genre) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleSubmit = async () => {
    if (selectedGenres.length === 0) {
      alert("Por favor, selecciona al menos un género.");
      return;
    }
    try {
      await axios.post("http://localhost:5000/save-genres", {
        email: localStorage.getItem("userEmail"), // Suponiendo que guardamos el email al iniciar sesión
        genres: selectedGenres,
      });
      alert("Preferencias guardadas con éxito");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error al guardar géneros", error);
      alert("Hubo un error al guardar tus preferencias.");
    }
  };

  return (
    <div>
      <h1>Selecciona tus géneros favoritos</h1>
      {genres.map((genre, index) => (
        <div key={index}>
          <input
            type="checkbox"
            id={genre}
            value={genre}
            onChange={() => handleGenreChange(genre)}
          />
          <label htmlFor={genre}>{genre}</label>
        </div>
      ))}
      <button onClick={handleSubmit}>Guardar preferencias</button>
    </div>
  );
}

export default GenreSelection;
