import React from "react";
import { Heart, Skull, UserMinus } from "lucide-react";
import { cn } from "@/lib/utils";

const STATUS = {
  active: { icon: Heart, cls: "text-emerald-400" },
  absent: { icon: UserMinus, cls: "text-amber-400" },
  dead: { icon: Skull, cls: "text-red-400" },
};

export default function TeamPanel({ partyMembers, characters }) {
  if (partyMembers.length === 0) return <p className="text-sm text-muted-foreground italic">Ingen følgesvenner.</p>;
  return (
    <div className="space-y-2">
      {partyMembers.map((m) => {
        const st = STATUS[m.status] || STATUS.active;
        const Icon = st.icon;
        const char = characters.find((c) => c.id === m.character_id);
        return (
          <div key={m.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/40">
            <div className="w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center shrink-0">
              <Icon className={cn("w-5 h-5", st.cls)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{m.name}</p>
              <p className="text-xs text-muted-foreground">
                {char?.archetype || (m.kind === "token" ? m.token_type : "")}
              </p>
            </div>
            {m.current_hp != null && (
              <div className="text-right">
                <p className="text-sm font-medium">{m.current_hp}/{m.max_hp ?? "?"}</p>
                <p className="text-[10px] text-muted-foreground">HP</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}