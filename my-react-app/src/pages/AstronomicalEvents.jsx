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
  if (phase < 0.03) return "NEW MOON";
  if (phase < 0.22) return "WAXING CRESCENT";
  if (phase < 0.28) return "FIRST QUARTER";
  if (phase < 0.47) return "WAXING GIBBOUS";
  if (phase < 0.53) return "FULL MOON";
  if (phase < 0.72) return "WANING GIBBOUS";
  if (phase < 0.78) return "LAST QUARTER";
  if (phase < 0.97) return "WANING CRESCENT";
  return "NEW MOON";
};

function AstronomicalEvents() {
  const { latitudeState, longitudeState } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(null);
  const [moonData, setMoonData] = useState(null);
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState([]);

  const lat = latitudeState || 40.4168; // Madrid by default
  const lon = longitudeState || -3.7038;

  // Load monthly moon phases
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

    // Calculate moon data using SunCalc
    const illumination = SunCalc.getMoonIllumination(date);
    const position = SunCalc.getMoonPosition(date, lat, lon);
    const times = SunCalc.getMoonTimes(date, lat, lon);

    const moonInfo = {
      phase: illumination.phase,
      phaseName: getPhaseName(illumination.phase),
      illumination: (illumination.fraction * 100).toFixed(1),
      moonrise: times.rise
        ? times.rise.toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A",
      moonset: times.set
        ? times.set.toLocaleTimeString("en-US", {
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
            Astronomical Events Calendar
          </Typography>
          <NextEclipseButton lat={lat} lng={lon} />
        </Box>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Each day shows its moon phase. Click on any day to see detailed information.
        </Typography>

        <style>
          {`
            /* Hover effect for calendar days */
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

            /* Style for moon emojis in top left corner */
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

            /* Force full opacity on all event elements */
            .fc-bg-event.moon-event * {
              opacity: 1 !important;
            }

            /* Ensure day number is visible */
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
          locale="en"
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
          <DialogTitle>Moon Phase for {selectedDate}</DialogTitle>
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
                  <strong>Moonrise:</strong> {moonData.moonrise}
                </Typography>
                <Typography>
                  <strong>Moonset:</strong> {moonData.moonset}
                </Typography>
                <Typography>
                  <strong>Distance:</strong> {moonData.distance} km
                </Typography>
                <Typography sx={{ mt: 1 }}>
                  <strong>Illumination:</strong> {moonData.illumination}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Number(moonData.illumination)}
                  sx={{ height: 10, borderRadius: 5, mt: 1 }}
                />
              </Box>
            ) : (
              <Typography>No data available for this date.</Typography>
            )}
          </DialogContent>
        </Dialog>
      </Paper>
    </Box>
  );
}

export default AstronomicalEvents;
