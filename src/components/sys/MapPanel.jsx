import React, { useState } from "react";
import LiveMap from "@/components/maps/LiveMap";

export default function MapPanel({ maps }) {
  const [selectedId, setSelectedId] = useState('');
  if (!maps?.length) return <p className="text-sm text-muted-foreground">No maps available.</p>;
  const current = maps.find((map) => map.id === selectedId) || [...maps].sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))[0];
  return <div className="space-y-3">
    <label className="block text-sm">Map
      <select className="block mt-1 w-full rounded-md border border-input bg-background p-2" value={current.id} onChange={(e) => setSelectedId(e.target.value)}>
        {maps.map((map) => <option key={map.id} value={map.id}>{map.title}</option>)}
      </select>
    </label>
    <h3 className="font-heading text-xl">{current.title}</h3>
    <p className="text-xs text-muted-foreground">Click revealed locations to inspect them. The GM controls movement and exploration.</p>
    <LiveMap key={current.id} map={current} />
  </div>;
}