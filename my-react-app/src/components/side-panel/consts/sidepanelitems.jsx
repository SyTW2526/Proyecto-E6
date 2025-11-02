import HomeIcon from "@mui/icons-material/Home";
import InfoIcon from "@mui/icons-material/Info";
import SettingsIcon from "@mui/icons-material/Settings";

export const sidepanelitems = [
  {
    id: 0,
    icon: <HomeIcon />,
    label: "Home",
    onClick: () => {
      // Navegación a Home
      console.log("Navigate to Home");
    },
  },
  {
    id: 1,
    icon: <InfoIcon />,
    label: "About",
    onClick: () => {
      // Navegación a About
      console.log("Navigate to About");
    },
  },
  {
    id: 2,
    icon: <SettingsIcon />,
    label: "Settings",
    onClick: () => {
      // Navegación a Settings
      console.log("Navigate to Settings");
    },
  },
];
