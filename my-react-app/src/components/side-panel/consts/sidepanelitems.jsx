import HomeIcon from "@mui/icons-material/Home";
import EventIcon from "@mui/icons-material/Event";
import SearchIcon from "@mui/icons-material/Search";
import PhotoLibraryIcon from "@mui/icons-material/PhotoLibrary";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";

export const sidepanelitems = [
  {
    id: 0,
    icon: <HomeIcon />,
    label: "Home",
    path: "/",
  },
  {
    id: 1,
    icon: <EventIcon />,
    label: "Astronomical Events",
    path: "/astro-events",
  },
  {
    id: 2,
    icon: <SearchIcon />,
    label: "Next Sun Eclipse",
    path: "/next-eclipse",
  },
  {
    id: 3,
    icon: <PhotoLibraryIcon />,
    label: "Gallery",
    path: "/gallery",
  },
  {
    id: 4,
    icon: <PeopleAltIcon />,
    label: "Community",
    path: "/community",
  },
];
