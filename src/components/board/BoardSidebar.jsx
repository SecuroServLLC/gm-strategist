import React, { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { BOARD_ELEMENTS, CATEGORY_LABELS, COLOR_CLASSES, isCompatible } from "@/lib/boardLibrary";
import { ICON_MAP } from "@/lib/boardIcons";

const CATS = ["terrain", "enemy", "npc", "building", "hazard"];

export default function BoardSidebar({ selected }) {
  const [open, setOpen] = useState({ terrain: true, enemy: true, npc: true, building: true, hazard: true });

  return (
    <div className="h-full overflow-y-auto scrollbar-thin pr-1">
      <div className="text-xs text-muted-foreground mb-2 px-1 leading-relaxed">
        {selected
          ? <span>Matcher for <span className="text-foreground font-medium">{selected.label}</span> — like elementer lyser, ille_passende tones ned.</span>
          : "Velg et element på brettet for å se hva som passer."}
      </div>
      {CATS.map((cat) => {
        const els = BOARD_ELEMENTS.filter((e) => e.category === cat);
        const isOpen = open[cat];
        return (
          <div key={cat} className="mb-2">
            <button onClick={() => setOpen((o) => ({ ...o, [cat]: !o[cat] }))} className="flex items-center gap-1.5 w-full text-left text-xs uppercase tracking-widest text-muted-foreground hover:text-foreground py-1">
              {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />} {CATEGORY_LABELS[cat]}
            </button>
            {isOpen && (
              <div className="grid grid-cols-2 gap-1.5 mt-1">
                {els.map((el) => {
                  const cc = COLOR_CLASSES[el.color];
                  const Icon = ICON_MAP[el.icon] || ICON_MAP.MapPin;
                  const compat = selected ? isCompatible(selected, el) : null;
                  return (
                    <div
                      key={el.key}
                      draggable
                      onDragStart={(e) => e.dataTransfer.setData("application/json", JSON.stringify(el))}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-lg border p-2 cursor-grab active:cursor-grabbing transition-all",
                        cc.chip,
                        selected && compat && "ring-2 " + cc.ring,
                        selected && !compat && "opacity-30 grayscale"
                      )}
                      title={el.tags.join(", ")}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-[10px] leading-tight text-center">{el.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}