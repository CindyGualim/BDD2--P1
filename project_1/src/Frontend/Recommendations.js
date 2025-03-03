import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function Recommendations() {
  const [movies, setMovies] = useState([]);
  const navigate = useNavigate();
  const userEmail = "usuario@test.com"; // Reemplázalo con el email del usuario autenticado

  useEffect(() => {
    axios
      .get(`http://localhost:5000/recommendations/${userEmail}`)
      .then((response) => {
        setMovies(response.data);
      })
      .catch((error) => {
        console.error("Error al obtener recomendaciones:", error);
      });
  }, [userEmail]);

  return (
    <div>
      <h1>Películas Recomendadas</h1>
      {movies.length > 0 ? (
        <ul>
          {movies.map((movie, index) => (
            <li key={index}>{movie.title} - Relevancia: {movie.relevancia}</li>
          ))}
        </ul>
      ) : (
        <p>No hay recomendaciones disponibles.</p>
      )}
      <button onClick={() => navigate("/dashboard")}>Volver al Perfil</button>
    </div>
  );
}

export default Recommendations;
