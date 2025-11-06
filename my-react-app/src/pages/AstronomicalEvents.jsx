import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { Box, Typography, Paper } from "@mui/material";

function AstronomicalEvents() {
  const events = [
    { title: "Luna llena 🌕", date: "2025-11-06" },
    { title: "Eclipse parcial de sol 🌑", date: "2025-11-14" },
    { title: "Lluvia de meteoros Leónidas ☄️", date: "2025-11-17" },
    { title: "Solsticio de invierno ❄️", date: "2025-12-21" },
  ];

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
        elevation={3}
        sx={{
          p: 3,
          width: "100%",
          maxWidth: 900,
          borderRadius: 3,
          backgroundColor: "white",
        }}
      >
        <Typography variant="h5" fontWeight="bold" mb={2}>
          Calendario de Efemérides Astronómicas
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Consulta los próximos eventos astronómicos.
        </Typography>

        <FullCalendar
          plugins={[dayGridPlugin]}
          initialView="dayGridMonth"
          events={events}
          height="auto"
          locale="es"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          eventColor="#1976d2"
        />
      </Paper>
    </Box>
  );
}

export default AstronomicalEvents;

