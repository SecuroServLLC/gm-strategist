import React from "react";
import { Loader2, CheckCircle2, AlertCircle, Users, Globe, Map, Workflow, Backpack } from "lucide-react";

const STEP_ICONS = {
  characters: Users,
  world: Globe,
  maps: Map,
  story: Workflow,
  items: Backpack,
};

export default function GenerationProgress({ steps, isEditing }) {
  const allSteps = [
    { name: 'characters', label: 'Karakterer' },
    { name: 'world', label: 'Verden' },
    { name: 'maps', label: 'Kart' },
    { name: 'story', label: 'Story Flow' },
    { name: 'items', label: 'Gjenstander' },
  ];

  const stepMap = Object.fromEntries((steps || []).map(s => [s.name, s]));

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground mb-3">
        {isEditing ? 'Legger til innhold…' : 'Bygger verden, karakterer, story og utstyr…'}
      </p>
      {allSteps.map((step, i) => {
        const data = stepMap[step.name];
        const status = data?.status || 'pending';
        const Icon = STEP_ICONS[step.name] || Loader2;
        return (
          <div
            key={step.name}
            className="flex items-center gap-3 p-3 rounded-lg bg-card/40 border border-border/50"
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 bg-accent/30">
              {status === 'done' ? (
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400" />
              ) : status === 'error' ? (
                <AlertCircle className="w-4.5 h-4.5 text-destructive" />
              ) : (
                <Loader2 className="w-4.5 h-4.5 animate-spin text-primary" />
              )}
            </div>
            <div className="flex-1">
              <span className="text-sm font-medium">{step.label}</span>
              {status === 'done' && data?.count != null && (
                <span className="text-xs text-muted-foreground ml-2">— {data.count} opprettet</span>
              )}
              {status === 'error' && (
                <span className="text-xs text-destructive ml-2">— feil: {data?.error || 'ukjent'}</span>
              )}
            </div>
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Steg {i + 1}/5</span>
          </div>
        );
      })}
    </div>
  );
}