import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const empty = { name: "", contact: "", role: "Spelar", character_id: "", notes: "" };

export default function PlayerDialog({ open, player, characters, onOpenChange, onSave }) {
  const [form, setForm] = useState(player || empty);
  useEffect(() => { setForm(player || empty); }, [player, open]);
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = () => { if (!form.name?.trim()) return; onSave(form); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{player?.id ? "Rediger spelar" : "Legg til spelar"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label className="mb-1.5 block">Namn</Label><Input value={form.name || ""} onChange={(e) => update("name", e.target.value)} placeholder="Faktisk namn" autoFocus /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="mb-1.5 block">Rolle</Label><Input value={form.role || ""} onChange={(e) => update("role", e.target.value)} placeholder="Spelar / GM / Co-GM" /></div>
            <div><Label className="mb-1.5 block">Kontakt</Label><Input value={form.contact || ""} onChange={(e) => update("contact", e.target.value)} placeholder="epost / discord" /></div>
          </div>
          <div>
            <Label className="mb-1.5 block">Speler karakter (valgfritt)</Label>
            <Select value={form.character_id || "none"} onValueChange={(v) => update("character_id", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Ingen" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ingen</SelectItem>
                {(characters || []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div><Label className="mb-1.5 block">Notat</Label><Textarea rows={2} value={form.notes || ""} onChange={(e) => update("notes", e.target.value)} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Avbryt</Button><Button onClick={submit}>Lagre</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}