import { Box, Toolbar } from "@mui/material";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import SidePanel from "./components/side-panel/SidePanel";
import MenuPanel from "./components/menu-panel/MenuPanel";
import HomePage from "./pages/HomePage";
import OtherProfiles from "./pages/OtherProfiles";
import Gallery from "./pages/Gallery";
import EditUser from "./pages/EditUser";
import AstronomicalEvents from "./pages/AstronomicalEvents";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        <MenuPanel />
        <Toolbar />

        <Box sx={{ display: "flex", flexGrow: 1 }}>
          <SidePanel />

          <Box sx={{ flexGrow: 1, padding: 3 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/other-profiles" element={<OtherProfiles />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/edit-user" element={<EditUser />} />
              <Route path="/astro-events" element={<AstronomicalEvents />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </BrowserRouter>
  );
}

export default App;
