import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = [
  { value: "weapon", label: "Våpen" },
  { value: "armor", label: "Rustning" },
  { value: "consumable", label: "Forbruksvare" },
  { value: "valuable", label: "Verditing" },
  { value: "currency", label: "Mynt / ressurs" },
  { value: "misc", label: "Diverse" },
];

const empty = { name: "", category: "misc", quantity: 1, unit: "", value: 0, carried_by: "", description: "" };

export default function InventoryDialog({ open, item, onOpenChange, onSave, members }) {
  const [form, setForm] = useState(item || empty);
  useEffect(() => { setForm(item || empty); }, [item, open]);
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = () => { if (!form.name?.trim()) return; onSave(form); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{item?.id ? "Rediger gjenstand" : "Legg til gjenstand"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block">Navn</Label>
            <Input value={form.name || ""} onChange={(e) => update("name", e.target.value)} placeholder="f.eks. 'Gull', 'Helbredelsesdrikk'" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block">Kategori</Label>
              <Select value={form.category} onValueChange={(v) => update("category", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Antall</Label>
              <Input type="number" min={0} value={form.quantity} onChange={(e) => update("quantity", Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block">Enhet</Label>
              <Input value={form.unit || ""} onChange={(e) => update("unit", e.target.value)} placeholder="gull, sølv, stk…" />
            </div>
            <div>
              <Label className="mb-1.5 block">Verdi (pr enhet)</Label>
              <Input type="number" min={0} value={form.value} onChange={(e) => update("value", Number(e.target.value))} />
            </div>
          </div>
          <div>
            <Label className="mb-1.5 block">Bæres av</Label>
            <Select value={form.carried_by || "none"} onValueChange={(v) => update("carried_by", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Felleslager</SelectItem>
                {(members || []).map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block">Beskrivelse</Label>
            <Textarea rows={2} value={form.description || ""} onChange={(e) => update("description", e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Avbryt</Button>
          <Button onClick={submit}>Lagre</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}