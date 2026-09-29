import React from "react";
import { cn } from "@/lib/utils";

const KIND = {
  note: { label: "Notat", dot: "bg-muted-foreground", border: "border-l-muted" },
  roll: { label: "Terning", dot: "bg-primary", border: "border-l-primary" },
  loot: { label: "Bytte", dot: "bg-amber-500", border: "border-l-amber-500" },
  combat: { label: "Kamp", dot: "bg-red-500", border: "border-l-red-500" },
  milestone: { label: "Milepæl", dot: "bg-emerald-500", border: "border-l-emerald-500" },
  other: { label: "Annet", dot: "bg-slate-500", border: "border-l-slate-500" },
};

export default function LogFeed({ events, emptyText = "Ingen hendelser enda." }) {
  if (!events || events.length === 0) {
    return <p className="text-sm text-muted-foreground italic">{emptyText}</p>;
  }
  const sorted = [...events].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  return (
    <div className="space-y-2">
      {sorted.map((e) => {
        const k = KIND[e.kind] || KIND.note;
        return (
          <div key={e.id} className={cn("pl-3 py-2 border-l-2", k.border)}>
            <div className="flex items-center gap-2 mb-0.5">
              <span className={cn("w-2 h-2 rounded-full", k.dot)} />
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{k.label}</span>
            </div>
            <p className="text-sm">{e.text}</p>
          </div>
        );
      })}
    </div>
  );
}