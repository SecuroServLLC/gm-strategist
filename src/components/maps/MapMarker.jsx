import React, { useRef, useState } from "react";
import { MapPin, UserRound, Check } from "lucide-react";
import { clamp, mapPoint } from "@/lib/interactiveMap";

export default function MapMarker({ marker, editable, selected, onSelect, onMove }) {
  const drag = useRef(null);
  const [position, setPosition] = useState(null);
  const point = position || marker;
  const Icon = marker.kind === "place" ? (marker.visited ? Check : MapPin) : UserRound;
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
  return <button type="button" title={marker.name} aria-label={`${marker.kind === 'place' ? 'Location' : 'Token'}: ${marker.name}`} aria-pressed={selected}
    className={`absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center min-w-11 min-h-11 rounded-lg border shadow-md touch-none focus-visible:ring-2 focus-visible:ring-ring ${selected ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-card-foreground border-primary/60'} ${editable ? 'cursor-grab' : 'cursor-pointer'}`}
    style={{ left: `${point.x}%`, top: `${point.y}%` }} onPointerDown={start} onPointerMove={move} onPointerUp={end}
    onPointerCancel={() => { drag.current = null; setPosition(null); }} onClick={(e) => { e.stopPropagation(); onSelect(); }}
    onKeyDown={(e) => {
      if (!editable || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault(); onMove({ x: clamp(marker.x + (e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0)), y: clamp(marker.y + (e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0)) });
    }}>
    <Icon className="w-4 h-4" /><span className="text-[10px] max-w-20 truncate px-1">{marker.name}</span>
  </button>;
}