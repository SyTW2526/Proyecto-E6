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
  const phaseUpper = phase ? phase.toUpperCase() : "";
  
  switch (phaseUpper) {
    case "NEW_MOON":
      return "🌑";
    case "WAXING_CRESCENT":
      return "🌒";
    case "FIRST_QUARTER":
      return "🌓";
    case "WAXING_GIBBOUS":
      return "🌔";
    case "FULL_MOON":
      return "🌕";
    case "WANING_GIBBOUS":
      return "🌖";
    case "LAST_QUARTER":
      return "🌗";
    case "WANING_CRESCENT":
      return "🌘";
    default:
      console.warn(`⚠️ Fase desconocida: "${phase}"`);
      return "🌙";
  }
};

function AstronomicalEvents() {
  const [selectedDate, setSelectedDate] = useState(null);
  const [moonData, setMoonData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const apiKey = "a8d8720296e64d4e890601380772c514";
  const lat = 40.4168;
  const lon = -3.7038;

  // 🔹 Cargar TODAS las fases lunares del mes
  useEffect(() => {
    async function loadMoonEvents() {
      setLoadingEvents(true);
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const moonEvents = [];

      console.log(`🔍 Cargando fases lunares para todos los días de ${year}-${month + 1}`);

      // Procesar todos los días del mes
      for (let i = 1; i <= daysInMonth; i++) {
        const date = new Date(year, month, i);
        const isoDate = date.toISOString().split("T")[0];

        try {
          const res = await fetch(
            `https://api.ipgeolocation.io/astronomy?apiKey=${apiKey}&lat=${lat}&long=${lon}&date=${isoDate}`
          );
          const data = await res.json();

          // LOG MUY DETALLADO para ver qué devuelve la API
          console.log(`📅 ${isoDate}:`, {
            moon_phase: data.moon_phase,
            moon_illumination: data.moon_illumination_percentage,
            respuestaCompleta: data
          });

          // Agregar el emoji de la fase lunar de cada día
          if (data.moon_phase) {
            const emoji = getPhaseEmoji(data.moon_phase);
            console.log(`  ➡️ Emoji asignado: ${emoji} para fase "${data.moon_phase}"`);
            
            moonEvents.push({
              title: emoji,
              date: isoDate,
              display: "background",
              classNames: ["moon-event", data.moon_phase.toLowerCase().replace(/\s+/g, '-')]
            });
          } else {
            console.warn(`  ⚠️ No hay moon_phase para ${isoDate}`);
          }

          // Pequeña pausa para no saturar la API
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`❌ Error obteniendo fase lunar para ${isoDate}:`, error);
        }
      }

      console.log("✅ Fases lunares cargadas:", moonEvents);
      console.log("📊 Total de días con fase lunar:", moonEvents.length);
      
      // Conteo por tipo de emoji
      const emojiCount = {};
      moonEvents.forEach(e => {
        emojiCount[e.title] = (emojiCount[e.title] || 0) + 1;
      });
      console.log("📈 Distribución de emojis:", emojiCount);
      
      setEvents(moonEvents);
      setLoadingEvents(false);
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
          Cada día muestra su fase lunar. Pulsa sobre cualquier día para ver información detallada.
        </Typography>

        {loadingEvents && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary">
              Cargando fases lunares del mes...
            </Typography>
          </Box>
        )}

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
          headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
          dateClick={handleDateClick}
          displayEventTime={false}
        />

        <Dialog open={open} onClose={handleClose} TransitionComponent={Transition}>
          <DialogTitle>Fase lunar del {selectedDate}</DialogTitle>
          <DialogContent
            sx={{
              backgroundColor: "white",
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
                  {moonData.moon_phase.replace(/_/g, " ")}
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
                  <strong>Iluminación:</strong> {Math.abs(moonData.moon_illumination_percentage)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={Number(moonData.moon_illumination_percentage)}
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