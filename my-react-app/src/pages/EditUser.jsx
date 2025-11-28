import { useState, useEffect } from "react";
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
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";

const API_URL = "http://localhost:5000/api";

function EditUser() {
  // Estado para los datos del usuario
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Estado para el formulario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // Estado para mostrar/ocultar contraseña
  const [showPassword, setShowPassword] = useState(false);

  // Estado para diálogos de confirmación
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showChangeEmailDialog, setShowChangeEmailDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);

  // Estado para cambios de email y contraseña
  const [emailData, setEmailData] = useState({
    newEmail: "",
    password: "",
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [deletePassword, setDeletePassword] = useState("");

  // Obtener token del localStorage
  const getToken = () => {
    return localStorage.getItem("artemis_token"); // Mismo nombre que en Login
  };

  // Cargar datos del usuario al montar el componente
  useEffect(() => {
    fetchUserData();
  }, []);

  // Función para obtener datos del usuario
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        setError("No hay sesión activa. Por favor, inicia sesión.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error al cargar datos del usuario");
      }

      const data = await response.json();
      setUserData(data.user);
      setFormData({
        name: data.user.name,
        email: data.user.email,
      });
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambios en el formulario principal
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Guardar cambios del perfil (nombre)
  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const token = getToken();

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al guardar cambios");
      }

      const data = await response.json();
      setUserData(data.user);
      setSuccess("Cambios guardados exitosamente");
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Cambiar email
  const handleChangeEmail = async () => {
    try {
      if (!emailData.newEmail || !emailData.password) {
        setError("Por favor completa todos los campos");
        return;
      }

      setSaving(true);
      setError(null);

      const token = getToken();

      const response = await fetch(`${API_URL}/users/email`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(emailData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cambiar email");
      }

      const data = await response.json();
      setUserData(data.user);
      setFormData((prev) => ({ ...prev, email: data.user.email }));
      setSuccess("Email cambiado exitosamente");
      setShowChangeEmailDialog(false);
      setEmailData({ newEmail: "", password: "" });
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Cambiar contraseña
  const handleChangePassword = async () => {
    try {
      if (
        !passwordData.currentPassword ||
        !passwordData.newPassword ||
        !passwordData.confirmPassword
      ) {
        setError("Por favor completa todos los campos");
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("Las contraseñas nuevas no coinciden");
        return;
      }

      setSaving(true);
      setError(null);

      const token = getToken();

      const response = await fetch(`${API_URL}/users/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al cambiar contraseña");
      }

      setSuccess("Contraseña cambiada exitosamente");
      setShowChangePasswordDialog(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Eliminar cuenta
  const handleDeleteAccount = async () => {
    try {
      if (!deletePassword) {
        setError("Por favor ingresa tu contraseña");
        return;
      }

      setSaving(true);
      setError(null);

      const token = getToken();

      const response = await fetch(`${API_URL}/users/account`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: deletePassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al eliminar cuenta");
      }

      // Limpiar token y redirigir al login
      localStorage.removeItem("artemis_token");
      window.location.href = "/login"; // Ajusta la ruta según tu app
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  // Formatear fecha de registro
  const formatDate = (dateString) => {
    if (!dateString) return "Fecha desconocida";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!userData) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">
          No se pudieron cargar los datos del usuario. Por favor, inicia sesión
          nuevamente.
        </Alert>
      </Box>
    );
  }

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
      {/* Mensajes de error y éxito */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}

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
              src={userData.profilePic}
              sx={{
                width: 120,
                height: 120,
                bgcolor: "primary.main",
                fontSize: 40,
              }}
            >
              {userData.name.charAt(0).toUpperCase()}
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
            {userData.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Miembro desde el {formatDate(userData.createdAt)}
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
              {userData.photos?.length || 0}
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
              <TextField
                fullWidth
                name="name"
                value={formData.name}
                onChange={handleInputChange}
              />
            </Box>

            <Box>
              <Typography variant="subtitle1" mb={1}>
                Correo electrónico
              </Typography>
              <Box sx={{ display: "flex", gap: 2 }}>
                <TextField
                  fullWidth
                  value={formData.email}
                  InputProps={{ readOnly: true }}
                />
                <Button
                  variant="outlined"
                  onClick={() => setShowChangeEmailDialog(true)}
                >
                  Cambiar
                </Button>
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
                  onClick={() => setShowChangePasswordDialog(true)}
                >
                  Cambiar
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
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => {
                setFormData({
                  name: userData.name,
                  email: userData.email,
                });
                setError(null);
                setSuccess(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveChanges}
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : "Guardar cambios"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Botón de eliminar cuenta */}
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
          onClick={() => setShowDeleteDialog(true)}
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

      {/* Diálogo para cambiar email */}
      <Dialog
        open={showChangeEmailDialog}
        onClose={() => setShowChangeEmailDialog(false)}
      >
        <DialogTitle>Cambiar correo electrónico</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2, minWidth: 400 }}>
            <TextField
              label="Nuevo email"
              type="email"
              fullWidth
              value={emailData.newEmail}
              onChange={(e) =>
                setEmailData((prev) => ({ ...prev, newEmail: e.target.value }))
              }
            />
            <TextField
              label="Contraseña actual"
              type="password"
              fullWidth
              value={emailData.password}
              onChange={(e) =>
                setEmailData((prev) => ({ ...prev, password: e.target.value }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowChangeEmailDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleChangeEmail}
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : "Cambiar email"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo para cambiar contraseña */}
      <Dialog
        open={showChangePasswordDialog}
        onClose={() => setShowChangePasswordDialog(false)}
      >
        <DialogTitle>Cambiar contraseña</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2, minWidth: 400 }}>
            <TextField
              label="Contraseña actual"
              type="password"
              fullWidth
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  currentPassword: e.target.value,
                }))
              }
            />
            <TextField
              label="Nueva contraseña"
              type="password"
              fullWidth
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  newPassword: e.target.value,
                }))
              }
            />
            <TextField
              label="Confirmar nueva contraseña"
              type="password"
              fullWidth
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData((prev) => ({
                  ...prev,
                  confirmPassword: e.target.value,
                }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowChangePasswordDialog(false)}>
            Cancelar
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : "Cambiar contraseña"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de confirmación para eliminar cuenta */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>¿Estás seguro?</DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            Esta acción no se puede deshacer. Se eliminarán todos tus datos y
            fotos.
          </Typography>
          <TextField
            label="Confirma tu contraseña"
            type="password"
            fullWidth
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancelar</Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : "Eliminar cuenta"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EditUser;
