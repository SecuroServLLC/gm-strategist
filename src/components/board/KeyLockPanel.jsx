import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Lock, KeyRound, AlertTriangle, ChevronDown, ChevronRight } from "lucide-react";

export default function KeyLockPanel({ keyLock, loading, onAnalyze, roomCount, hasDoors }) {
  const [open, setOpen] = useState(true);
  const disabled = loading || roomCount < 2;
  const placements = keyLock?.keyPlacements || [];
  const warnings = keyLock?.skipWarnings || [];
  const notes = keyLock?.notes || [];
  const hasContent = placements.length > 0 || warnings.length > 0 || notes.length > 0;

  return (
    <div className="flex items-start gap-3">
      <Button onClick={onAnalyze} disabled={disabled} size="sm" variant="outline" className="gap-2 border-amber-500/40 text-amber-300 hover:bg-amber-500/10">
        <Lock className="w-4 h-4" /> {loading ? "Analyserer…" : "Nøkkel-lås"}
      </Button>
      {hasContent && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 max-w-sm">
          <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 text-xs font-medium text-amber-300 mb-1.5">
            {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <KeyRound className="w-3.5 h-3.5" /> Nøkkel-lås-analyse
          </button>
          {open && (
            <div className="space-y-2">
              {placements.map((p, i) => (
                <div key={i} className="text-[11px] text-muted-foreground leading-snug">
                  <span className="text-amber-300 font-medium">Nøkkel i {p.key_room_label || p.key_room_id}</span> låser døren i <span className="text-amber-300">{p.door_label || p.door_id}</span>
                  {p.reason ? <span className="block text-muted-foreground/80">— {p.reason}</span> : null}
                </div>
              ))}
              {warnings.map((w, i) => (
                <div key={i} className="flex gap-1.5 text-[11px] text-rose-300 leading-snug">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" /> <span>{w}</span>
                </div>
              ))}
              {notes.map((n, i) => (
                <div key={i} className="text-[11px] text-muted-foreground leading-snug">• {n}</div>
              ))}
              {!hasDoors && notes.length === 0 && (
                <div className="text-[11px] text-muted-foreground">Tips: dra inn et «Låst dør»-element for å få forslag til nøkkelgøyming.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}