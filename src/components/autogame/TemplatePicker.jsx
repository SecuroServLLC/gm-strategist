import React from "react";
import { Castle, Globe, Mountain, DoorOpen, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { AUTOGAME_TEMPLATES } from "@/lib/autogameTemplates";

const ICONS = { Castle, Globe, Mountain, DoorOpen };

export default function TemplatePicker({ selected, onSelect }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {Object.values(AUTOGAME_TEMPLATES).map((t) => {
        const Icon = ICONS[t.icon] || Globe;
        const isSel = selected === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onSelect(t.id)}
            className={cn(
              "text-left p-4 rounded-xl border transition-all relative",
              isSel
                ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                : "border-border bg-card/50 hover:border-primary/40 hover:bg-card"
            )}
          >
            {isSel && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
              </div>
            )}
            <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center mb-2.5", isSel ? "bg-primary/20" : "bg-accent/40")}>
              <Icon className={cn("w-5 h-5", isSel ? "text-primary" : "text-muted-foreground")} />
            </div>
            <h3 className="font-heading text-base font-semibold mb-1">{t.name}</h3>
            <p className="text-xs text-muted-foreground mb-2.5 leading-relaxed">{t.description}</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(t.stats).map(([k, v]) => (
                <span key={k} className="text-[10px] px-1.5 py-0.5 rounded bg-muted/50 text-muted-foreground">
                  {v} {k}
                </span>
              ))}
            </div>
          </button>
        );
      })}
    </div>
  );
}