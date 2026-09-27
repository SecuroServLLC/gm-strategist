import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const empty = { name: "", status: "", description: "", notes: "" };

export default function FactionDialog({ open, faction, onOpenChange, onSave }) {
  const [form, setForm] = useState(faction || empty);
  useEffect(() => { setForm(faction || empty); }, [faction, open]);
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const submit = () => { if (!form.name?.trim()) return; onSave(form); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>{faction?.id ? "Rediger fraksjon" : "Legg til fraksjon"}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label className="mb-1.5 block">Navn</Label><Input value={form.name || ""} onChange={(e) => update("name", e.target.value)} placeholder="f.eks. Kråkens broderskap" autoFocus /></div>
          <div><Label className="mb-1.5 block">Status</Label><Input value={form.status || ""} onChange={(e) => update("status", e.target.value)} placeholder="f.eks. Alliert / Fiendtlig / Nøytral" /></div>
          <div><Label className="mb-1.5 block">Beskrivelse</Label><Textarea rows={2} value={form.description || ""} onChange={(e) => update("description", e.target.value)} placeholder="Hvem de er, mål, ressurser..." /></div>
          <div><Label className="mb-1.5 block">Notater</Label><Textarea rows={2} value={form.notes || ""} onChange={(e) => update("notes", e.target.value)} /></div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Avbryt</Button><Button onClick={submit}>Lagre</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}