import React from "react";
import { LINK_KINDS } from "@/lib/boardLibrary";

export default function FlowOverlay({ rooms, connections, cellSize, width, height }) {
  const byId = rooms.reduce((m, r) => { m[r.id] = r; return m; }, {});
  const center = (r) => ({ x: (r.x + r.w / 2) * cellSize, y: (r.y + r.h / 2) * cellSize });

  return (
    <svg className="absolute inset-0 pointer-events-none" width={width} height={height} style={{ zIndex: 5 }}>
      {connections.map((c, i) => {
        const a = byId[c.from], b = byId[c.to];
        if (!a || !b) return null;
        const ca = center(a), cb = center(b);
        const k = LINK_KINDS[c.kind] || LINK_KINDS.normal;
        return (
          <line
            key={i}
            x1={ca.x} y1={ca.y} x2={cb.x} y2={cb.y}
            stroke={k.stroke} strokeWidth={k.width}
            strokeDasharray={k.dash || undefined}
            opacity={0.85}
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}