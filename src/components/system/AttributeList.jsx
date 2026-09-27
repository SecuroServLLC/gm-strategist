import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2 } from "lucide-react";

export default function AttributeList({ value, onChange }) {
  const list = value || [];
  const set = (i, k, v) => onChange(list.map((a, j) => (j === i ? { ...a, [k]: v } : a)));
  const add = () => onChange([...list, { name: "", abbr: "", description: "" }]);
  const remove = (i) => onChange(list.filter((_, j) => j !== i));

  return (
    <div className="space-y-2">
      {list.map((a, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Input className="h-8" placeholder="Navn (f.eks. Kraft)" value={a.name || ""} onChange={(e) => set(i, "name", e.target.value)} />
          <Input className="h-8 w-16" placeholder="Abbr" value={a.abbr || ""} onChange={(e) => set(i, "abbr", e.target.value)} />
          <Input className="h-8 flex-1" placeholder="Beskrivelse" value={a.description || ""} onChange={(e) => set(i, "description", e.target.value)} />
          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => remove(i)}><Trash2 className="w-3.5 h-3.5" /></Button>
        </div>
      ))}
      <Button size="sm" variant="outline" className="gap-1.5" onClick={add}><Plus className="w-3.5 h-3.5" /> Legg til attributt</Button>
      <p className="text-xs text-muted-foreground">Definer selv hvilke attributter som finnes – f.eks. de seks klassiske, eller noe helt annet.</p>
    </div>
  );
}