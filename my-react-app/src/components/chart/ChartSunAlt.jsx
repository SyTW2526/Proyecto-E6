import { LineChart } from "@mui/x-charts/LineChart";

export default function ChartSunAlt() {
  // Datos de ejemplo para prototipo (curva simulada de altitud solar típica)
  const sunAltitudeData = [
    -30, -25, -20, -15, -10, 0, 15, 30, 45, 55, 60, 65, 70, 65, 60, 55, 45, 30,
    15, 0, -10, -15, -20, -25,
  ];

  const currentHour = 14; // Hora actual de ejemplo

  return (
    <LineChart
      xAxis={[
        {
          data: [
            1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
            20, 21, 22, 23, 24,
          ],
          label: "time (HH)",
        },
      ]}
      series={[
        {
          data: sunAltitudeData,
          label: "Sun altitude (º)",
          color: "#f28e2c",
          showMark: false,
        },
        {
          data: Array.from({ length: 24 }, () => 0),
          color: "red",
          showMark: false,
        },
        {
          data: Array.from({ length: 24 }, (v, i) =>
            i === currentHour - 1 ? sunAltitudeData[i] : null
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
