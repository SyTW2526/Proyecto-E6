import { useState } from "react";
import PropTypes from "prop-types";
import * as Astronomy from "astronomy-engine";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Box,
  Alert,
} from "@mui/material";
import Brightness3Icon from "@mui/icons-material/Brightness3";

/**
 * Busca eclipses solares usando Astronomy Engine
 * @param {number} lat - Latitud del observador
 * @param {number} lng - Longitud del observador
 * @param {Date} startDate - Fecha inicial de búsqueda
 * @param {number} maxEclipses - Número máximo de eclipses a buscar
 * @returns {Array} - Array de eclipses encontrados
 */
function findNextEclipses(lat, lng, startDate, maxEclipses = 50) {
  console.log("Searching eclipses for:", {
    lat,
    lng,
    startDate: startDate.toISOString(),
  });

  const eclipses = [];
  const observer = new Astronomy.Observer(lat, lng, 0); // lat, lng, elevation

  // Buscar eclipses solares globales
  let searchDate = new Astronomy.AstroTime(startDate);

  for (let i = 0; i < maxEclipses; i++) {
    try {
      // Buscar el próximo eclipse solar global
      const globalEclipse = Astronomy.SearchGlobalSolarEclipse(searchDate);

      if (!globalEclipse) break;

      // Calcular si el eclipse es visible desde la ubicación del observador
      const localEclipse = Astronomy.SearchLocalSolarEclipse(
        globalEclipse.peak,
        observer
      );

      // Verificar si el eclipse es visible desde esta ubicación
      if (localEclipse && localEclipse.kind && localEclipse.obscuration > 0) {
        // localEclipse.peak.time es el AstroTime que contiene la fecha
        const eclipseDate = localEclipse.peak.time.date;

        eclipses.push({
          date: eclipseDate,
          obscuration: localEclipse.obscuration * 100, // Convertir a porcentaje
        });

        console.log("Eclipse found:", {
          date: eclipseDate.toISOString(),
          obscuration: (localEclipse.obscuration * 100).toFixed(2) + "%",
          type: localEclipse.kind,
          altitude: localEclipse.peak.altitude.toFixed(2) + "°",
        });
      }

      // Avanzar la búsqueda después de este eclipse (+ 20 días para evitar duplicados)
      searchDate = globalEclipse.peak.AddDays(20);
    } catch (error) {
      console.error("Error buscando eclipse:", error);
      break;
    }
  }

  return eclipses;
}

function NextEclipseButton({ lat, lng }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [eclipses, setEclipses] = useState([]);
  const [error, setError] = useState(null);

  const handleOpen = () => {
    setIsOpen(true);
    calculateEclipses();
  };

  const handleClose = () => {
    setIsOpen(false);
    setError(null);
  };

  const calculateEclipses = async () => {
    setIsCalculating(true);
    setError(null);
    setEclipses([]);

    try {
      // Ejecutar el cálculo en un setTimeout para no bloquear la UI
      setTimeout(() => {
        try {
          const startDate = new Date();
          const foundEclipses = findNextEclipses(lat, lng, startDate, 50);

          if (foundEclipses.length === 0) {
            setError("No visible solar eclipses found for this location.");
          } else {
            // Filter duplicates by date (same day)
            const uniqueEclipses = foundEclipses.filter(
              (eclipse, index, self) => {
                return (
                  index ===
                  self.findIndex((e) => {
                    const date1 = new Date(eclipse.date).toDateString();
                    const date2 = new Date(e.date).toDateString();
                    return date1 === date2;
                  })
                );
              }
            );
            setEclipses(uniqueEclipses);
          }
        } catch (err) {
          console.error("Error calculating eclipses:", err);
          setError("Error calculating eclipses. Please try again.");
        } finally {
          setIsCalculating(false);
        }
      }, 100);
    } catch (err) {
      console.error("Error:", err);
      setError("Error starting calculation.");
      setIsCalculating(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZoneName: "short",
    });
  };

  return (
    <>
      {/* Botón Next Eclipse */}
      <Button
        variant="contained"
        onClick={handleOpen}
        startIcon={<Brightness3Icon />}
        sx={{
          background: "linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)",
          color: "white",
          fontWeight: "bold",
          fontSize: "1rem",
          padding: "12px 24px",
          borderRadius: "25px",
          textTransform: "none",
          boxShadow: "0 3px 5px 2px rgba(255, 105, 135, .3)",
          transition: "all 0.3s ease",
          "&:hover": {
            background: "linear-gradient(45deg, #FF8E53 30%, #FE6B8B 90%)",
            transform: "translateY(-2px)",
            boxShadow: "0 6px 10px 2px rgba(255, 105, 135, .4)",
          },
        }}
      >
        Next Eclipse
      </Button>

      {/* Dialog con información de eclipses */}
      <Dialog
        open={isOpen}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        aria-labelledby="eclipse-dialog-title"
      >
        <DialogTitle id="eclipse-dialog-title">
          Upcoming Solar Eclipses
        </DialogTitle>
        <DialogContent>
          <Box sx={{ minHeight: "200px" }}>
            {isCalculating ? (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 2,
                  py: 4,
                }}
              >
                <CircularProgress />
                <Typography>
                  Searching for the next 50 visible solar eclipses...
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Using high-precision astronomical calculations
                </Typography>
              </Box>
            ) : error ? (
              <Alert severity="warning">{error}</Alert>
            ) : eclipses.length > 0 ? (
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 2 }}
                >
                  Location: Lat {lat.toFixed(4)}°, Lng {lng.toFixed(4)}°
                </Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>
                  Found <strong>{eclipses.length}</strong> visible solar
                  eclipses:
                </Typography>
                <Box
                  sx={{
                    maxHeight: "400px",
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2,
                  }}
                >
                  {eclipses.map((eclipse, index) => (
                    <Box
                      key={index}
                      sx={{
                        p: 2,
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        backgroundColor:
                          index === 0 ? "action.hover" : "transparent",
                      }}
                    >
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {index === 0
                          ? "🌟 Next Eclipse"
                          : `Eclipse #${index + 1}`}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Date:</strong> {formatDate(eclipse.date)}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Maximum obscuration:</strong>{" "}
                        {eclipse.obscuration.toFixed(2)}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Typography>Click to search for eclipses.</Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

NextEclipseButton.propTypes = {
  lat: PropTypes.number.isRequired,
  lng: PropTypes.number.isRequired,
};

export default NextEclipseButton;
