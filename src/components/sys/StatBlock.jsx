import React from "react";
import { resolveAttributes, statValue } from "@/lib/attributes";

export default function StatBlock({ character, campaign }) {
  const attrs = resolveAttributes(campaign);
  return (
    <div className="space-y-2">
      {attrs.map((a) => {
        const v = statValue(character, a);
        return (
          <div key={a.name} className="p-2.5 rounded-lg border border-border bg-card/40">
            <div className="flex items-baseline justify-between gap-2">
              <span className="font-medium">{a.name}</span>
              <span className="font-heading text-lg">{v ?? "—"}</span>
            </div>
            {a.description && <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{a.description}</p>}
          </div>
        );
      })}
    </div>
  );
}