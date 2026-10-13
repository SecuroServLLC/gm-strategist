import React, { useRef, useState } from "react";
import MapSurface from "@/components/maps/MapSurface";
import MapToolbar from "@/components/maps/MapToolbar";
import MapInspector from "@/components/maps/MapInspector";
import { EMPTY_MAP_STATE, isVisible } from "@/lib/interactiveMap";

export default function InteractiveMap({ map, value, onChange }) {
  const [mode, setMode] = useState('move');
  const [preview, setPreview] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [tokenType, setTokenType] = useState('human');
  const state = { ...EMPTY_MAP_STATE, ...(value || map.interactive_state) };
  const latest = useRef(state); latest.current = state;
  const editable = !!onChange && !preview;
  const update = (patch) => { const next = { ...latest.current, ...patch }; latest.current = next; onChange(next); };
  const updateMarker = (id, patch) => update({ markers: latest.current.markers.map((m) => m.id === id ? { ...m, ...patch } : m) });
  const paint = (cell) => {
    const cells = latest.current.revealed;
    if ((mode === 'reveal') === cells.includes(cell)) return;
    update({ revealed: mode === 'reveal' ? [...cells, cell] : cells.filter((n) => n !== cell) });
  };
  const place = (point) => {
    const marker = { id: crypto.randomUUID(), kind: mode, name: mode === 'place' ? 'New Location' : 'New Token', description: '', ...(mode === 'token' ? { token_type: tokenType, relation: 'neutral', health_status: 'full' } : {}), ...point };
    update({ markers: [...latest.current.markers, marker] }); setSelectedId(marker.id); setMode('move');
  };
  const selected = state.markers.find((m) => m.id === selectedId && (editable || isVisible(state, m)));
  return <div className="space-y-3">
    {!!onChange && <MapToolbar mode={mode} setMode={setMode} fog={state.fog_enabled} preview={preview} setPreview={setPreview} tokenType={tokenType} setTokenType={setTokenType} onFog={() => { update({ fog_enabled: !state.fog_enabled }); setMode('move'); }} />}
    <MapSurface map={map} state={state} editable={editable} mode={mode} selectedId={selectedId} onSelect={setSelectedId} onMove={updateMarker} onPlace={place} onPaint={paint} />
    {selected && <MapInspector key={selected.id} marker={selected} editable={editable} campaignId={map.campaign_id} onChange={(patch) => updateMarker(selected.id, patch)} onClose={() => setSelectedId(null)} onRemove={() => { update({ markers: state.markers.filter((m) => m.id !== selected.id) }); setSelectedId(null); }} />}
  </div>;
}