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

function SidePanel() {
  const drawerWidth = 220;
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
            color: "gray",
            textTransform: "none",
          }}
        >
          Report bug
        </Button>
        <Button
          startIcon={<HelpOutlineIcon />}
          sx={{
            justifyContent: "flex-start",
            color: "gray",
            textTransform: "none",
          }}
        >
          Help
        </Button>
      </Stack>
    </Drawer>
  );
}

export default SidePanel;
