import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedLayout from "./components/ProtectedLayout";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import HomePage from "./pages/HomePage";
import Community from "./pages/Community";
import Gallery from "./pages/Gallery";
import EditUser from "./pages/EditUser";
import AstronomicalEvents from "./pages/AstronomicalEvents";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas (sin layout) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Rutas protegidas (con layout) */}
        <Route element={<ProtectedLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/community" element={<Community />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/edit-user" element={<EditUser />} />
          <Route path="/astro-events" element={<AstronomicalEvents />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
