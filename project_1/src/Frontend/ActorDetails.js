import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function ActorDetails() {
  const { name } = useParams(); // Extraemos el nombre del actor de la URL
  const [actor, setActor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActor = async () => {
      try {
        // Hacemos la solicitud para obtener los detalles del actor
        const response = await axios.get(`http://localhost:5000/actors/${encodeURIComponent(name)}`);
        setActor(response.data);
      } catch (error) {
        console.error("Error al obtener datos del actor:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchActor();
  }, [name]); // Dependemos del parámetro name

  if (loading) {
    return <div>Cargando detalles del actor...</div>;
  }

  if (!actor) {
    return <div>No se encontró el actor.</div>;
  }

  return (
    <div style={{ color: "#fff", backgroundColor: "#000", minHeight: "100vh", padding: "1rem" }}>
      <h1>{actor.name}</h1>
      <p>
        Nacimiento: {actor.fechaNacimiento && typeof actor.fechaNacimiento === "object"
        ? `${actor.fechaNacimiento.day?.low}/${actor.fechaNacimiento.month?.low}/${actor.fechaNacimiento.year?.low}`
        : "Desconocido"}
        
      </p>
      <p><strong>Biografía:</strong> {actor.biografia || "No disponible"}</p>
      <p><strong>Filmografía:</strong> {actor.filmografia?.join(", ") || "No especificada"}</p>
      <p><strong>Estado:</strong> {actor.activo ? "Activo" : "Retirado/Inactivo"}</p>
    </div>
  );
}

export default ActorDetails;
