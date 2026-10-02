import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import InteractiveMap from "@/components/maps/InteractiveMap";
import { EMPTY_MAP_STATE } from "@/lib/interactiveMap";

export default function PlayMapEditor({ map, onSaved, onDirty }) {
  const [value, setValue] = useState(map.interactive_state || EMPTY_MAP_STATE);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const save = async () => {
    setSaving(true); setError('');
    try {
      await base44.entities.MapItem.update(map.id, { interactive_state: value });
      setDirty(false); onDirty(false); onSaved();
    } catch (e) { setError(`Could not save the map: ${e.message}`); }
    finally { setSaving(false); }
  };
  return <section className="space-y-3">
    <div className="flex items-center justify-between gap-3 flex-wrap"><h2 className="font-heading text-2xl">{map.title}</h2><Button disabled={!dirty || saving} onClick={save}>{saving ? <Loader2 className="animate-spin" /> : <Save />}{saving ? 'Saving…' : 'Save Map'}</Button></div>
    <p role="status" className="text-xs text-muted-foreground">{dirty ? 'Unsaved changes. Save to update the player screens.' : 'Map saved. Player screens show revealed areas and markers.'}</p>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <fieldset disabled={saving} className={saving ? 'pointer-events-none opacity-60' : ''}>
      <InteractiveMap map={map} value={value} onChange={(next) => { setValue(next); setDirty(true); onDirty(true); }} />
    </fieldset>
  </section>;
}