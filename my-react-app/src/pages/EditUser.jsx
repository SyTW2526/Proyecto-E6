import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  Stack,
  IconButton,
  Divider,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

function EditUser() {
  const [showPassword, setShowPassword] = useState(false);
  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        backgroundColor: "#e9ecef",
        p: 4,
      }}
    >
      {/* Contenedor principal */}
      <Paper
        elevation={3}
        sx={{
          flexGrow: 1,
          p: 5,
          borderRadius: 3,
          backgroundColor: "white",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 6,
        }}
      >
        {/* Columna izquierda: perfil */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            width: "35%",
          }}
        >
          <Box sx={{ position: "relative", mb: 3 }}>
            <Avatar
              sx={{
                width: 120,
                height: 120,
                bgcolor: "primary.main",
                fontSize: 40,
              }}
            >
              U
            </Avatar>
            <IconButton
              size="small"
              sx={{
                position: "absolute",
                bottom: 8,
                right: 8,
                backgroundColor: "white",
                "&:hover": { backgroundColor: "grey.200" },
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>

          <Typography variant="h4" fontWeight="bold">
            Ismael García
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Miembro desde el 12 de marzo de 2023
          </Typography>

          <Divider sx={{ my: 3, width: "100%" }} />

          <Typography variant="h5" fontWeight="bold" mb={1}>
            Fotos publicadas
          </Typography>
          <Box sx={{ textAlign: "center", width: "100%" }}>
            <Typography
              variant="h2"
              fontWeight="bold"
              sx={{ color: "primary.main", lineHeight: 1 }}
            >
              42
            </Typography>
          </Box>
        </Box>

        {/* Columna derecha: formulario */}
        <Box sx={{ width: "60%" }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" mb={1}>
                Nombre
              </Typography>
              <TextField fullWidth defaultValue="Ismael García" />
            </Box>

            <Box>
              <Typography variant="subtitle1" mb={1}>
                Correo electrónico
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  defaultValue="ismael@example.com"
                  InputProps={{ readOnly: false }}
                />
                <Button variant="outlined">Cambiar</Button>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle1" mb={1}>
                Contraseña
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  defaultValue="********"
                  InputProps={{ readOnly: true }}
                />
                <Button
                  variant="outlined"
                  startIcon={
                    showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />
                  }
                  onClick={handleTogglePassword}
                >
                  {showPassword ? "Ocultar" : "Revelar"}
                </Button>
              </Box>
            </Box>
          </Stack>

          {/* Botones de acción */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-start",
              gap: 2,
              mt: 5,
            }}
          >
            <Button variant="outlined" color="secondary">
              Cancelar
            </Button>
            <Button variant="contained" color="primary">
              Guardar cambios
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Botón de eliminar cuenta (abajo del todo) */}
      <Box
        sx={{
          mt: 5,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Button
          variant="contained"
          color="error"
          sx={{
            px: 6,
            py: 1.5,
            fontSize: "1.1rem",
            fontWeight: "bold",
            borderRadius: 2,
            textTransform: "none",
          }}
        >
          Eliminar cuenta
        </Button>
      </Box>
    </Box>
  );
}

export default EditUser;
