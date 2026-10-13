import React from 'react';
import { Package } from 'lucide-react';

export default function TerminalInventory({ items, memberId }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">Ingen gjenstander registrert ennå.</p>;
  return <div className="space-y-2">{items.map((item) => <article key={item.id} className="rounded-lg border border-border bg-card p-3">
    <div className="flex items-start gap-2"><Package className="mt-1 h-4 w-4 shrink-0 text-primary" /><div className="min-w-0"><h3 className="font-heading text-lg break-words">{item.name}</h3><p className="text-sm">{item.quantity ?? 1}{item.unit ? ` ${item.unit}` : ' stk.'}</p><p className="text-xs text-muted-foreground">{item.carried_by === memberId ? 'Båret av deg' : 'Felleslager'}</p></div></div>
    {item.description && <p className="mt-2 whitespace-pre-wrap break-words text-sm text-muted-foreground">{item.description}</p>}
  </article>)}</div>;
}