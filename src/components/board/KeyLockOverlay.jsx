import React from "react";

// Tegner strekede amber-linjer fra låste dører til rommet som skal skjule nøkkelen.
export default function KeyLockOverlay({ rooms, placements, cellSize, width, height }) {
  const byId = rooms.reduce((m, r) => { m[r.id] = r; return m; }, {});
  const center = (r) => ({ x: (r.x + r.w / 2) * cellSize, y: (r.y + r.h / 2) * cellSize });

  return (
    <svg className="absolute inset-0 pointer-events-none" width={width} height={height} style={{ zIndex: 6 }}>
      {placements.map((p, i) => {
        const a = byId[p.door_id], b = byId[p.key_room_id];
        if (!a || !b) return null;
        const ca = center(a), cb = center(b);
        return (
          <g key={i}>
            <line x1={ca.x} y1={ca.y} x2={cb.x} y2={cb.y} stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" opacity={0.8} strokeLinecap="round" />
            <circle cx={cb.x} cy={cb.y} r={6} fill="#f59e0b" opacity={0.95} stroke="#fde68a" strokeWidth={1.5} />
          </g>
        );
      })}
    </svg>
  );
}