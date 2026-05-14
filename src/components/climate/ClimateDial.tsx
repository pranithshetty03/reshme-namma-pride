"use client";

import type { ClimateStatus } from "@/types";

interface Props {
  status: ClimateStatus;
  temp?: number;
  hum?: number;
  size?: number;
}

const STATUS_CONFIG = {
  SAFE:    { color: "#2E7D4F", bg: "#E8F5EF", label: "SAFE",    emoji: "✅" },
  CAUTION: { color: "#D4820A", bg: "#FEF3E2", label: "CAUTION", emoji: "⚠️" },
  DANGER:  { color: "#C0392B", bg: "#FDECEA", label: "DANGER",  emoji: "🚨" },
};

export default function ClimateDial({ status, temp, hum, size = 160 }: Props) {
  const cfg = STATUS_CONFIG[status];
  const r = size / 2;
  const strokeWidth = size * 0.065;
  const radius = r - strokeWidth;

  // Arc from 150° to 30° (210° sweep = 7/12 of circle), clockwise
  const startAngle = 150 * (Math.PI / 180);
  const endAngle = 30 * (Math.PI / 180);

  // Map status to a needle angle (150° → 30° range)
  const needleMap = { SAFE: 0.82, CAUTION: 0.5, DANGER: 0.15 };
  const needlePos = needleMap[status];
  const totalSweep = 360 - 120; // 240 degrees
  const needleAngle = 150 - needlePos * totalSweep; // in degrees
  const needleRad = needleAngle * (Math.PI / 180);
  const needleLen = radius * 0.72;
  const nx = r + Math.cos(needleRad) * needleLen;
  const ny = r - Math.sin(needleRad) * needleLen;

  function arc(startDeg: number, endDeg: number) {
    const sa = startDeg * (Math.PI / 180);
    const ea = endDeg * (Math.PI / 180);
    const x1 = r + Math.cos(sa) * radius;
    const y1 = r - Math.sin(sa) * radius;
    const x2 = r + Math.cos(ea) * radius;
    const y2 = r - Math.sin(ea) * radius;
    const largeArc = Math.abs(startDeg - endDeg) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 0 ${x2} ${y2}`;
  }

  return (
    <div
      className="flex flex-col items-center"
      style={{ transition: "all 0.4s ease" }}
    >
      <svg
        width={size}
        height={size * 0.72}
        viewBox={`0 0 ${size} ${size * 0.75}`}
        className={status === "DANGER" ? "dial-danger" : ""}
      >
        {/* Track — grey */}
        <path
          d={arc(150, 30)}
          fill="none"
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Coloured arc */}
        <path
          d={arc(150, 30)}
          fill="none"
          stroke={cfg.color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          opacity="0.25"
        />
        {/* Zone arcs */}
        <path d={arc(150, 90)} fill="none" stroke="#C0392B" strokeWidth={strokeWidth * 0.5} strokeLinecap="round" opacity="0.5" />
        <path d={arc(90, 50)} fill="none" stroke="#D4820A" strokeWidth={strokeWidth * 0.5} strokeLinecap="round" opacity="0.5" />
        <path d={arc(50, 30)} fill="none" stroke="#2E7D4F" strokeWidth={strokeWidth * 0.5} strokeLinecap="round" opacity="0.5" />

        {/* Needle */}
        <line
          x1={r} y1={r}
          x2={nx} y2={ny}
          stroke={cfg.color}
          strokeWidth={3}
          strokeLinecap="round"
          style={{ transition: "all 0.6s cubic-bezier(.34,1.56,.64,1)" }}
        />
        {/* Needle hub */}
        <circle cx={r} cy={r} r={size * 0.05} fill={cfg.color} />

        {/* Status text */}
        <text
          x={r} y={size * 0.68}
          textAnchor="middle"
          fontSize={size * 0.1}
          fontWeight="bold"
          fill={cfg.color}
          fontFamily="system-ui"
        >
          {cfg.label}
        </text>
      </svg>

      {/* Readings below dial */}
      {(temp !== undefined || hum !== undefined) && (
        <div className="flex gap-4 mt-1">
          {temp !== undefined && (
            <span className="text-sm font-semibold text-gray-600">
              🌡️ {temp}°C
            </span>
          )}
          {hum !== undefined && (
            <span className="text-sm font-semibold text-gray-600">
              💧 {hum}%
            </span>
          )}
        </div>
      )}
    </div>
  );
}
