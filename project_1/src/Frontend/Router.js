import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import GenreSelection from "./Genre_Selection";
import Recommendations from "./Recommendations";
import Home from "./Home";
import Director from "./Director";
import MovieDetails from "./MovieDetails";
import DirectorDetails from './DirectorDetails';
import ActorDetails from './ActorDetails';
import Actor from './Actors';
import FollowDirector from "./FollowDirector";
import RateMovie from "./RateMovie";
import MovieReviewView from "./MovieReviewView";

function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/genre-selection" element={<GenreSelection />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/home" element={<Home />} />
        <Route path="/director" element={<Director />} />
        <Route path="/movie/:titulo" element={<MovieDetails />} />
        <Route path="/director/:name" element={<DirectorDetails />} />
        <Route path="/actor" element={<Actor />} />
        <Route path="/actor/:name" element={<ActorDetails />} />
        <Route path="/review/:titulo" element={<MovieReviewView />} />
        <Route path="/follow-director" element={<FollowDirector />} />
        <Route path="/rate-movie" element={<RateMovie />} />
      </Routes>
    </Router>
  );
}

export default AppRouter;
