import React from "react";
import { cn } from "@/lib/utils";
import { DUNGEON_STYLES } from "@/lib/boardLibrary";
import { ICON_MAP } from "@/lib/boardIcons";

export default function StyleSelector({ style, onSelect }) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs uppercase tracking-widest text-muted-foreground mr-1">Dungeon-stil:</span>
      {DUNGEON_STYLES.map((s) => {
        const Icon = ICON_MAP[s.icon];
        const active = style === s.key;
        return (
          <button
            key={s.key}
            onClick={() => onSelect(active ? null : s.key)}
            title={s.description}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-md border text-sm transition-colors",
              active ? "bg-primary/15 border-primary/50 text-primary" : "border-border text-muted-foreground hover:text-foreground"
            )}
          >
            {Icon && <Icon className="w-4 h-4" />}
            <span className="font-medium">{s.label}</span>
            <span className="text-[10px] text-muted-foreground">{s.subtitle}</span>
          </button>
        );
      })}
    </div>
  );
}