import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Recommendations from "./Recommendations";
import Profile from "./Profile";
import Home from "./Home";

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
