import { Box, Typography, TextField, Button, Avatar, Paper, Divider } from "@mui/material";

function EditUser() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: 3,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 500,
          p: 4,
          borderRadius: 3,
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mb: 3 }}>
          <Avatar
            sx={{
              width: 90,
              height: 90,
              mb: 2,
              bgcolor: "primary.main",
              fontSize: 36,
            }}
          >
            U
          </Avatar>
          <Typography variant="h5" fontWeight="bold">
            Perfil de Usuario
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Visualiza y edita tu información personal
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Nombre"
            defaultValue="Ismael García"
            fullWidth
            InputProps={{ readOnly: false }}
          />
          <TextField
            label="Correo electrónico"
            defaultValue="ismael@example.com"
            fullWidth
            InputProps={{ readOnly: false }}
          />
          <TextField
            label="Contraseña"
            type="password"
            defaultValue="********"
            fullWidth
            InputProps={{ readOnly: false }}
          />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
          <Button variant="outlined" color="secondary" fullWidth>
            Cancelar
          </Button>
          <Button variant="contained" color="primary" fullWidth>
            Guardar cambios
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}

export default EditUser;
