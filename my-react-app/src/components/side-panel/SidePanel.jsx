import React from "react";
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
          {sidepanelitems.map((item, index) => (
            <Fragment key={item.id}>
              <ListItem disablePadding sx={{ width: "100%" }}>
                <Button
                  sx={{
                    justifyContent: "flex-start",
                    color: "rgb(240,240,240)",
                    textTransform: "none",
                    width: "100%",
                    "&:hover": {
                      backgroundColor: "rgb(70, 70, 70)",
                      color: "#ffffff",
                    },
                  }}
                  startIcon={item.icon}
                  fullWidth
                  onClick={item.onClick}
                >
                  {item.label}
                </Button>
              </ListItem>
              {index < sidepanelitems.length - 1 && (
                <Divider sx={{ backgroundColor: "white", height: "1px" }} />
              )}
            </Fragment>
          ))}
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
        <DialogTitle>{"How to use the app?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="help-dialog-description">
            {`Lunar Phases Visualizer is an app to check real-time positions of the Moon and the Sun.
            The following picture shows the sections of the UI:\n
            The navigator will ask for permission to access your geographical coordinates. Click accept.
            Do not worry if there is any problem while accessing the data, you can modify it from the
            side panel at any time!`}
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
