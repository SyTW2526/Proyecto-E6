import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  Box,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  CircularProgress,
  LinearProgress,
  Slide,
} from "@mui/material";

// Animación del diálogo
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const getPhaseColor = (phase) => {
  switch (phase) {
    case "NEW_MOON": return "#1a1a1a";
    case "WAXING_CRESCENT": return "#757de8";
    case "FIRST_QUARTER": return "#3949ab";
    case "WAXING_GIBBOUS": return "#7986cb";
    case "FULL_MOON": return "#fff59d";
    case "WANING_GIBBOUS": return "#7986cb";
    case "LAST_QUARTER": return "#3949ab";
    case "WANING_CRESCENT": return "#757de8";
    default: return "#f5f5f5";
  }
};

const getPhaseEmoji = (phase) => {
  switch (phase) {
    case "NEW_MOON": return "🌑";
    case "WAXING_CRESCENT": return "🌒";
    case "FIRST_QUARTER": return "🌓";
    case "WAXING_GIBBOUS": return "🌔";
    case "FULL_MOON": return "🌕";
    case "WANING_GIBBOUS": return "🌖";
    case "LAST_QUARTER": return "🌗";
    case "WANING_CRESCENT": return "🌘";
    default: return "🌙";
  }
};

function AstronomicalEvents() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [moonData, setMoonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState([]);

  const apiKey = "a8d8720296e64d4e890601380772c514";
  const lat = 40.4168;
  const lon = -3.7038;

  // 🔹 Cargar lunas llenas del mes y marcarlas como eventos
  useEffect(() => {
    async function loadMoonEvents() {
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const moonEvents = [];

      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const isoDate = date.toISOString().split("T")[0];

        try {
          const res = await fetch(
            `https://api.ipgeolocation.io/astronomy?apiKey=${apiKey}&lat=${lat}&long=${lon}&date=${isoDate}`
          );
          const data = await res.json();

          // Solo marcar luna llena (iluminación ≥ 99%)
          if (data.moon_illumination && Number(data.moon_illumination) >= 99) {
            moonEvents.push({
              title: "🌕 Luna llena",
              date: isoDate,
              color: "#ffeb3b",
            });
          }
        } catch (error) {
          console.error("Error obteniendo fase lunar:", error);
        }
      }

      setEvents(moonEvents);
    }

    loadMoonEvents();
  }, []);

  const handleDateClick = async (info) => {
    const dateStr = info.dateStr;
    setSelectedDate(dateStr);
    setLoading(true);
    setOpen(true);

    try {
      const res = await fetch(
        `https://api.ipgeolocation.io/astronomy?apiKey=${apiKey}&lat=${lat}&long=${lon}&date=${dateStr}`
      );
      const data = await res.json();
      setMoonData(data);
    } catch (error) {
      console.error("Error fetching moon data:", error);
      setMoonData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setMoonData(null);
  };

  return (
    <Box sx={{ p: 3, backgroundColor: "#f5f5f5", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "flex-start" }}>
      <Paper sx={{ p: 3, width: "100%", maxWidth: 900, borderRadius: 3, backgroundColor: "white" }} elevation={3}>
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Calendario de Efemérides Astronómicas
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Pulsa sobre cualquier día para ver la fase lunar correspondiente.
        </Typography>

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          locale="es"
          events={events} // aquí se muestran los días de luna llena
          headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
          dateClick={handleDateClick}
        />

        <Dialog open={open} onClose={handleClose} TransitionComponent={Transition}>
          <DialogTitle>Fase lunar del {selectedDate}</DialogTitle>
          <DialogContent
            sx={{
              backgroundColor: getPhaseColor(moonData?.moon_phase),
              color: moonData?.moon_phase === "NEW_MOON" ? "#fff" : "#000",
              textAlign: "center",
            }}
          >
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress />
              </Box>
            ) : moonData ? (
              <Box sx={{ p: 1 }}>
                <Typography variant="h3">{getPhaseEmoji(moonData.moon_phase)}</Typography>
                <Typography variant="h6" mb={1}>
                  {moonData.moon_phase}
                </Typography>
                <Typography>
                  <strong>Salida de la luna:</strong> {moonData.moonrise}
                </Typography>
                <Typography>
                  <strong>Puesta de la luna:</strong> {moonData.moonset}
                </Typography>
                <Typography>
                  <strong>Distancia:</strong> {moonData.moon_distance} km
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  <strong>Iluminación:</strong> {moonData.moon_illumination}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Number(moonData.moon_illumination)}
                  sx={{ height: 10, borderRadius: 5, mt: 1 }}
                />
              </Box>
            ) : (
              <Typography>No hay datos disponibles para esta fecha.</Typography>
            )}
          </DialogContent>
        </Dialog>
      </Paper>
    </Box>
  );
}

export default AstronomicalEvents;
