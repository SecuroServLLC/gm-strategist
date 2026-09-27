import React from "react";
import { RELATION_KINDS } from "@/lib/boardRelations";

export default function RelationsOverlay({ rooms, relations, cellSize, width, height }) {
  const byId = rooms.reduce((m, r) => { m[r.id] = r; return m; }, {});
  const center = (r) => ({ x: (r.x + r.w / 2) * cellSize, y: (r.y + r.h / 2) * cellSize });

  return (
    <svg className="absolute inset-0 pointer-events-none" width={width} height={height} style={{ zIndex: 4 }}>
      {relations.map((c, i) => {
        const a = byId[c.from], b = byId[c.to];
        if (!a || !b) return null;
        const ca = center(a), cb = center(b);
        const k = RELATION_KINDS[c.kind] || RELATION_KINDS.links;
        const mx = (ca.x + cb.x) / 2, my = (ca.y + cb.y) / 2;
        return (
          <g key={i}>
            <line x1={ca.x} y1={ca.y} x2={cb.x} y2={cb.y} stroke={k.stroke} strokeWidth={2} strokeDasharray="5 3" opacity={0.8} strokeLinecap="round" />
            <rect x={mx - 22} y={my - 7} width={44} height={13} rx={3} fill="hsl(30 16% 8%)" opacity={0.9} stroke={k.stroke} strokeWidth={0.5} />
            <text x={mx} y={my + 3} textAnchor="middle" fontSize={8} fill={k.stroke} fontWeight={600}>{c.label}</text>
          </g>
        );
      })}
    </svg>
  );
}