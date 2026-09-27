import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Lightbulb, AlertTriangle, MapPin, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const APPROACH = {
  brutal: { label: "Brutalt (Kraft)", color: "bg-rose-500/15 border-rose-500/40 text-rose-300" },
  smart: { label: "Smart (Kjemi/Fysikk)", color: "bg-sky-500/15 border-sky-500/40 text-sky-300" },
  sneaky: { label: "Lumsk (Tyveri)", color: "bg-purple-500/15 border-purple-500/40 text-purple-300" },
  creative: { label: "Kreativ (Omvei)", color: "bg-amber-500/15 border-amber-500/40 text-amber-300" },
  magical: { label: "Magisk", color: "bg-purple-500/15 border-purple-500/40 text-purple-300" },
};
const FEASIBILITY = {
  ready: { label: "Klar nå", color: "text-emerald-400" },
  partial: { label: "Delvis", color: "text-amber-400" },
  missing: { label: "Mangler ressurser", color: "text-rose-400" },
};
const SOURCE_LABEL = { nearby_room: "Nærliggende rom", inventory: "Inventar", skill: "Ferdighet" };

export default function SolutionsDialog({ open, onClose, obstacleLabel, data, loading }) {
  const solutions = data?.solutions || [];
  const placements = data?.placements || [];
  const notes = data?.notes || [];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Lightbulb className="w-5 h-5 text-primary" /> Flere løsninger</DialogTitle>
          <DialogDescription>Hindring: <span className="text-foreground font-medium">{obstacleLabel}</span> — AI-forslåtte veier med krav og konsekvenser.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-7 h-7 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-3">
            {solutions.map((s, i) => {
              const ap = APPROACH[s.approach] || APPROACH.brutal;
              const fb = FEASIBILITY[s.feasibility] || FEASIBILITY.missing;
              return (
                <div key={i} className="rounded-lg border border-border bg-card/60 p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-md border font-medium", ap.color)}>{ap.label}</span>
                    <span className={cn("text-[10px] font-semibold ml-auto", fb.color)}>{fb.label}</span>
                  </div>
                  <div className="text-sm font-medium text-foreground">{s.title}</div>
                  {s.method && <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{s.method}</div>}
                  <div className="mt-1.5 space-y-1">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Krav</div>
                    {(s.requirements || []).map((r, j) => (
                      <div key={j} className="flex items-start gap-1.5 text-[11px] leading-snug">
                        <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-primary/60" />
                        <span>
                          <span className="text-foreground">{r.what}</span>
                          <span className="text-muted-foreground"> — {SOURCE_LABEL[r.source] || r.source}</span>
                          {r.room_label && <span className="text-muted-foreground/80">: {r.room_label}</span>}
                          {r.item_name && <span className="text-muted-foreground/80">: {r.item_name}</span>}
                          {r.skill && <span className="text-muted-foreground/80">: {r.skill}{r.detail ? ` (${r.detail})` : ""}</span>}
                        </span>
                      </div>
                    ))}
                    {(s.requirements || []).length === 0 && <div className="text-[11px] text-muted-foreground/80">Ingen spesielle krav.</div>}
                  </div>
                  {s.consequence && (
                    <div className="flex items-start gap-1.5 mt-2 rounded-md bg-amber-500/10 border border-amber-500/30 p-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                      <span className="text-[11px] text-amber-200/90 leading-snug">{s.consequence}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {placements.length > 0 && (
              <div className="rounded-lg border border-sky-500/30 bg-sky-500/5 p-2.5">
                <div className="text-[10px] uppercase tracking-widest text-sky-300 mb-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> Plasseringsforslag</div>
                <div className="space-y-1">
                  {placements.map((p, i) => (
                    <div key={i} className="text-[11px] leading-snug">
                      <span className="text-sky-200 font-medium">{p.item}</span>
                      {p.room_label && <span className="text-muted-foreground"> i {p.room_label}</span>}
                      <span className="block text-muted-foreground/80">{p.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {notes.map((n, i) => (
              <div key={i} className="flex gap-1.5 text-[11px] text-muted-foreground leading-snug">
                <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5 text-primary/60" /> <span>{n}</span>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}