import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Frontend/Login";
import Register from "./Frontend/Register";
import GenreSelection from "./Frontend/Genre_Selection";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/genre-selection" element={<GenreSelection />} />
      </Routes>
    </Router>
  );
}

export default App;
