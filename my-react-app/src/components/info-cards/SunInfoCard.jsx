import { useMemo } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";
import { useAppContext } from "../../AppContext";
import { SunCalc } from "../../three-app/suncalc";

export default function SunInfoCard() {
  const { actualDate, latitudeState, longitudeState } = useAppContext();

  const sunData = useMemo(() => {
    const date = actualDate?.toDate
      ? actualDate.toDate()
      : new Date(actualDate);
    const lat = latitudeState || 40.4168;
    const lng = longitudeState || -3.7038;

    const sunPos = SunCalc.getPosition(date, lat, lng);
    const sunTimes = SunCalc.getTimes(date, lat, lng);

    const altitude = ((sunPos.altitude * 180) / Math.PI).toFixed(1);
    const azimuth = ((sunPos.azimuth * 180) / Math.PI).toFixed(1);

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
      sunrise: formatTime(sunTimes.sunrise),
      sunset: formatTime(sunTimes.sunset),
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
          image="/sun_eclipse.jpg"
          alt="sun photo"
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
            Sun
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
            Alt/Az: {sunData.altitude}°, {sunData.azimuth}°
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
            Sunrise: {sunData.sunrise}
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
            Sunset: {sunData.sunset}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
