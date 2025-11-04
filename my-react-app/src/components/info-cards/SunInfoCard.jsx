import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import { CardActionArea } from "@mui/material";

export default function SunInfoCard() {
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
            Alt/Az: 45º, 180º
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
            Sunrise: 07:30 AM
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
            Sunset: 06:45 PM
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}
