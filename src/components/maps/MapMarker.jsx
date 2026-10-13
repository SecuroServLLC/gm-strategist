import React, { useRef, useState } from "react";
import { MapPin, Check, UserRound } from "lucide-react";
import { TOKEN_TYPES } from "@/lib/tokenTypes";
import { clamp, mapPoint } from "@/lib/interactiveMap";

const RELATION_RING = {
  friend: "#22c55e",
  neutral: "#64748b",
  enemy: "#ef4444",
};

const HEALTH_RING = {
  full: "#86efac",
  wounded: "#fbbf24",
  critical: "#f97316",
  dead: "#475569",
};

export default function MapMarker({ marker, editable, selected, onSelect, onMove }) {
  const drag = useRef(null);
  const [position, setPosition] = useState(null);
  const point = position || marker;
  const tokenDef = marker.kind === "token" ? (TOKEN_TYPES[marker.token_type] || TOKEN_TYPES.human) : null;
  const Icon = marker.kind === "place" ? (marker.visited ? Check : MapPin) : (tokenDef?.Icon || UserRound);
  const relation = marker.relation || "neutral";
  const health = marker.health_status || "full";
  const relationColor = RELATION_RING[relation];
  const healthColor = HEALTH_RING[health];
  const isDead = health === "dead";

  const start = (e) => {
    e.stopPropagation();
    if (!editable || e.button !== 0) return;
    drag.current = { surface: e.currentTarget.closest('[data-map-surface]'), moved: false };
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e) => {
    if (!drag.current) return;
    drag.current.moved = true;
    setPosition(mapPoint(e, drag.current.surface));
  };
  const end = (e) => {
    if (!drag.current) return;
    if (drag.current.moved) onMove(mapPoint(e, drag.current.surface));
    drag.current = null; setPosition(null);
  };

  return (
    <button type="button"
      title={`${marker.name}${marker.kind === 'token' && tokenDef ? ` · ${tokenDef.label} · ${relation}` : ''}`}
      aria-label={`${marker.kind === 'place' ? 'Location' : 'Token'}: ${marker.name}`}
      aria-pressed={selected}
      className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center min-w-11 min-h-11 rounded-full shadow-md touch-none focus-visible:ring-2 focus-visible:ring-ring ${editable ? 'cursor-grab' : 'cursor-pointer'}`}
      style={{
        left: `${point.x}%`, top: `${point.y}%`,
        backgroundColor: selected ? 'hsl(var(--primary))' : 'hsl(var(--card))',
        color: selected ? 'hsl(var(--primary-foreground))' : 'hsl(var(--card-foreground))',
        border: `3px solid ${relationColor}`,
        boxShadow: `inset 0 0 0 2px ${healthColor}, 0 0 6px ${relationColor}66`,
        opacity: isDead ? 0.55 : 1,
      }}
      onPointerDown={start} onPointerMove={move} onPointerUp={end}
      onPointerCancel={() => { drag.current = null; setPosition(null); }}
      onClick={(e) => { e.stopPropagation(); onSelect(); }}
      onKeyDown={(e) => {
        if (!editable || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
        e.preventDefault();
        onMove({ x: clamp(marker.x + (e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0)), y: clamp(marker.y + (e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0)) });
      }}>
      <Icon className="w-4 h-4" />
      <span className="text-[10px] max-w-20 truncate px-1">{marker.name}</span>
      {isDead && <span className="absolute -top-1 -right-1 text-[10px] font-bold text-rose-500 bg-card rounded-full w-4 h-4 flex items-center justify-center leading-none">✕</span>}
    </button>
  );
}