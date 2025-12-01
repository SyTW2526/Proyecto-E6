import { SunCalc } from "../three-app/suncalc.js";
import React, { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import NextEclipseButton from "../components/next-eclipse-button/NextEclipseButton.jsx";
import { useAppContext } from "../AppContext.jsx";

import {
  Box,
  Typography,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  Slide,
} from "@mui/material";

// Animación del diálogo
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const getPhaseEmoji = (phase) => {
  if (phase < 0.03) return "🌑"; // Nueva
  if (phase < 0.22) return "🌒"; // Creciente
  if (phase < 0.28) return "🌓"; // Cuarto creciente
  if (phase < 0.47) return "🌔"; // Gibosa creciente
  if (phase < 0.53) return "🌕"; // Llena
  if (phase < 0.72) return "🌖"; // Gibosa menguante
  if (phase < 0.78) return "🌗"; // Cuarto menguante
  if (phase < 0.97) return "🌘"; // Menguante
  return "🌑"; // Nueva
};

const getPhaseName = (phase) => {
  if (phase < 0.03) return "LUNA NUEVA";
  if (phase < 0.22) return "CRECIENTE";
  if (phase < 0.28) return "CUARTO CRECIENTE";
  if (phase < 0.47) return "GIBOSA CRECIENTE";
  if (phase < 0.53) return "LUNA LLENA";
  if (phase < 0.72) return "GIBOSA MENGUANTE";
  if (phase < 0.78) return "CUARTO MENGUANTE";
  if (phase < 0.97) return "MENGUANTE";
  return "LUNA NUEVA";
};

function AstronomicalEvents() {
  const { latitudeState, longitudeState } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(null);
  const [moonData, setMoonData] = useState(null);
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState([]);

  const lat = latitudeState || 40.4168; // Madrid por defecto
  const lon = longitudeState || -3.7038;

  // Cargar fases lunares del mes
  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const moonEvents = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i, 12, 0, 0);
      const isoDate = date.toISOString().split("T")[0];
      const illumination = SunCalc.getMoonIllumination(date);
      const emoji = getPhaseEmoji(illumination.phase);

      moonEvents.push({
        title: emoji,
        date: isoDate,
        display: "background",
        classNames: ["moon-event"],
      });
    }

    setEvents(moonEvents);
  }, []);

  const handleDateClick = (info) => {
    const dateStr = info.dateStr;
    const date = new Date(dateStr + "T12:00:00");

    setSelectedDate(dateStr);

    // Calcular datos de la luna usando SunCalc
    const illumination = SunCalc.getMoonIllumination(date);
    const position = SunCalc.getMoonPosition(date, lat, lon);
    const times = SunCalc.getMoonTimes(date, lat, lon);

    const moonInfo = {
      phase: illumination.phase,
      phaseName: getPhaseName(illumination.phase),
      illumination: (illumination.fraction * 100).toFixed(1),
      moonrise: times.rise
        ? times.rise.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A",
      moonset: times.set
        ? times.set.toLocaleTimeString("es-ES", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A",
      distance: Math.round(position.distance),
    };

    setMoonData(moonInfo);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setMoonData(null);
  };

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: "#f5f5f5",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      <Paper
        sx={{
          p: 3,
          width: "100%",
          maxWidth: 900,
          borderRadius: 3,
          backgroundColor: "white",
        }}
        elevation={3}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" fontWeight="bold">
            Calendario de Efemérides Astronómicas
          </Typography>
          <NextEclipseButton lat={lat} lng={lon} />
        </Box>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Cada día muestra su fase lunar. Pulsa sobre cualquier día para ver
          información detallada.
        </Typography>

        <style>
          {`
            /* Efecto hover para los días del calendario */
            .fc-daygrid-day:hover {
              background-color: #e3f2fd !important;
              cursor: pointer;
              transition: background-color 0.3s ease;
            }
            
            .fc-daygrid-day:hover .fc-daygrid-day-number {
              color: #1976d2;
              font-weight: 600;
              transform: scale(1.1);
              transition: all 0.2s ease;
            }
            
            .fc-daygrid-day-frame {
              min-height: 70px;
              position: relative;
            }

            /* Estilo para los emojis de luna en la esquina superior izquierda */
            .fc-bg-event.moon-event {
              background: transparent !important;
              border: none !important;
              opacity: 1 !important;
            }

            .fc-bg-event.moon-event .fc-event-title {
              position: absolute;
              top: 2px;
              left: 2px;
              font-size: 1.4em;
              z-index: 3;
              line-height: 1;
              pointer-events: none;
              opacity: 1 !important;
              filter: none !important;
            }

            /* Forzar opacidad completa en todos los elementos del evento */
            .fc-bg-event.moon-event * {
              opacity: 1 !important;
            }

            /* Asegurar que el número del día esté visible */
            .fc-daygrid-day-top {
              position: relative;
              z-index: 2;
            }
          `}
        </style>

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          height="auto"
          locale="es"
          events={events}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          dateClick={handleDateClick}
          displayEventTime={false}
        />

        <Dialog
          open={open}
          onClose={handleClose}
          TransitionComponent={Transition}
        >
          <DialogTitle>Fase lunar del {selectedDate}</DialogTitle>
          <DialogContent
            sx={{
              backgroundColor: "white",
              textAlign: "center",
            }}
          >
            {moonData ? (
              <Box sx={{ p: 1 }}>
                <Typography variant="h3">
                  {getPhaseEmoji(moonData.phase)}
                </Typography>
                <Typography variant="h6" mb={1}>
                  {moonData.phaseName.replace(/_/g, " ")}
                </Typography>
                <Typography>
                  <strong>Salida de la luna:</strong> {moonData.moonrise}
                </Typography>
                <Typography>
                  <strong>Puesta de la luna:</strong> {moonData.moonset}
                </Typography>
                <Typography>
                  <strong>Distancia:</strong> {moonData.distance} km
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  <strong>Iluminación:</strong> {moonData.illumination}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Number(moonData.illumination)}
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
