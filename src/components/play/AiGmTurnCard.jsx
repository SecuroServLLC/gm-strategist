import React from "react";

const TEST_LABELS = { ability_check: 'Ability check', saving_throw: 'Saving throw', attack: 'Attack roll' };
export default function AiGmTurnCard({ turn }) {
  return <article className="rounded-xl border border-border bg-card p-4 space-y-3">
    <p className="text-xs uppercase tracking-wide text-muted-foreground">{turn.actor_name} · D&D 5e 2024</p>
    <p className="font-medium whitespace-pre-wrap break-words">{turn.action}</p>
    {turn.test_type !== 'none' && <p className="whitespace-pre-wrap break-words">{turn.narrative}</p>}
    {turn.test_type !== 'none' && <>
      <p className="text-sm text-primary">{TEST_LABELS[turn.test_type]} · {turn.ability}{turn.skill ? ` (${turn.skill})` : ''} · {turn.test_type === 'attack' ? 'Armor Class' : 'Difficulty Class'} {turn.target}</p>
      {turn.rule_note && <p className="text-sm text-muted-foreground whitespace-pre-wrap">{turn.rule_note}</p>}
      {turn.status === 'awaiting_roll' && <div className="grid gap-3 sm:grid-cols-2 text-sm">
        <div className="rounded-lg bg-muted p-3"><p className="font-medium mb-1">On success</p><p className="whitespace-pre-wrap">{turn.success_outcome}</p></div>
        <div className="rounded-lg bg-muted p-3"><p className="font-medium mb-1">On failure</p><p className="whitespace-pre-wrap">{turn.failure_outcome}</p></div>
      </div>}
    </>}
    {turn.status === 'resolved' && <div className="border-t border-border pt-3">
      {turn.test_type !== 'none' && <p className="text-sm font-medium text-primary mb-2">{turn.critical ? 'Critical hit' : turn.success ? 'Success' : 'Failure'} · d20 {turn.selected_roll} {turn.modifier >= 0 ? '+' : '−'} {Math.abs(turn.modifier)} = {turn.total}{turn.rolls?.length === 2 ? ` (rolled ${turn.rolls.join(', ')}, ${turn.roll_mode})` : ''}</p>}
      <p className="whitespace-pre-wrap break-words">{turn.outcome}</p>
    </div>}
  </article>;
}