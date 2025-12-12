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
  // State for user data
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // State for form
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  // State to show/hide password
  const [showPassword, setShowPassword] = useState(false);

  // State for confirmation dialogs
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showChangeEmailDialog, setShowChangeEmailDialog] = useState(false);
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);

  // State for email and password changes
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

  // Get token from localStorage
  const getToken = () => {
    return localStorage.getItem("artemis_token"); // Same name as in Login
  };

  // Load user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  // Function to fetch user data
  const fetchUserData = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getToken();
      if (!token) {
        setError("No active session. Please log in.");
        setLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Error loading user data");
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

  // Handle changes in main form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Save profile changes (name)
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
        throw new Error(errorData.error || "Error saving changes");
      }

      const data = await response.json();
      setUserData(data.user);
      setSuccess("Changes saved successfully");
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Change email
  const handleChangeEmail = async () => {
    try {
      if (!emailData.newEmail || !emailData.password) {
        setError("Please fill in all fields");
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
        throw new Error(errorData.error || "Error changing email");
      }

      const data = await response.json();
      setUserData(data.user);
      setFormData((prev) => ({ ...prev, email: data.user.email }));
      setSuccess("Email changed successfully");
      setShowChangeEmailDialog(false);
      setEmailData({ newEmail: "", password: "" });
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    try {
      if (
        !passwordData.currentPassword ||
        !passwordData.newPassword ||
        !passwordData.confirmPassword
      ) {
        setError("Please fill in all fields");
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError("New passwords do not match");
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
        throw new Error(errorData.error || "Error changing password");
      }

      setSuccess("Password changed successfully");
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

  // Delete account
  const handleDeleteAccount = async () => {
    try {
      if (!deletePassword) {
        setError("Please enter your password");
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
        throw new Error(errorData.error || "Error deleting account");
      }

      // Clear token and redirect to login
      localStorage.removeItem("artemis_token");
      window.location.href = "/login"; // Adjust path according to your app
    } catch (err) {
      console.error("Error:", err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePassword = () => setShowPassword((prev) => !prev);

  // Format registration date
  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
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
          Could not load user data. Please log in again.
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
      {/* Error and success messages */}
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

      {/* Main container */}
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
        {/* Left column: profile */}
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
            Member since {formatDate(userData.createdAt)}
          </Typography>

          <Divider sx={{ my: 3, width: "100%" }} />

          <Typography variant="h5" fontWeight="bold" mb={1}>
            Published Photos
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

        {/* Right column: form */}
        <Box sx={{ width: "60%" }}>
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle1" mb={1}>
                Name
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
                Email
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
                  Change
                </Button>
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle1" mb={1}>
                Password
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
                  Change
                </Button>
              </Box>
            </Box>
          </Stack>

          {/* Action buttons */}
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
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSaveChanges}
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : "Save Changes"}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Delete account button */}
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
          Delete Account
        </Button>
      </Box>

      {/* Change email dialog */}
      <Dialog
        open={showChangeEmailDialog}
        onClose={() => setShowChangeEmailDialog(false)}
      >
        <DialogTitle>Change Email</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2, minWidth: 400 }}>
            <TextField
              label="New Email"
              type="email"
              fullWidth
              value={emailData.newEmail}
              onChange={(e) =>
                setEmailData((prev) => ({ ...prev, newEmail: e.target.value }))
              }
            />
            <TextField
              label="Current Password"
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
            Cancel
          </Button>
          <Button
            onClick={handleChangeEmail}
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : "Change Email"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change password dialog */}
      <Dialog
        open={showChangePasswordDialog}
        onClose={() => setShowChangePasswordDialog(false)}
      >
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 2, minWidth: 400 }}>
            <TextField
              label="Current Password"
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
              label="New Password"
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
              label="Confirm New Password"
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
            Cancel
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : "Change Password"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete account confirmation dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Are you sure?</DialogTitle>
        <DialogContent>
          <Typography mb={2}>
            This action cannot be undone. All your data and photos will be deleted.
          </Typography>
          <TextField
            label="Confirm your password"
            type="password"
            fullWidth
            value={deletePassword}
            onChange={(e) => setDeletePassword(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteAccount}
            color="error"
            variant="contained"
            disabled={saving}
          >
            {saving ? <CircularProgress size={24} /> : "Delete Account"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default EditUser;
