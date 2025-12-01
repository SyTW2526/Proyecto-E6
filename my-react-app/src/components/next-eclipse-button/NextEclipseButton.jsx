import { useState } from "react";
import PropTypes from "prop-types";
import { SunCalc } from "../../three-app/suncalc.js";
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

// Constantes astronómicas
const SUN_RADIUS_KM = 696000;
const MOON_RADIUS_KM = 1737.4;

/**
 * Calcula si hay un eclipse solar y su porcentaje de ocultación
 * @param {Date} date - Fecha a evaluar
 * @param {number} lat - Latitud del observador
 * @param {number} lng - Longitud del observador
 * @returns {Object|null} - { obscuration: number, maxObscuration: number } o null si no hay eclipse
 */
function calculateSolarEclipse(date, lat, lng) {
  // Obtener posiciones del Sol y la Luna
  const sunPos = SunCalc.getPosition(date, lat, lng);
  const moonPos = SunCalc.getMoonPosition(date, lat, lng);

  // Convertir altitudes a grados (vienen en radianes)
  const sunAltDeg = sunPos.altitude * (180 / Math.PI);
  const moonAltDeg = moonPos.altitude * (180 / Math.PI);

  // Si el Sol está por debajo del horizonte, no puede haber eclipse visible
  if (sunAltDeg < -0.5) {
    return null;
  }

  // Convertir azimuts a grados
  const sunAzDeg = sunPos.azimuth * (180 / Math.PI);
  const moonAzDeg = moonPos.azimuth * (180 / Math.PI);

  // Calcular la distancia angular entre Sol y Luna en grados
  const deltaAz = Math.abs(sunAzDeg - moonAzDeg);
  const deltaAlt = Math.abs(sunAltDeg - moonAltDeg);

  // Distancia angular aproximada entre centros
  const angularDistance = Math.sqrt(deltaAz * deltaAz + deltaAlt * deltaAlt);

  // Calcular radios angulares aparentes
  // Distancia a la Luna en km (viene de SunCalc)
  const moonDistKm = moonPos.distance;

  // Distancia al Sol (aproximadamente constante)
  const sunDistKm = 149597870; // 1 UA en km

  // Radio angular del Sol en grados
  const sunAngularRadiusDeg =
    Math.atan(SUN_RADIUS_KM / sunDistKm) * (180 / Math.PI);

  // Radio angular de la Luna en grados
  const moonAngularRadiusDeg =
    Math.atan(MOON_RADIUS_KM / moonDistKm) * (180 / Math.PI);

  // Suma de los radios
  const sumRadii = sunAngularRadiusDeg + moonAngularRadiusDeg;

  // Si la distancia entre centros es mayor que la suma de radios, no hay eclipse
  if (angularDistance > sumRadii) {
    return null;
  }

  // Calcular el porcentaje de ocultación
  // Usamos la fórmula del área de intersección de dos círculos
  const r1 = moonAngularRadiusDeg; // Radio de la Luna
  const r2 = sunAngularRadiusDeg; // Radio del Sol
  const d = angularDistance; // Distancia entre centros

  // Si la Luna está completamente dentro del Sol o viceversa
  if (d <= Math.abs(r1 - r2)) {
    const smallerArea = Math.PI * Math.min(r1, r2) ** 2;
    const sunArea = Math.PI * r2 ** 2;
    const obscuration = (smallerArea / sunArea) * 100;
    return { obscuration, maxObscuration: obscuration };
  }

  // Calcular área de intersección usando la fórmula estándar
  const part1 = r1 * r1 * Math.acos((d * d + r1 * r1 - r2 * r2) / (2 * d * r1));
  const part2 = r2 * r2 * Math.acos((d * d + r2 * r2 - r1 * r1) / (2 * d * r2));
  const part3 =
    0.5 *
    Math.sqrt((-d + r1 + r2) * (d + r1 - r2) * (d - r1 + r2) * (d + r1 + r2));

  const intersectionArea = part1 + part2 - part3;
  const sunArea = Math.PI * r2 * r2;

  const obscuration = (intersectionArea / sunArea) * 100;

  return { obscuration, maxObscuration: obscuration };
}

/**
 * Busca el próximo eclipse solar en un rango de fechas
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @param {Date} startDate - Fecha inicial
 * @param {number} yearsAhead - Años a buscar hacia adelante
 * @returns {Array} - Array de eclipses encontrados
 */
function findNextEclipses(lat, lng, startDate, yearsAhead = 200) {
  const eclipses = [];
  const endDate = new Date(startDate);
  endDate.setFullYear(endDate.getFullYear() + yearsAhead);

  // Iteramos cada día
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    // Revisamos cada hora del día para encontrar el máximo
    let maxEclipse = null;
    let maxDate = null;

    for (let hour = 0; hour < 24; hour++) {
      const testDate = new Date(currentDate);
      testDate.setHours(hour, 0, 0, 0);

      const eclipse = calculateSolarEclipse(testDate, lat, lng);

      if (eclipse && eclipse.obscuration > 0) {
        if (!maxEclipse || eclipse.obscuration > maxEclipse.obscuration) {
          maxEclipse = eclipse;
          maxDate = new Date(testDate);
        }
      }
    }

    // Si encontramos un eclipse este día, lo agregamos
    if (maxEclipse && maxEclipse.obscuration > 0.1) {
      // Umbral mínimo del 0.1%
      eclipses.push({
        date: maxDate,
        obscuration: maxEclipse.maxObscuration,
      });

      // Saltamos unos días para evitar detectar el mismo eclipse
      currentDate.setDate(currentDate.getDate() + 5);
    } else {
      // Avanzamos un día
      currentDate.setDate(currentDate.getDate() + 1);
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
          const foundEclipses = findNextEclipses(lat, lng, startDate, 200);

          if (foundEclipses.length === 0) {
            setError(
              "No se encontraron eclipses solares visibles en los próximos 200 años para esta ubicación."
            );
          } else {
            setEclipses(foundEclipses);
          }
        } catch (err) {
          console.error("Error calculando eclipses:", err);
          setError(
            "Error al calcular los eclipses. Por favor, inténtelo de nuevo."
          );
        } finally {
          setIsCalculating(false);
        }
      }, 100);
    } catch (err) {
      console.error("Error:", err);
      setError("Error al iniciar el cálculo.");
      setIsCalculating(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleString("es-ES", {
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
          Próximos Eclipses Solares
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
                  Calculando eclipses para los próximos 200 años...
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Esto puede tardar unos momentos
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
                  Ubicación: Lat {lat.toFixed(4)}°, Lng {lng.toFixed(4)}°
                </Typography>
                <Typography variant="body2" sx={{ mb: 3 }}>
                  Se encontraron <strong>{eclipses.length}</strong> eclipses
                  solares visibles:
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
                          ? "🌟 Próximo Eclipse"
                          : `Eclipse #${index + 1}`}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Fecha:</strong> {formatDate(eclipse.date)}
                      </Typography>
                      <Typography variant="body1">
                        <strong>Ocultación máxima:</strong>{" "}
                        {eclipse.obscuration.toFixed(2)}%
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Typography>
                Haga clic en "Calcular" para buscar eclipses.
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cerrar
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
