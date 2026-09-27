import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronDown, ChevronRight, Compass } from "lucide-react";

export default function FlowPanel({ style, analyzing, analysis, onAnalyze, roomCount }) {
  const [open, setOpen] = useState(true);
  const disabled = !style || analyzing || roomCount < 2;
  const tips = analysis?.suggestions || [];

  return (
    <div className="flex items-start gap-3 ml-auto">
      <Button onClick={onAnalyze} disabled={disabled} size="sm" className="gap-2">
        <Sparkles className="w-4 h-4" /> {analyzing ? "Analyserer…" : "Analyser flyt"}
      </Button>
      {!style && <span className="text-xs text-muted-foreground self-center">Velg en dungeon-stil først.</span>}
      {tips.length > 0 && (
        <div className="rounded-lg border border-border bg-card/50 p-2.5 max-w-sm">
          <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1.5 text-xs font-medium text-primary mb-1.5">
            {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            <Compass className="w-3.5 h-3.5" /> Flyt-tips
          </button>
          {open && (
            <ul className="space-y-1">
              {tips.map((s, i) => (
                <li key={i} className="text-[11px] text-muted-foreground leading-snug flex gap-1.5">
                  <span className="text-primary shrink-0">•</span><span>{s}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}