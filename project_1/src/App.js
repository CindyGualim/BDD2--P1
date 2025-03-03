import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./Frontend/Register";
import Login from "./Frontend/Login";
import GenreSelection from "./Frontend/Genre_Selection";
import Home from "./Frontend/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />  {/* 🔥 Home.js ahora está en "/" */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/genre-selection" element={<GenreSelection />} />
      </Routes>
    </Router>
  );
}

export default App;
