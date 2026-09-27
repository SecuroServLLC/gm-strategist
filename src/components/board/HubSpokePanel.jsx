import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Compass, GitBranch, AlertTriangle, ChevronDown, ChevronRight, Lightbulb, Route } from "lucide-react";

export default function HubSpokePanel({ hubSpoke, loading, onAnalyze, roomCount }) {
  const [open, setOpen] = useState(true);
  const disabled = loading || roomCount < 2;
  const hubLabel = hubSpoke?.hub_label;
  const zones = hubSpoke?.zones || [];
  const corridors = hubSpoke?.corridors || [];
  const shortcuts = hubSpoke?.shortcuts || [];
  const issues = hubSpoke?.issues || [];
  const notes = hubSpoke?.notes || [];
  const hasContent = !!hubLabel || zones.length > 0 || shortcuts.length > 0 || issues.length > 0 || corridors.length > 0;

  return (
    <div className="flex items-start gap-3">
      <Button onClick={onAnalyze} disabled={disabled} size="sm" variant="outline" className="gap-2 border-amber-500/40 text-amber-300 hover:bg-amber-500/10">
        <Share2 className="w-4 h-4" /> {loading ? "Analyserer…" : "Hub & Spoke"}
      </Button>
      {hasContent && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-2.5 max-w-sm">
          <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 text-xs font-medium text-amber-300 mb-1.5">
            {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <Compass className="w-3.5 h-3.5" /> Hub & Spoke-analyse
          </button>
          {open && (
            <div className="space-y-2">
              {hubLabel && (
                <div className="text-[11px] leading-snug">
                  <span className="text-amber-300 font-medium">Hub:</span> <span className="text-foreground">{hubLabel}</span>
                  <span className="text-muted-foreground"> — sentralt knutepunkt som stråler ut til fløyene.</span>
                </div>
              )}
              {zones.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1"><GitBranch className="w-3 h-3" /> Soner ({zones.length})</div>
                  <div className="space-y-1">
                    {zones.map((z, i) => (
                      <div key={i} className="text-[11px] leading-snug">
                        <span className="text-amber-200 font-medium">{z.name}</span>
                        {z.role && <span className="text-muted-foreground"> — {z.role}</span>}
                        <span className="block text-muted-foreground/80">{(z.room_labels || z.room_ids || []).join(", ")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {shortcuts.length > 0 && (
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1"><Route className="w-3 h-3" /> Hemmelige snarveier</div>
                  <div className="space-y-1">
                    {shortcuts.map((s, i) => (
                      <div key={i} className="text-[11px] leading-snug">
                        <span className="text-sky-300 font-medium">{s.from_label || s.from} ↔ {s.to_label || s.to}</span>
                        {s.description && <span className="block text-muted-foreground/80">{s.description}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {issues.map((iss, i) => (
                <div key={i} className="flex gap-1.5 text-[11px] leading-snug">
                  <AlertTriangle className={iss.severity === "warning" ? "w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-300" : "w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-300/70"} />
                  <span className={iss.severity === "warning" ? "text-rose-300" : "text-muted-foreground"}>{iss.text}</span>
                </div>
              ))}
              {notes.map((n, i) => (
                <div key={i} className="flex gap-1.5 text-[11px] text-muted-foreground leading-snug">
                  <Lightbulb className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-300/70" /> <span>{n}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}