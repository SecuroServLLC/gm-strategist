import React from "react";
import { Coins, Package } from "lucide-react";

const CAT_LABEL = {
  weapon: "Våpen", armor: "Rustning", consumable: "Bruksgjenstand",
  valuable: "Verdighetning", currency: "Mynt", misc: "Diverse",
};

export default function InventoryPanel({ inventory, memberId }) {
  const carried = inventory.filter((i) => i.carried_by === memberId);
  const shared = inventory.filter((i) => !i.carried_by);
  const totalValue = inventory.reduce((s, i) => s + (i.value || 0) * (i.quantity || 1), 0);

  const Section = ({ title, items }) => (
    <div>
      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">{title}</p>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">Ingenting her.</p>
      ) : (
        <div className="space-y-1.5">
          {items.map((it) => (
            <div key={it.id} className="flex items-center gap-3 p-2.5 rounded-lg border border-border bg-card/40">
              <Package className="w-4 h-4 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{it.name}</p>
                <p className="text-xs text-muted-foreground">
                  {CAT_LABEL[it.category] || it.category}{it.quantity > 1 ? ` · ${it.quantity}x` : ""}
                </p>
              </div>
              {it.value ? (
                <span className="text-xs text-amber-400 flex items-center gap-1">
                  <Coins className="w-3 h-3" />{it.value * it.quantity}
                </span>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between p-3 rounded-lg bg-accent/30 border border-border">
        <span className="text-sm text-muted-foreground">Total verdi</span>
        <span className="font-heading text-lg flex items-center gap-1 text-amber-400">
          <Coins className="w-4 h-4" /> {totalValue}
        </span>
      </div>
      <Section title="Båret av meg" items={carried} />
      <Section title="Felleslager" items={shared} />
    </div>
  );
}