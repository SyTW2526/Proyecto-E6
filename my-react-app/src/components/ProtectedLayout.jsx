import { Navigate, Outlet } from "react-router-dom";
import { Box, Toolbar, CircularProgress } from "@mui/material";
import { useAppContext } from "../AppContext";
import SidePanel from "./side-panel/SidePanel";
import MenuPanel from "./menu-panel/MenuPanel";

function ProtectedLayout() {
  const { currentUser, loading } = useAppContext();

  // Mostrar spinner mientras verifica el token
  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Si no hay usuario después de cargar, redirigir a login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <MenuPanel />
      <Toolbar />

      <Box
        sx={{ display: "flex", flexGrow: 1, overflow: "hidden", minHeight: 0 }}
      >
        <SidePanel />

        <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}

export default ProtectedLayout;
