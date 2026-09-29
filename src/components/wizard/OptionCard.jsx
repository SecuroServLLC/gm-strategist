import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OptionCard({ option, selected, onClick }) {
  const Icon = option.icon;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-left rounded-xl border p-4 transition-all flex gap-3 items-start w-full",
        selected
          ? "border-primary bg-primary/10 shadow-sm"
          : "border-border bg-card/40 hover:border-primary/40 hover:bg-accent/30"
      )}
    >
      {Icon && (
        <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", selected ? "text-primary" : "text-muted-foreground")} />
      )}
      <div className="flex-1 min-w-0">
        <p className="font-medium leading-tight">{option.label}</p>
        {option.desc && <p className="text-xs text-muted-foreground mt-1">{option.desc}</p>}
      </div>
      {selected && <Check className="w-4 h-4 text-primary shrink-0" />}
    </button>
  );
}