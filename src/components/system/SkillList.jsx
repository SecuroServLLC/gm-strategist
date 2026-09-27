import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

export default function SkillList({ value, onChange, attributes }) {
  const list = value || [];
  const set = (i, k, v) => onChange(list.map((s, j) => (j === i ? { ...s, [k]: v } : s)));
  const add = () => onChange([...list, { name: "", attribute: "", description: "" }]);
  const remove = (i) => onChange(list.filter((_, j) => j !== i));

  return (
    <div className="space-y-2">
      {list.map((s, i) => (
        <div key={i} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
          <Input className="h-8 sm:w-40" placeholder="Ferdighet" value={s.name || ""} onChange={(e) => set(i, "name", e.target.value)} />
          <Select value={s.attribute || "none"} onValueChange={(v) => set(i, "attribute", v === "none" ? "" : v)}>
            <SelectTrigger className="h-8 sm:w-40"><SelectValue placeholder="Attributt" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Ingen</SelectItem>
              {(attributes || []).map((a, j) => <SelectItem key={j} value={a.name}>{a.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Input className="h-8 flex-1" placeholder="Beskrivelse" value={s.description || ""} onChange={(e) => set(i, "description", e.target.value)} />
          <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => remove(i)}><Trash2 className="w-3.5 h-3.5" /></Button>
        </div>
      ))}
      <Button size="sm" variant="outline" className="gap-1.5" onClick={add}><Plus className="w-3.5 h-3.5" /> Legg til ferdighet</Button>
    </div>
  );
}