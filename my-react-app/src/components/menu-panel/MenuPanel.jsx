import * as React from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Avatar from "@mui/material/Avatar";

import { ListItemIcon } from "@mui/material";

import MoonIcon from "@mui/icons-material/Brightness3";
import GitHubIcon from "@mui/icons-material/GitHub";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import EditIcon from "@mui/icons-material/Edit";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import LogoutIcon from "@mui/icons-material/Logout";

import { useNavigate } from "react-router-dom";

const drawerWidth = 240;
const navItems = [{ text: "GitHub", icon: <GitHubIcon /> }];

const handleGitHubClick = () => {
  if (typeof window !== "undefined") {
    window.open("https://github.com/SyTW2526/Proyecto-E6.git");
  }
};

function DrawerAppBar(props) {
  const { window } = props;
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const openUserMenu = Boolean(anchorEl);

  const handleDrawerToggle = () => {
    setMobileOpen((prevState) => !prevState);
  };

  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleUserAction = (action) => {
    handleUserMenuClose();
    switch (action) {
      case "edit-profile":
        navigate("/edit-user");
        break;
      case "gallery":
        navigate("/gallery");
        break;
      case "logout":
        // Lógica para cerrar sesión
        break;
    }
  };

  const handleButtonClick = (itemText) => {
    switch (itemText) {
      case "GitHub":
        handleGitHubClick();
        break;
    }
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        MUI
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton sx={{ textAlign: "center" }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <div>
      <Box sx={{ display: "flex", zIndex: 2 }}>
        <CssBaseline />
        <AppBar component="nav">
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: "none" } }}
            >
              <MenuIcon />
            </IconButton>
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: "none", sm: "flex" },
                alignItems: "center",
                gap: 0.8,
              }}
            >
              <MoonIcon
                sx={{
                  fontSize: "1.8rem",
                }}
              />
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 500,
                  letterSpacing: "1px",
                  fontFamily:
                    '"Segoe UI", "Roboto", "Helvetica Neue", sans-serif',
                  fontSize: "1.35rem",
                  textTransform: "capitalize",
                  background:
                    "linear-gradient(45deg, #ffffff 30%, #e3f2fd 90%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Artemis Visualizer
              </Typography>
            </Box>
            <Box sx={{ display: { xs: "none", sm: "block" } }}>
              {navItems.map((item) => (
                <Button
                  key={item.text}
                  sx={{ color: "#fff" }}
                  onClick={() => handleButtonClick(item.text)}
                >
                  {item.icon}
                </Button>
              ))}
              <IconButton onClick={handleUserMenuClick} sx={{ color: "#fff" }}>
                <AccountCircleIcon />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
        <nav>
          <Drawer
            container={container}
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: "block", sm: "none" },
              "& .MuiDrawer-paper": {
                boxSizing: "border-box",
                width: drawerWidth,
              },
            }}
          >
            {drawer}
          </Drawer>
        </nav>
      </Box>

      {/* Menú desplegable de usuario */}
      <Menu
        anchorEl={anchorEl}
        open={openUserMenu}
        onClose={handleUserMenuClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={() => handleUserAction("edit-profile")}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit profile</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleUserAction("gallery")}>
          <ListItemIcon>
            <PhotoLibraryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Gallery</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleUserAction("logout")}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Log Out</ListItemText>
        </MenuItem>
      </Menu>
    </div>
  );
}

DrawerAppBar.propTypes = {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};
export default DrawerAppBar;
