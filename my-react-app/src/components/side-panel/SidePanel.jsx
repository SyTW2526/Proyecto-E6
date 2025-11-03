import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import Button from "@mui/material/Button";
import { Stack } from "@mui/material";
import { sidepanelitems } from "./consts/sidepanelitems";
import { Box } from "@mui/material";
import { Fragment } from "react";

import SendIcon from "@mui/icons-material/Send";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

function SidePanel() {
  const drawerWidth = 220;
  const navigate = useNavigate();
  const location = useLocation();
  const [isHelpDialogOpen, setIsHelpDialogOpen] = React.useState(false);

  const handleHelpClick = () => {
    setIsHelpDialogOpen(true);
  };

  const handleCloseHelpDialog = () => {
    setIsHelpDialogOpen(false);
  };
  return (
    <Drawer
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          backgroundColor: "rgb(29,29,29)",
          color: "rgb(240,240,240)",
          zIndex: 1,
        },
      }}
      variant="permanent"
      anchor="left"
    >
      <Toolbar />
      <Divider
        sx={{ backgroundColor: "white", height: "3px", marginTop: "20px" }}
      />
      <Box sx={{ backgroundColor: "rgb(50, 50 , 50)" }}>
        <List sx={{ padding: 0 }}>
          {sidepanelitems.map((item, index) => {
            const isActive = location.pathname === item.path;

            return (
              <Fragment key={item.id}>
                <ListItem disablePadding sx={{ width: "100%" }}>
                  <Button
                    sx={{
                      justifyContent: "flex-start",
                      color: "rgb(240,240,240)",
                      textTransform: "none",
                      width: "100%",
                      backgroundColor: isActive
                        ? "rgba(255, 123, 0, 0.35)"
                        : "transparent",
                      fontWeight: isActive ? 600 : 400,
                      "&:hover": {
                        backgroundColor: isActive
                          ? "rgba(255, 123, 0, 0.35)"
                          : "rgb(70, 70, 70)",
                        color: "#ffffff",
                      },
                    }}
                    startIcon={item.icon}
                    fullWidth
                    onClick={() => {
                      if (item.id !== 2) {
                        navigate(item.path);
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                </ListItem>
                {index < sidepanelitems.length - 1 && (
                  <Divider sx={{ backgroundColor: "white", height: "1px" }} />
                )}
              </Fragment>
            );
          })}
        </List>
      </Box>
      <Divider sx={{ backgroundColor: "white", height: "3px" }} />
      <Stack
        spacing={1}
        sx={{ marginTop: "auto", padding: 2, color: "darkgray" }}
      >
        <Button
          startIcon={<SendIcon />}
          sx={{
            justifyContent: "flex-start",
            color: "#bdbdbd",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "#ffffff",
            },
          }}
          onClick={() =>
            window.open(
              "https://github.com/SyTW2526/Proyecto-E6/issues",
              "_blank"
            )
          }
        >
          Report bug
        </Button>
        <Button
          startIcon={<HelpOutlineIcon />}
          sx={{
            justifyContent: "flex-start",
            color: "#bdbdbd",
            textTransform: "none",
            "&:hover": {
              backgroundColor: "rgba(255, 255, 255, 0.1)",
              color: "#ffffff",
            },
          }}
          onClick={handleHelpClick}
        >
          Help
        </Button>
      </Stack>

      {/* Diálogo de ayuda */}
      <Dialog
        open={isHelpDialogOpen}
        keepMounted
        onClose={handleCloseHelpDialog}
        aria-describedby="help-dialog-description"
      >
        <DialogTitle>{"How to use Artemis?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="help-dialog-description" component="div">
            <p>
              Artemis is a social network for lunar photography featuring a 3D
              visualizer and astronomical ephemeris calendar.
            </p>
            <p>
              <strong>Main Features:</strong>
            </p>
            <ul style={{ paddingLeft: "20px", margin: "10px 0" }}>
              <li>
                <strong>Home:</strong> Interactive 3D lunar phase visualizer
                with real-time Moon and Sun positions
              </li>
              <li>
                <strong>Astronomical Events:</strong> Calendar with lunar
                eclipses, super moons, and planetary occultations
              </li>
              <li>
                <strong>Gallery:</strong> Manage and showcase your
                astrophotography with detailed metadata
              </li>
              <li>
                <strong>Community:</strong> Explore photos from other users,
                interact with likes and comments
              </li>
              <li>
                <strong>Next Eclipse Prediction:</strong> Calculate exact dates
                and locations for upcoming solar eclipses
              </li>
            </ul>
            <p>
              The app will request your geographic coordinates for accurate
              celestial calculations. You can modify your location settings
              anytime from the side panel.
            </p>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseHelpDialog}
            autoFocus
            variant="text"
            sx={{ fontWeight: "bold", color: "primary.main" }}
          >
            CLOSE
          </Button>
        </DialogActions>
      </Dialog>
    </Drawer>
  );
}

export default SidePanel;
