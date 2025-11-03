import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import SearchIcon from "@mui/icons-material/Search";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

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
    icon: <EventIcon />,
    label: "Astronomical Events",
    onClick: () => {
      // Navegación a About
      console.log("Navigate to About");
    },
  },
  {
    id: 2,
    icon: <SearchIcon />,
    label: "Next Sun Eclipse",
    onClick: () => {
      // Navegación a Settings
      console.log("Navigate to Settings");
    },
  },
  {
    id: 3,
    icon: <PeopleAltIcon />,
    label: "Visit Other Profiles",
    onClick: () => {
      // Navegación a Settings
      console.log("Navigate to Settings");
    },
  },
];
