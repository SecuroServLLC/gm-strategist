import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Network, RotateCcw, ChevronDown, ChevronRight, Footprints } from "lucide-react";
import { cn } from "@/lib/utils";
import { NODE_TYPES, COLOR_CLASSES } from "@/lib/boardLibrary";

export default function RoguelikePanel({ nodesResult, loading, onAnalyze, roomCount, visited, onVisit, onReset }) {
  const [open, setOpen] = useState(true);
  const nodes = nodesResult?.nodes || [];
  const branches = nodesResult?.branches || [];
  const entrance = nodesResult?.entrance_id;
  const nodesMap = nodes.reduce((m, n) => { m[n.room_id] = n; return m; }, {});
  const visitedSet = new Set(visited);
  const available = visited.length === 0
    ? (entrance ? [entrance] : [])
    : Array.from(new Set(branches.filter((b) => visitedSet.has(b.from) && !visitedSet.has(b.to)).map((b) => b.to)));
  const disabled = loading || roomCount < 2;

  return (
    <div className="flex items-start gap-3">
      <Button onClick={onAnalyze} disabled={disabled} size="sm" variant="outline" className="gap-2 border-sky-500/40 text-sky-300 hover:bg-sky-500/10">
        <Network className="w-4 h-4" /> {loading ? "Genererer…" : "Roguelike-noder"}
      </Button>
      {nodes.length > 0 && (
        <div className="rounded-lg border border-sky-500/30 bg-sky-500/5 p-2.5 max-w-sm">
          <div className="flex items-center justify-between mb-1.5">
            <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 text-xs font-medium text-sky-300">
              {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />} Node-kart
            </button>
            <button onClick={onReset} className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground">
              <RotateCcw className="w-3 h-3" /> Tilbakestill
            </button>
          </div>
          {open && (
            <div className="space-y-2">
              <div>
                <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1"><Footprints className="w-3 h-3" /> Neste valg ({available.length})</div>
                {available.length === 0 ? (
                  <div className="text-[11px] text-muted-foreground">Ingen flere valg — stien er ferdig.</div>
                ) : (
                  <div className="space-y-1">
                    {available.map((id) => {
                      const n = nodesMap[id];
                      const nt = n ? NODE_TYPES[n.node_type] : null;
                      return (
                        <button key={id} onClick={() => onVisit(id)} className="w-full text-left rounded-md border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 p-1.5 transition-colors">
                          <div className="flex items-center gap-1.5">
                            {nt && <span className={cn("text-[8px] px-1 rounded-sm font-medium", COLOR_CLASSES[nt.color].chip)}>{nt.label}</span>}
                            <span className="text-[11px] font-medium text-foreground">{n?.room_label || id}</span>
                          </div>
                          {n?.preview && <div className="text-[10px] text-muted-foreground leading-snug mt-0.5">{n.preview}</div>}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="text-[10px] text-muted-foreground">Besøkt: {visited.length} rom. Klikk et valg for å gå dit — brettet oppdaterer neste valg.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}