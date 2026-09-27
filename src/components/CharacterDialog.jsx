import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, Save, Dices, Upload, Wand2 } from "lucide-react";

const ROLES = [
  { value: "protagonist", label: "Protagonist" },
  { value: "ally", label: "Alliert" },
  { value: "antagonist", label: "Antagonist" },
  { value: "npc", label: "NPC" },
  { value: "contact", label: "Kontakt" },
  { value: "mentor", label: "Mentor" },
];

const STAT_KEYS = ["kraft", "smidighet", "utholdenhet", "intelligens", "visdom", "utstralning"];

const EMPTY = { name: "", archetype: "", race: "", role: "npc", background: "", personality: "", stats: {}, abilities: [], appearance: "", hook: "", portrait_url: "", notes: "" };

export default function CharacterDialog({ open, onOpenChange, character, campaignId, setting, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [prompt, setPrompt] = useState("");
  const [withPortrait, setWithPortrait] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [abilitiesText, setAbilitiesText] = useState("");

  useEffect(() => {
    if (character) {
      setForm({ ...EMPTY, ...character, stats: character.stats || {} });
      setAbilitiesText((character.abilities || []).join("\n"));
      setPrompt("");
    } else {
      setForm(EMPTY);
      setAbilitiesText("");
    }
  }, [character, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setStat = (k, v) => setForm((f) => ({ ...f, stats: { ...f.stats, [k]: v } }));

  const generate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("generateCharacter", { prompt, setting, withPortrait });
      const c = res.data?.character;
      if (c) {
        setForm((f) => ({
          ...EMPTY,
          ...c,
          stats: c.stats || {},
          portrait_url: c.portrait_url || f.portrait_url,
        }));
        setAbilitiesText((c.abilities || []).join("\n"));
      }
    } catch (e) {
      alert("Kunne ikke generere: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      set("portrait_url", file_url);
    } catch (err) {
      alert("Opplasting feilet: " + err.message);
    }
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        campaign_id: campaignId,
        name: form.name.trim() || "Uten navn",
        archetype: form.archetype,
        race: form.race,
        role: form.role,
        background: form.background,
        personality: form.personality,
        stats: form.stats,
        abilities: abilitiesText.split("\n").map((s) => s.trim()).filter(Boolean),
        appearance: form.appearance,
        hook: form.hook,
        portrait_url: form.portrait_url,
        notes: form.notes,
      };
      if (character) {
        await base44.entities.Character.update(character.id, payload);
      } else {
        await base44.entities.Character.create(payload);
      }
      onSaved();
      onOpenChange(false);
    } catch (e) {
      alert("Lagring feilet: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-card border-border max-h-[92vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            {character ? "Rediger karakter" : "Generer karakter"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-5 pr-2 pb-2">
            {/* AI prompt */}
            <div className="rounded-xl border border-primary/25 bg-accent/30 p-4 space-y-3">
              <Label className="text-sm flex items-center gap-1.5 text-primary"><Sparkles className="w-4 h-4" /> Beskriv karakteren</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                placeholder="f.eks. 'En eldre tyvekjeltemester med et sjakkspill-tema og en dyp hemmelighet'"
              />
              <div className="flex items-center justify-between flex-wrap gap-3">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <Switch checked={withPortrait} onCheckedChange={setWithPortrait} />
                  Generer portrett
                </label>
                <Button onClick={generate} disabled={generating || !prompt.trim()} className="gap-2">
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {generating ? "Genererer..." : "Generer med AI"}
                </Button>
              </div>
            </div>

            {/* Portrait */}
            <div className="flex gap-4">
              <div className="w-32 h-32 rounded-xl overflow-hidden bg-accent/40 border border-border shrink-0 flex items-center justify-center">
                {form.portrait_url ? (
                  <Image src={form.portrait_url} fittingType="fill" className="w-full h-full" />
                ) : (
                  <span className="text-xs text-muted-foreground text-center px-2">Ingen portrett</span>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center gap-2">
                <Label className="text-xs">Last opp eget portrett (valgfritt)</Label>
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer text-primary hover:underline">
                  <Upload className="w-4 h-4" /> Velg bilde
                  <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Navn</Label>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Rolle</Label>
                <Select value={form.role} onValueChange={(v) => set("role", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Arketype</Label>
                <Input value={form.archetype} onChange={(e) => set("archetype", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Race</Label>
                <Input value={form.race} onChange={(e) => set("race", e.target.value)} className="mt-1" />
              </div>
            </div>

            <div>
              <Label className="text-xs flex items-center gap-1.5"><Dices className="w-3.5 h-3.5" /> Attributter (1-20)</Label>
              <div className="grid grid-cols-6 gap-2 mt-1.5">
                {STAT_KEYS.map((k) => (
                  <div key={k} className="text-center">
                    <Input
                      type="number"
                      min="1" max="20"
                      value={form.stats[k] ?? ""}
                      onChange={(e) => setStat(k, parseInt(e.target.value) || 0)}
                      className="text-center font-heading text-lg h-12"
                    />
                    <div className="text-[9px] uppercase tracking-wide text-muted-foreground mt-1">{k.slice(0, 3)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-xs">Bakgrunn</Label>
              <Textarea value={form.background} onChange={(e) => set("background", e.target.value)} rows={2} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Personlighet</Label>
              <Textarea value={form.personality} onChange={(e) => set("personality", e.target.value)} rows={2} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Evner (én per linje)</Label>
              <Textarea value={abilitiesText} onChange={(e) => setAbilitiesText(e.target.value)} rows={3} className="mt-1" placeholder={"Skyggeskritt: kan gli usett i demring\n..."} />
            </div>
            <div>
              <Label className="text-xs">Utseende</Label>
              <Textarea value={form.appearance} onChange={(e) => set("appearance", e.target.value)} rows={2} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Hook mot kampanjen</Label>
              <Textarea value={form.hook} onChange={(e) => set("hook", e.target.value)} rows={2} className="mt-1" />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t border-border pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Avbryt</Button>
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {character ? "Lagre" : "Opprett karakter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}