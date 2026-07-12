import { TABLE } from "../../config/billiardsPresets.js";
import { partitionVectorData } from "../../lib/vectorRender.js";

export default function PhotoVectorOverlay({ vectorData }) {
  const { lines, balls } = partitionVectorData(vectorData);
  if (!vectorData.length) return null;

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox={`0 0 ${TABLE.w} ${TABLE.h}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      {lines.map((line) => (
        <line
          key={line.ball_id}
          x1={line.start.x}
          y1={line.start.y}
          x2={line.end.x}
          y2={line.end.y}
          stroke={line.color}
          strokeWidth={0.14}
          strokeDasharray="0.45 0.35"
          opacity={0.92}
        />
      ))}
      {balls.map((b) => (
        <g key={b.ball_id}>
          <circle
            cx={b.start.x}
            cy={b.start.y}
            r={TABLE.ballR}
            fill={b.color}
            stroke={b.ball_id === "ghost" ? "#00ff66" : "#1e293b"}
            strokeWidth={0.12}
            strokeDasharray={b.ball_id === "ghost" ? "0.35 0.25" : undefined}
            opacity={b.ball_id === "ghost" ? 0.75 : 0.95}
          />
        </g>
      ))}
    </svg>
  );
}
