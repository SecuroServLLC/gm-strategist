import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

const KINDS = {
  note: { label: "Notat", style: "border-slate-500/40 text-slate-300" },
  roll: { label: "Terning", style: "border-amber-500/40 text-amber-300" },
  loot: { label: "Skatt", style: "border-emerald-500/40 text-emerald-300" },
  combat: { label: "Kamp", style: "border-red-500/40 text-red-300" },
  milestone: { label: "Milepæl", style: "border-primary/50 text-primary" },
  other: { label: "Anna", style: "border-muted-foreground/40 text-muted-foreground" },
};

export default function SessionLog({ events, onAdd, onDelete }) {
  const [kind, setKind] = useState("note");
  const [text, setText] = useState("");
  const sorted = [...events].sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

  const submit = () => { if (!text.trim()) return; onAdd({ kind, text: text.trim() }); setText(""); };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Select value={kind} onValueChange={setKind}>
          <SelectTrigger className="w-36 shrink-0"><SelectValue /></SelectTrigger>
          <SelectContent>
            {Object.entries(KINDS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Hva skjedde? (Enter for å leggje til)" onKeyDown={(e) => e.key === "Enter" && submit()} />
        <Button onClick={submit} className="gap-1.5 shrink-0"><Plus className="w-4 h-4" /> Logg</Button>
      </div>
      {sorted.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">Ingen hendelser logga enda. Skriv over, i kamp, skatt og milepælar her.</p>
      ) : (
        <ol className="space-y-2">
          {sorted.map((ev) => {
            const k = KINDS[ev.kind] || KINDS.other;
            const time = ev.created_date ? new Date(ev.created_date).toLocaleTimeString("nb-NO", { hour: "2-digit", minute: "2-digit" }) : "";
            return (
              <li key={ev.id} className="flex items-start gap-3 group">
                <Badge variant="outline" className={`mt-0.5 shrink-0 ${k.style}`}>{k.label}</Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground/90 whitespace-pre-line break-words">{ev.text}</p>
                  {time && <p className="text-[10px] text-muted-foreground mt-0.5">{time}</p>}
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0" onClick={() => onDelete(ev.id)}><Trash2 className="w-3 h-3" /></Button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}