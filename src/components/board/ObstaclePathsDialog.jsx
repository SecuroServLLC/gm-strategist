import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Route, Eye, MessageSquare, Brain, FlaskConical, Swords, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const PATH_META = {
  smart: { icon: Eye, color: "text-emerald-400", border: "border-emerald-500/40", bg: "bg-emerald-500/5", chip: "bg-emerald-500/15 text-emerald-300" },
  social: { icon: MessageSquare, color: "text-sky-400", border: "border-sky-500/40", bg: "bg-sky-500/5", chip: "bg-sky-500/15 text-sky-300" },
  psychological: { icon: Brain, color: "text-purple-400", border: "border-purple-500/40", bg: "bg-purple-500/5", chip: "bg-purple-500/15 text-purple-300" },
  physical: { icon: FlaskConical, color: "text-amber-400", border: "border-amber-500/40", bg: "bg-amber-500/5", chip: "bg-amber-500/15 text-amber-300" },
  brutal: { icon: Swords, color: "text-rose-400", border: "border-rose-500/40", bg: "bg-rose-500/5", chip: "bg-rose-500/15 text-rose-300" },
};

const SOURCE_LABEL = { nearby_room: "Nærliggende rom", inventory: "Inventar", skill: "Ferdighet" };

export default function ObstaclePathsDialog({ open, onClose, obstacleLabel, data, loading }) {
  const paths = data?.paths || [];

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-xl max-h-[82vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Route className="w-5 h-5 text-primary" /> 5 løsningsveier</DialogTitle>
          <DialogDescription>Hinder: <span className="text-foreground font-medium">{obstacleLabel}</span> — fem faste DnD-ferdighetsveier med krav og utfall.</DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="w-7 h-7 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-2.5">
            {paths.map((p, i) => {
              const m = PATH_META[p.key] || PATH_META.brutal;
              const Icon = m.icon;
              const r = p.requirement || {};
              return (
                <div key={i} className={cn("rounded-lg border p-3", m.border, m.bg)}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon className={cn("w-4 h-4", m.color)} />
                    <span className={cn("text-[10px] px-2 py-0.5 rounded-md font-semibold", m.chip)}>{p.title}</span>
                    <span className="text-[10px] text-muted-foreground ml-auto">DC {p.difficulty}</span>
                  </div>
                  {p.skills?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-1.5">
                      {p.skills.map((s, j) => (
                        <span key={j} className="text-[9px] px-1.5 py-0.5 rounded border border-border/60 text-muted-foreground">{s}</span>
                      ))}
                    </div>
                  )}
                  {p.method && <div className="text-[11px] text-foreground leading-snug mb-2">{p.method}</div>}
                  <div className="space-y-1">
                    <div className="flex items-start gap-1.5 text-[11px] leading-snug">
                      <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
                      <span className="text-muted-foreground"><span className="text-foreground/90">Krever:</span> {r.what}
                      {r.source && <span className="text-muted-foreground/80"> — {SOURCE_LABEL[r.source] || r.source}</span>}
                      {r.room_label && <span className="text-muted-foreground/80">: {r.room_label}</span>}
                      {r.item_name && <span className="text-muted-foreground/80">: {r.item_name}</span>}
                      {r.skill && <span className="text-muted-foreground/80">: {r.skill}</span>}
                      </span>
                    </div>
                    <div className="flex items-start gap-1.5 text-[11px] leading-snug rounded-md bg-emerald-500/10 border border-emerald-500/25 p-1.5">
                      <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-400" />
                      <span className="text-muted-foreground"><span className="text-emerald-300/90">Suksess:</span> {p.success}</span>
                    </div>
                    <div className="flex items-start gap-1.5 text-[11px] leading-snug rounded-md bg-rose-500/10 border border-rose-500/25 p-1.5">
                      <X className="w-3.5 h-3.5 shrink-0 mt-0.5 text-rose-400" />
                      <span className="text-muted-foreground"><span className="text-rose-300/90">Fiasko:</span> {p.failure}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}