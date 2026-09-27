import React from "react";
import { Network } from "lucide-react";
import { cn } from "@/lib/utils";
import { RELATION_KINDS } from "@/lib/boardRelations";
import { Button } from "@/components/ui/button";

export default function RelationsPanel({ active, onToggle, count }) {
  const kinds = Object.entries(RELATION_KINDS);
  return (
    <div className="flex items-center gap-2">
      <Button onClick={onToggle} size="sm" variant="outline" className={cn("gap-2", active && "border-primary/50 bg-primary/10 text-primary")}>
        <Network className="w-4 h-4" /> Relasjonskart {count > 0 && <span className="text-[10px] opacity-70">({count})</span>}
      </Button>
      {active && (
        <div className="hidden lg:flex items-center gap-2 text-[10px] text-muted-foreground">
          {kinds.map(([k, v]) => (
            <span key={k} className="flex items-center gap-1"><span className="w-2 h-2 rounded-full" style={{ background: v.stroke }} />{v.label}</span>
          ))}
        </div>
      )}
    </div>
  );
}