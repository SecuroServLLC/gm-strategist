import React, { useRef } from "react";
import { Image } from "@/components/ui/image";
import MapMarker from "@/components/maps/MapMarker";
import { cellAt, isVisible, mapPoint } from "@/lib/interactiveMap";

export default function MapSurface({ map, state, editable, mode, selectedId, onSelect, onMove, onPlace, onPaint }) {
  const painting = useRef(false);
  const paintMode = editable && ['reveal', 'hide'].includes(mode);
  const paint = (e) => { const p = mapPoint(e, e.currentTarget); onPaint(cellAt(p.x, p.y)); };
  return <div data-map-surface className={`relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-muted select-none ${editable ? 'touch-none' : ''}`}
    onClick={(e) => { if (editable && ['token', 'place'].includes(mode)) onPlace(mapPoint(e, e.currentTarget)); }}
    onPointerDownCapture={(e) => { if (!paintMode || e.button !== 0) return; e.stopPropagation(); painting.current = true; e.currentTarget.setPointerCapture(e.pointerId); paint(e); }}
    onPointerMove={(e) => { if (painting.current) paint(e); }} onPointerUp={() => { painting.current = false; }} onPointerCancel={() => { painting.current = false; }}>
    {map.sketch_url ? <Image src={map.sketch_url} alt={map.title || 'Adventure map'} fittingType="fit" className="absolute inset-0 w-full h-full pointer-events-none" draggable={false} /> : <div className="absolute inset-0 story-canvas-bg flex items-center justify-center"><span className="text-muted-foreground text-sm">Blank Map</span></div>}
    {state.fog_enabled && <div className="absolute inset-0 z-10 grid pointer-events-none" style={{ gridTemplateColumns: 'repeat(20, 1fr)', gridTemplateRows: 'repeat(15, 1fr)' }}>
      {Array.from({ length: 300 }, (_, cell) => {
        const hidden = !state.revealed.includes(cell);
        return <button key={cell} type="button" tabIndex={paintMode ? 0 : -1} aria-hidden={!paintMode} aria-label={`${hidden ? 'Hidden' : 'Revealed'} area, row ${Math.floor(cell / 20) + 1}, column ${cell % 20 + 1}`} disabled={!paintMode}
          onClick={(e) => { e.stopPropagation(); if (paintMode) onPaint(cell); }}
          className={`min-w-0 min-h-0 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary ${hidden ? (editable ? 'bg-background/70' : 'bg-background') : 'bg-transparent'} ${paintMode ? 'border border-border/40' : ''}`} />;
      })}
    </div>}
    {state.markers.filter((marker) => editable || isVisible(state, marker)).map((marker) => <MapMarker key={marker.id} marker={marker} editable={editable && mode === 'move'} selected={selectedId === marker.id} onSelect={() => onSelect(marker.id)} onMove={(point) => onMove(marker.id, point)} />)}
  </div>;
}