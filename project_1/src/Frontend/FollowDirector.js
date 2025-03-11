import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function FollowDirector() {
  const [directors, setDirectors] = useState([]);
  const [selectedDirector, setSelectedDirector] = useState("");
  const [loading, setLoading] = useState(false);
  const userEmail = localStorage.getItem("userEmail");
  const navigate = useNavigate();

  useEffect(() => {
    if (!userEmail) {
      alert(" Debes iniciar sesión para seguir a un director.");
      navigate("/login");
      return;
    }

    axios.get("http://localhost:5000/directors")
      .then(response => setDirectors(response.data))
      .catch(error => console.error(" Error al obtener directores:", error));
  }, [userEmail, navigate]);

  const handleFollowDirector = async () => {
    if (!selectedDirector) {
      alert(" Selecciona un director antes de continuar.");
      return;
    }

    setLoading(true);
    try {
      await axios.post("http://localhost:5000/follow-director", {
        email: userEmail,
        directorName: selectedDirector
      });

      alert(` Ahora sigues a ${selectedDirector}.`);
      setSelectedDirector(""); // Reinicia la selección
    } catch (error) {
      console.error(" Error al seguir director:", error);
      alert(" Hubo un problema al seguir al director. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>🎬 Sigue a un director</h2>
      <select onChange={(e) => setSelectedDirector(e.target.value)} value={selectedDirector}>
        <option value="">-- Selecciona un director --</option>
        {directors.map((director, index) => (
          <option key={index} value={director.name}>{director.name}</option>
        ))}
      </select>
      <button onClick={handleFollowDirector} disabled={loading}>
        {loading ? "Siguiendo..." : "Seguir"}
      </button>
    </div>
  );
}

export default FollowDirector;
