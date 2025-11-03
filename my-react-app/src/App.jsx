import { Box } from "@mui/material";
import SidePanel from "./components/side-panel/SidePanel";
import MenuPanel from "./components/menu-panel/MenuPanel";
import "./App.css";

function App() {
  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      {/* Barra superior - MenuPanel ocupa todo el ancho */}
      <Box sx={{ width: "100%" }}>
        <MenuPanel />
      </Box>

      {/* Contenedor horizontal: SidePanel + Contenido principal */}
      <Box sx={{ display: "flex", flexGrow: 1 }}>
        {/* Panel lateral izquierdo */}
        <SidePanel />

        {/* Contenido principal de la aplicación */}
        <Box sx={{ flexGrow: 1, margin: "10px" }}>
          <h1>Bienvenido a tu aplicación</h1>
          <p>
            Este es el contenido principal. Aquí puedes añadir tus componentes.
          </p>
        </Box>
      </Box>
    </Box>
  );
}

export default App;
