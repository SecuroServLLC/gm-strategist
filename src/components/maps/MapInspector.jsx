import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import MapCharacterPicker from "@/components/maps/MapCharacterPicker";

export default function MapInspector({ marker, editable, campaignId, onChange, onRemove, onClose }) {
  if (!marker) return null;
  return <section aria-label="Marker details" className="rounded-xl border border-border bg-card p-4 space-y-3">
    <div className="flex justify-between items-center gap-3"><h3 className="font-heading text-xl">{marker.kind === 'place' ? 'Location' : 'Token'}: {marker.name}</h3><Button type="button" variant="ghost" onClick={onClose}>Close</Button></div>
    {editable ? <>
      {marker.kind === 'token' && <MapCharacterPicker campaignId={campaignId} marker={marker} onChange={onChange} />}
      <label className="block text-sm">Name<Input className="mt-1" maxLength={80} value={marker.name} onChange={(e) => onChange({ name: e.target.value })} /></label>
      <label className="block text-sm">{marker.kind === 'place' ? 'What players find here' : 'Token details'}<Textarea className="mt-1" maxLength={3000} value={marker.description || ''} onChange={(e) => onChange({ description: e.target.value })} placeholder="Describe the place, encounter, clue, or object…" /></label>
      <p className="text-xs text-muted-foreground">These details are visible to players when this marker is revealed.</p>
      {marker.kind === 'place' && <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={!!marker.visited} onChange={(e) => onChange({ visited: e.target.checked })} /> Explored</label>}
      <Button type="button" variant="destructive" onClick={() => { if (window.confirm(`Remove ${marker.name || 'this marker'} from the map?`)) onRemove(); }}>Remove Marker</Button>
    </> : <><p className="text-sm whitespace-pre-wrap break-words">{marker.description || 'There are no details for this marker yet.'}</p>{marker.kind === 'place' && <p className="text-xs text-muted-foreground">{marker.visited ? 'Explored' : 'Not yet explored'}</p>}</>}
  </section>;
}