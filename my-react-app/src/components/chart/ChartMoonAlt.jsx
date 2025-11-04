import { LineChart } from "@mui/x-charts/LineChart";

export default function ChartMoonAlt() {
  // Datos de ejemplo para prototipo (curva simulada de altitud lunar)
  const moonAltitudeData = [
    -20, -15, -10, -5, 0, 10, 20, 30, 40, 45, 50, 55, 60, 55, 50, 45, 40, 30,
    20, 10, 0, -5, -10, -15,
  ];

  const currentHour = 12; // Hora actual de ejemplo

  return (
    <LineChart
      xAxis={[
        {
          data: Array.from({ length: 24 }, (_, i) => i + 1),
          label: "time (HH)",
        },
      ]}
      series={[
        {
          data: moonAltitudeData,
          label: "Moon altitude (º)",
          color: "#af7aa1",
          showMark: false,
        },
        {
          data: Array.from({ length: 24 }, () => 0),
          color: "red",
          showMark: false,
        },
        {
          data: Array.from({ length: 24 }, (v, i) =>
            i === currentHour - 1 ? moonAltitudeData[i] : null
          ),
          color: "black",
        },
      ]}
      height={200}
      margin={{ left: 30, right: 30, top: 30, bottom: 40 }}
      grid={{ vertical: true, horizontal: true }}
    />
  );
}
