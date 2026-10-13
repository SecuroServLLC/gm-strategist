import React from "react";
import { Button } from "@/components/ui/button";
import { TOKEN_TYPES, TOKEN_GROUPS } from "@/lib/tokenTypes";

export default function MapToolbar({ mode, setMode, fog, onFog, preview, setPreview, tokenType, setTokenType }) {
  return <div className="space-y-3">
    <div className="flex flex-wrap gap-2" aria-label="Map tools">
      {!preview && [['move', 'Move / Inspect'], ['token', 'Add Token'], ['place', 'Add Location'], ...(fog ? [['reveal', 'Reveal Area'], ['hide', 'Hide Area']] : [])].map(([id, label]) =>
        <Button key={id} type="button" className="min-h-11" variant={mode === id ? 'default' : 'outline'} aria-pressed={mode === id} onClick={() => setMode(id)}>{label}</Button>)}
      {!preview && <Button type="button" className="min-h-11" variant="outline" aria-pressed={fog} onClick={onFog}>Fog of War: {fog ? 'On' : 'Off'}</Button>}
      <Button type="button" className="min-h-11" variant={preview ? 'default' : 'secondary'} aria-pressed={preview} onClick={() => setPreview(!preview)}>{preview ? 'Back to Editing' : 'Player Preview'}</Button>
    </div>
    {!preview && mode === 'token' && (
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Token-type:</span>
        <select className="rounded-md border border-input bg-background px-2 py-1.5 text-sm" value={tokenType || 'human'} onChange={(e) => setTokenType(e.target.value)}>
          {Object.entries(TOKEN_GROUPS).map(([groupKey, groupLabel]) => (
            <optgroup key={groupKey} label={groupLabel}>
              {Object.entries(TOKEN_TYPES).filter(([, def]) => def.group === groupKey).map(([key, def]) => (
                <option key={key} value={key}>{def.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>
    )}
    <p className="text-xs text-muted-foreground">{preview ? 'Only revealed markers are shown. Click a location to inspect it.' : mode === 'move' ? 'Drag markers to move them, or focus a marker and use the arrow keys. Click a location to inspect it.' : mode === 'token' ? 'Choose a token type, click the map to place it, then edit its details below.' : mode === 'place' ? 'Click the map to place a marker, then edit its details below.' : 'Click or paint across grid squares to reveal or hide them.'}</p>
  </div>;
}