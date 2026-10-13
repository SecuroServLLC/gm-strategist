import React from "react";
import { TOKEN_TYPES, TOKEN_GROUPS } from "@/lib/tokenTypes";

const RELATIONS = [
  { value: "friend", label: "Venn", color: "#22c55e" },
  { value: "neutral", label: "Nøytral", color: "#64748b" },
  { value: "enemy", label: "Fiende", color: "#ef4444" },
];

const HEALTH = [
  { value: "full", label: "Full", color: "#86efac" },
  { value: "wounded", label: "Såret", color: "#fbbf24" },
  { value: "critical", label: "Kritisk", color: "#f97316" },
  { value: "dead", label: "Død", color: "#475569" },
];

export function TokenTypePicker({ marker, onChange }) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm block">Token-type</label>
      <select
        className="mt-1 block w-full rounded-md border border-input bg-background p-2"
        value={marker.token_type || "human"}
        onChange={(e) => onChange({ token_type: e.target.value })}
      >
        {Object.entries(TOKEN_GROUPS).map(([groupKey, groupLabel]) => (
          <optgroup key={groupKey} label={groupLabel}>
            {Object.entries(TOKEN_TYPES).filter(([, def]) => def.group === groupKey).map(([key, def]) => (
              <option key={key} value={key}>{def.label}</option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

export function RelationPicker({ marker, onChange }) {
  const current = marker.relation || "neutral";
  return (
    <div className="space-y-1.5">
      <label className="text-sm block">Relasjon (ytre ring)</label>
      <div className="flex gap-2">
        {RELATIONS.map((r) => (
          <button
            key={r.value}
            type="button"
            onClick={() => onChange({ relation: r.value })}
            className="flex-1 px-2 py-1.5 rounded-md text-xs border transition-colors"
            style={{
              borderColor: current === r.value ? r.color : undefined,
              backgroundColor: current === r.value ? `${r.color}20` : undefined,
              color: current === r.value ? r.color : undefined,
            }}
          >
            {r.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function HealthPicker({ marker, onChange }) {
  const current = marker.health_status || "full";
  return (
    <div className="space-y-1.5">
      <label className="text-sm block">Helse (indre ring)</label>
      <div className="flex gap-1.5 flex-wrap">
        {HEALTH.map((h) => (
          <button
            key={h.value}
            type="button"
            onClick={() => onChange({ health_status: h.value })}
            className="px-2 py-1 rounded-md text-xs border transition-colors"
            style={{
              borderColor: current === h.value ? h.color : undefined,
              backgroundColor: current === h.value ? `${h.color}20` : undefined,
              color: current === h.value ? h.color : undefined,
            }}
          >
            {h.label}
          </button>
        ))}
      </div>
    </div>
  );
}