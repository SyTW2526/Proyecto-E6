import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Dot,
} from "recharts";
import { useAppContext } from "../../AppContext";
import { SunCalc } from "../../three-app/suncalc";

export default function ChartMoonAlt() {
  const { latitudeState, longitudeState, actualDate } = useAppContext();

  const chartData = useMemo(() => {
    const date =
      actualDate && actualDate.toDate
        ? actualDate.toDate()
        : new Date(actualDate);
    const lat = latitudeState || 28.4636;
    const lng = longitudeState || -16.2518;

    const baseDate = new Date(date);
    baseDate.setHours(0, 0, 0, 0);

    const data = [];
    for (let hour = 0; hour < 24; hour++) {
      const hourDate = new Date(baseDate);
      hourDate.setHours(hour);
      const position = SunCalc.getMoonPosition(hourDate, lat, lng);
      const altitudeDeg = (position.altitude * 180) / Math.PI;

      data.push({
        hour: hour,
        altitude: parseFloat(altitudeDeg.toFixed(2)),
        isCurrent: hour === date.getHours(),
      });
    }

    return data;
  }, [latitudeState, longitudeState, actualDate]);

  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    if (payload.isCurrent) {
      return (
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="#fff"
          stroke="#000"
          strokeWidth={2}
        />
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart
        data={chartData}
        margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#333" opacity={0.3} />
        <XAxis
          dataKey="hour"
          label={{ value: "Time (HH)", position: "insideBottom", offset: -10 }}
          stroke="#ccc"
          tick={{ fill: "#ccc" }}
        />
        <YAxis
          label={{ value: "Altitude (°)", angle: -90, position: "insideLeft" }}
          stroke="#ccc"
          tick={{ fill: "#ccc" }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0,0,0,0.8)",
            border: "1px solid #555",
            borderRadius: "4px",
          }}
          labelStyle={{ color: "#fff" }}
          itemStyle={{ color: "#af7aa1" }}
          formatter={(value) => [`${value}°`, "Moon Altitude"]}
          labelFormatter={(label) => `Hour: ${label}:00`}
        />
        <ReferenceLine y={0} stroke="red" strokeDasharray="3 3" />
        <Line
          type="monotone"
          dataKey="altitude"
          stroke="#af7aa1"
          strokeWidth={2}
          dot={<CustomDot />}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
