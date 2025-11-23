import Box from "@mui/material/Box";
import ChartMoonAlt from "../components/chart/ChartMoonAlt";
import MoonInfoCard from "../components/info-cards/MoonInfoCard";
import ChartSunAlt from "../components/chart/ChartSunAlt";
import SunInfoCard from "../components/info-cards/SunInfoCard";
import PlayButton from "../components/play-button/PlayButton";
import ThreeComponent from "../three-app/main_three";

function HomePage() {
  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100%",
        flex: 1,
        overflow: "hidden",
      }}
    >
      {/* Columna izquierda: Charts e InfoCards - 25% */}
      <Box
        sx={{
          width: "25%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          gap: 1,
          padding: 2,
          overflowY: "auto",
          boxSizing: "border-box",
        }}
      >
        <ChartMoonAlt />
        <MoonInfoCard />
        <ChartSunAlt />
        <SunInfoCard />
      </Box>

      {/* Columna derecha: ThreeComponent y PlayButton - 75% */}
      <Box
        sx={{
          width: "75%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: 2,
          paddingLeft: 0,
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{ flex: 1, minHeight: 0, marginBottom: 2, overflow: "hidden" }}
        >
          <ThreeComponent />
        </Box>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            flexShrink: 0,
            marginBottom: 2,
          }}
        >
          <PlayButton />
        </Box>
      </Box>
    </Box>
  );
}
export default HomePage;
