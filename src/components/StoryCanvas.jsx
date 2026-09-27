import React, { useEffect, useRef, useState } from "react";
import { Plus, Sparkles, Dices, Workflow } from "lucide-react";
import { cn } from "@/lib/utils";

const NODE_W = 230;
const NODE_H = 128;
const PAD = 120;

const TYPE_STYLES = {
  scene: { ring: "border-slate-500/40", chip: "bg-slate-500/15 text-slate-300 border-slate-500/30", label: "Scene", dot: "bg-slate-400" },
  choice: { ring: "border-amber-500/50", chip: "bg-amber-500/15 text-amber-300 border-amber-500/30", label: "Valg", dot: "bg-amber-400" },
  dice_challenge: { ring: "border-rose-500/50", chip: "bg-rose-500/15 text-rose-300 border-rose-500/30", label: "Terning", dot: "bg-rose-400" },
  event: { ring: "border-sky-500/50", chip: "bg-sky-500/15 text-sky-300 border-sky-500/30", label: "Hendelse", dot: "bg-sky-400" },
  climax: { ring: "border-fuchsia-500/50", chip: "bg-fuchsia-500/15 text-fuchsia-300 border-fuchsia-500/30", label: "Klimaks", dot: "bg-fuchsia-400" },
  ending: { ring: "border-emerald-500/50", chip: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", label: "Slutt", dot: "bg-emerald-400" },
};

export default function StoryCanvas({ nodes, selectedId, onSelect, onUpdatePosition, onAddChild, onSuggest, loadingSuggest }) {
  const [positions, setPositions] = useState({});
  const dragRef = useRef(null);

  useEffect(() => {
    const map = {};
    nodes.forEach((n) => { map[n.id] = { x: n.position_x || 0, y: n.position_y || 0 }; });
    setPositions(map);
  }, [nodes]);

  const onMove = (e) => {
    const d = dragRef.current;
    if (!d) return;
    const nx = d.origX + (e.clientX - d.startX);
    const ny = d.origY + (e.clientY - d.startY);
    d.x = nx; d.y = ny;
    setPositions((prev) => ({ ...prev, [d.id]: { x: nx, y: ny } }));
  };
  const onUp = () => {
    const d = dragRef.current;
    dragRef.current = null;
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("mouseup", onUp);
    if (d && d.x !== undefined) onUpdatePosition(d.id, Math.round(d.x), Math.round(d.y));
  };

  const startDrag = (e, node) => {
    e.preventDefault();
    e.stopPropagation();
    const p = positions[node.id] || { x: 0, y: 0 };
    dragRef.current = { id: node.id, startX: e.clientX, startY: e.clientY, origX: p.x, origY: p.y };
    onSelect(node.id);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  if (!nodes.length) {
    return (
      <div className="h-full flex items-center justify-center story-canvas-bg rounded-xl border border-border">
        <div className="text-center max-w-sm px-6">
          <Workflow className="w-10 h-10 text-primary/40 mx-auto mb-3" />
          <p className="text-muted-foreground">Ingen scener enda. Legg til den første scenen for å starte historien.</p>
        </div>
      </div>
    );
  }

  const maxX = Math.max(...nodes.map((n) => (positions[n.id]?.x || 0) + NODE_W), 1400) + PAD;
  const maxY = Math.max(...nodes.map((n) => (positions[n.id]?.y || 0) + NODE_H), 900) + PAD;
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  return (
    <div className="h-full overflow-auto scrollbar-thin story-canvas-bg rounded-xl border border-border">
      <div className="relative" style={{ width: maxX, height: maxY }}>
        <svg className="absolute inset-0 pointer-events-none" width={maxX} height={maxY}>
          {nodes.map((n) => {
            if (!n.parent_id || !nodeMap[n.parent_id]) return null;
            const parent = nodeMap[n.parent_id];
            const pc = positions[n.id] || { x: 0, y: 0 };
            const pp = positions[parent.id] || { x: 0, y: 0 };
            const x1 = pp.x + NODE_W / 2;
            const y1 = pp.y + NODE_H;
            const x2 = pc.x + NODE_W / 2;
            const y2 = pc.y;
            const midY = (y1 + y2) / 2;
            const d = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
            const active = selectedId === n.id || selectedId === parent.id;
            return (
              <g key={n.id}>
                <path d={d} fill="none" stroke={active ? "hsl(38 72% 58%)" : "hsl(35 14% 30%)"} strokeWidth={active ? 2.2 : 1.5} opacity={active ? 0.9 : 0.55} />
                {n.branch_label && (
                  <text x={(x1 + x2) / 2} y={midY - 4} fill="hsl(40 20% 70%)" fontSize="11" textAnchor="middle" className="font-body">
                    {n.branch_label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {nodes.map((n) => {
          const p = positions[n.id] || { x: 0, y: 0 };
          const st = TYPE_STYLES[n.node_type] || TYPE_STYLES.scene;
          const selected = selectedId === n.id;
          return (
            <div
              key={n.id}
              className={cn(
                "absolute rounded-xl border bg-card/95 shadow-lg backdrop-blur transition-shadow",
                st.ring,
                selected ? "ring-2 ring-primary shadow-primary/20" : "hover:shadow-xl"
              )}
              style={{ left: p.x, top: p.y, width: NODE_W }}
              onMouseDown={(e) => startDrag(e, n)}
              onClick={() => onSelect(n.id)}
            >
              <div className="px-3.5 pt-3 pb-2 cursor-grab active:cursor-grabbing">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className={cn("inline-flex items-center gap-1 text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border", st.chip)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", st.dot)} /> {st.label}
                  </span>
                  {n.dice_suggestion && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-rose-300/90">
                      <Dices className="w-3 h-3" /> {n.dice_suggestion}
                    </span>
                  )}
                </div>
                <h4 className="font-heading text-base leading-tight text-foreground line-clamp-1">{n.title}</h4>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-snug">{n.summary || n.description?.slice(0, 80)}</p>
              </div>
              <div className="flex border-t border-border/60 divide-x divide-border/60">
                <button
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-accent/50 transition-colors"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); onAddChild(n); }}
                  title="Legg til forgrening"
                >
                  <Plus className="w-3.5 h-3.5" /> Grein
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-1 py-1.5 text-xs text-muted-foreground hover:text-primary hover:bg-accent/50 transition-colors disabled:opacity-50"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => { e.stopPropagation(); onSuggest(n); }}
                  disabled={loadingSuggest}
                  title="Foreslå utvidelse med AI"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Foreslå
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}