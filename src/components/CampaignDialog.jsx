import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { base44 } from "@/api/base44Client";

const empty = { title: "", premise: "", setting: "", tone: "", status: "draft" };

export default function CampaignDialog({ open, onOpenChange, onSaved }) {
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setForm(empty); }, [open]);
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      const created = await base44.entities.Campaign.create({
        title: form.title.trim(),
        premise: form.premise.trim(),
        setting: form.setting.trim(),
        tone: form.tone.trim(),
        status: form.status,
      });
      onSaved(created);
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Ny kampanje</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label className="mb-1.5 block">Tittel</Label><Input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="f.eks. Skygger over Eldoria" autoFocus /></div>
          <div><Label className="mb-1.5 block">Premiss – den røde tråden</Label><Textarea rows={4} value={form.premise} onChange={(e) => update("premise", e.target.value)} placeholder="Hovedfortellingen – hva står på spill?" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="mb-1.5 block">Verden / setting</Label><Textarea rows={2} value={form.setting} onChange={(e) => update("setting", e.target.value)} placeholder="Tidsalder, geografi..." /></div>
            <div><Label className="mb-1.5 block">Tone</Label><Input value={form.tone} onChange={(e) => update("tone", e.target.value)} placeholder="Mørk, episk..." /></div>
          </div>
          <div><Label className="mb-1.5 block">Status</Label>
            <Select value={form.status} onValueChange={(v) => update("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Utkast</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="complete">Fullført</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Avbryt</Button><Button onClick={submit} disabled={saving}>{saving ? "Lagrer…" : "Opprett"}</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}