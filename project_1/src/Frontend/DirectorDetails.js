import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function DirectorDetails() {
  const { name } = useParams(); // Extraemos el nombre del director de la URL
  const [director, setDirector] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDirector = async () => {
      try {
        // Hacemos la solicitud para obtener los detalles del director
        const response = await axios.get(`http://localhost:5000/directors/${encodeURIComponent(name)}`);
        setDirector(response.data);
      } catch (error) {
        console.error("Error al obtener datos del director:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDirector();
  }, [name]); // Dependemos del parámetro name

  if (loading) {
    return <div>Cargando detalles del director...</div>;
  }

  if (!director) {
    return <div>No se encontró el director.</div>;
  }

  return (
    <div style={{ color: "#fff", backgroundColor: "#000", minHeight: "100vh", padding: "1rem" }}>
      <h1>{director.name}</h1>
      <p><strong>Estilo:</strong> {director.tematicaRecurrente  || "No especificado"}</p>
      <p><strong>Premios:</strong> {director.premios || "No especificados"}</p>
      <p><strong>Películas destacadas:</strong> {director.peliculas?.join(", ") || "No especificadas"}</p>
      <p><strong>Biografía:</strong> {director.biografia || "No disponible"}</p>
    </div>
  );
}

export default DirectorDetails;
