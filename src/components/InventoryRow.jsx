import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Pencil, Trash2 } from "lucide-react";

const CAT_LABEL = { weapon: "Våpen", armor: "Rustning", consumable: "Forbruksvare", valuable: "Verdi", currency: "Mynt", misc: "Div" };

export default function InventoryRow({ item, onQty, onEdit, onDelete, members }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/30 transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="font-medium truncate">{item.name}</p>
          <Badge variant="secondary" className="text-[10px] py-0">{CAT_LABEL[item.category] || item.category}</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {(() => { const c = (members || []).find((m) => m.id === item.carried_by); const label = c ? c.name : (item.carried_by || ""); return item.carried_by ? `Bæres av ${label}` : "Felleslager"; })()}
          {item.value > 0 && ` · ${item.value}${item.unit ? " " + item.unit : ""}/stk`}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onQty(item.id, Math.max(0, (item.quantity || 0) - 1))}><Minus className="w-3.5 h-3.5" /></Button>
        <span className="w-14 text-center font-mono text-sm">{item.quantity}{item.unit ? ` ${item.unit}` : ""}</span>
        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => onQty(item.id, (item.quantity || 0) + 1)}><Plus className="w-3.5 h-3.5" /></Button>
      </div>
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(item)}><Pencil className="w-3.5 h-3.5" /></Button>
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(item.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
      </div>
    </div>
  );
}