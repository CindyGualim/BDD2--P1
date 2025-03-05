import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register"; // Importa el componente de registro
import GenreSelection from "./Genre_Selection"; // Importa el nuevo componente
import Recommendations from "./Recommendations";
import Home from "./Home";
import MovieDetails from "./MovieDetails";

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/genre-selection" element={<GenreSelection />} /> {/* Nueva pantalla */}
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/home" element={<Home />} />
        <Route path="/movie/:titulo" element={<MovieDetails />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
