import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TOKEN_TYPES } from "@/lib/tokenTypes";

const empty = { kind: "character", name: "", character_id: "", status: "active", quantity: 1, token_type: "animal", description: "", notes: "" };

export default function PartyMemberDialog({ open, member, characters, onOpenChange, onSave }) {
  const [form, setForm] = useState(member || empty);
  useEffect(() => { setForm(member || empty); }, [member, open]);
  const isToken = form.kind === "token";
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const pickCharacter = (id) => {
    const c = (characters || []).find((c) => c.id === id);
    setForm((f) => ({ ...f, character_id: id, name: c ? c.name : f.name }));
  };

  const submit = () => {
    if (!form.name?.trim()) return;
    const payload = { ...form };
    if (!isToken) payload.quantity = 1;
    if (isToken) payload.character_id = "";
    onSave(payload);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{member?.id ? "Rediger følgesvenn" : "Legg til følgesvenn"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-1.5 block">Type</Label>
            <Select value={form.kind} onValueChange={(v) => update("kind", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="character">Karakter (navngitt)</SelectItem>
                <SelectItem value="token">Brikke (fysisk/unnamed)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {!isToken && (
            <div>
              <Label className="mb-1.5 block">Knytt til karakter (valgfritt)</Label>
              <Select value={form.character_id || ""} onValueChange={pickCharacter}>
                <SelectTrigger><SelectValue placeholder="Velg eksisterende karakter" /></SelectTrigger>
                <SelectContent>
                  {(characters || []).map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div>
            <Label className="mb-1.5 block">Navn</Label>
            <Input value={form.name || ""} onChange={(e) => update("name", e.target.value)} placeholder={isToken ? "f.eks. 'Vaktbrikke'" : "Karakternavn"} />
          </div>
          {isToken && (
            <div>
              <Label className="mb-1.5 block">Type</Label>
              <Select value={form.token_type} onValueChange={(v) => update("token_type", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TOKEN_TYPES).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="mb-1.5 block">Status</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktiv</SelectItem>
                  <SelectItem value="absent">Fraværende</SelectItem>
                  <SelectItem value="dead">Død</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isToken && (
              <div>
                <Label className="mb-1.5 block">Antall</Label>
                <Input type="number" min={1} value={form.quantity} onChange={(e) => update("quantity", Number(e.target.value))} />
              </div>
            )}
          </div>
          <div>
            <Label className="mb-1.5 block">Beskrivelse</Label>
            <Textarea rows={3} value={form.description || ""} onChange={(e) => update("description", e.target.value)} />
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