import { useMemo } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import { useAppContext } from "../../AppContext";
import { SunCalc } from "../../three-app/suncalc";

export default function MoonInfoCard() {
  const { actualDate, latitudeState, longitudeState } = useAppContext();

  const moonData = useMemo(() => {
    const date = actualDate?.toDate
      ? actualDate.toDate()
      : new Date(actualDate);
    const lat = latitudeState || 40.4168;
    const lng = longitudeState || -3.7038;

    const moonPos = SunCalc.getMoonPosition(date, lat, lng);
    const moonTimes = SunCalc.getMoonTimes(date, lat, lng);
    const moonIllum = SunCalc.getMoonIllumination(date);

    const altitude = ((moonPos.altitude * 180) / Math.PI).toFixed(1);
    const azimuth = ((moonPos.azimuth * 180) / Math.PI).toFixed(1);
    const phase = (moonIllum.fraction * 100).toFixed(0);

    const formatTime = (time) => {
      if (!time) return "N/A";
      return time.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    return {
      altitude,
      azimuth,
      phase,
      moonrise: formatTime(moonTimes.rise),
      moonset: formatTime(moonTimes.set),
    };
  }, [actualDate, latitudeState, longitudeState]);

  return (
    <Card>
      <CardActionArea
        sx={{
          display: "flex",
          flexDirection: "row-reverse",
          backgroundColor: "rgb(50, 50 , 50)",
        }}
      >
        <CardMedia
          component="img"
          height="150"
          image="/moon_close.jpeg"
          alt="moon photo"
        />
        <CardContent>
          <Typography
            gutterBottom
            variant="h5"
            component="div"
            sx={{
              color: "rgb(240,240,240)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Moon
          </Typography>
          <Typography
            variant="body1"
            color="rgb(200,200,200)"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Alt/Az: {moonData.altitude}°, {moonData.azimuth}°
          </Typography>
          <Typography
            variant="body1"
            color="rgb(200,200,200)"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Rise: {moonData.moonrise}
          </Typography>
          <Typography
            variant="body1"
            color="rgb(200,200,200)"
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Set: {moonData.moonset}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
