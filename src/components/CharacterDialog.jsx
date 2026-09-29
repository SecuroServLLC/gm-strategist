import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, Save, Dices, Upload, Wand2 } from "lucide-react";
import { DEFAULT_ATTRIBUTES } from "@/lib/attributes";

const ROLES = [
  { value: "protagonist", label: "Protagonist" },
  { value: "ally", label: "Alliert" },
  { value: "antagonist", label: "Antagonist" },
  { value: "npc", label: "NPC" },
  { value: "contact", label: "Kontakt" },
  { value: "mentor", label: "Mentor" },
];

const STAT_KEYS = ["kraft", "smidighet", "utholdenhet", "intelligens", "visdom", "utstralning"];

const EMPTY = { name: "", archetype: "", race: "", role: "npc", background: "", personality: "", stats: {}, abilities: [], appearance: "", hook: "", portrait_url: "", notes: "", claim_status: "closed" };

function SectionLabel({ children }) {
  return (
    <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/70 font-medium pt-1">
      {children}
    </div>
  );
}

export default function CharacterDialog({ open, onOpenChange, character, campaignId, setting, onSaved, prefill }) {
  const [form, setForm] = useState(EMPTY);
  const [prompt, setPrompt] = useState("");
  const [portraitLoading, setPortraitLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [abilitiesText, setAbilitiesText] = useState("");

  useEffect(() => {
    if (character) {
      setForm({ ...EMPTY, ...character, stats: character.stats || {} });
      setAbilitiesText((character.abilities || []).join("\n"));
      setPrompt("");
    } else if (prefill) {
      setForm({ ...EMPTY, ...prefill, stats: prefill.stats || {}, portrait_url: prefill.portrait_url || "" });
      setAbilitiesText((prefill.abilities || []).join("\n"));
      setPrompt("");
    } else {
      setForm(EMPTY);
      setAbilitiesText("");
    }
  }, [character, prefill, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setStat = (k, v) => setForm((f) => ({ ...f, stats: { ...f.stats, [k]: v } }));

  const generate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("generateCharacter", { prompt, setting });
      const c = res.data?.characters?.[0] || res.data?.character;
      if (c) {
        setForm((f) => ({
          ...EMPTY,
          ...c,
          stats: c.stats || {},
          portrait_url: f.portrait_url,
        }));
        setAbilitiesText((c.abilities || []).join("\n"));
      }
    } catch (e) {
      alert("Kunne ikke generere: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const generatePortrait = async () => {
    setPortraitLoading(true);
    try {
      const res = await base44.functions.invoke("generatePortrait", {
        name: form.name,
        race: form.race,
        appearance: form.appearance,
        archetype: form.archetype,
      });
      const url = res.data?.portrait_url;
      if (url) set("portrait_url", url);
      else alert("Kunne ikke generere portrett.");
    } catch (e) {
      alert("Portrett feilet: " + e.message);
    } finally {
      setPortraitLoading(false);
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
        claim_status: form.role === "antagonist" ? "closed" : (form.claim_status || "closed"),
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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 gap-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <SheetTitle className="font-heading text-xl flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            {character ? "Rediger karakter" : prefill ? "Tilpass karakter" : "Generer karakter"}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-5 space-y-5">
            {/* AI prompt */}
            <div className="rounded-xl border border-primary/25 bg-accent/30 p-4 space-y-3">
              <Label className="text-sm flex items-center gap-1.5 text-primary"><Sparkles className="w-4 h-4" /> Rask generering (én)</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                placeholder="f.eks. 'En eldre tyvekjeltemester med et sjakkspill-tema og en dyp hemmelighet'"
              />
              <Button onClick={generate} disabled={generating || !prompt.trim()} className="gap-2 w-full">
                {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                {generating ? "Genererer..." : "Generer én karakter"}
              </Button>
              <p className="text-[11px] text-muted-foreground">For flere forslag og mer tilpasning, bruk «Foreslå karakterer» fra karakter-siden.</p>
            </div>

            {/* Portrait */}
            <div className="flex gap-4">
              <div className="w-28 h-28 rounded-xl overflow-hidden bg-accent/40 border border-border shrink-0 flex items-center justify-center">
                {form.portrait_url ? (
                  <Image src={form.portrait_url} fittingType="fill" className="w-full h-full" />
                ) : (
                  <span className="text-xs text-muted-foreground text-center px-2">Ingen portrett</span>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center gap-2">
                <Label className="text-xs">Portrett</Label>
                <button onClick={generatePortrait} disabled={portraitLoading || (!form.name && !form.appearance)} className="inline-flex items-center gap-2 text-sm text-primary hover:underline disabled:opacity-50 text-left">
                  {portraitLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Generer portrett med AI
                </button>
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer text-muted-foreground hover:text-foreground">
                  <Upload className="w-4 h-4" /> Last opp eget bilde
                  <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                </label>
              </div>
            </div>

            <SectionLabel>Grunnleggende</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Navn</Label>
                <Input value={form.name} onChange={(e) => set("name", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Rolle</Label>
                <Select value={form.role} onValueChange={(v) => setForm((f) => ({ ...f, role: v, ...(v === "antagonist" ? { claim_status: "closed" } : {}) }))}>
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
              <div>
                <Label className="text-xs">Claim-status</Label>
                <Select value={form.claim_status || "closed"} onValueChange={(v) => set("claim_status", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="closed">Lukket – ikke claimbar</SelectItem>
                    <SelectItem value="open" disabled={form.role === "antagonist"}>Ledig – kan claimes av spiller</SelectItem>
                  </SelectContent>
                </Select>
                {form.role === "antagonist" && <p className="text-[10px] text-rose-400 mt-1">Antagonister og fiender kan ikke godkjennes for claim.</p>}
              </div>
            </div>

            <SectionLabel>Attributter (1–20)</SectionLabel>
            <div className="grid grid-cols-2 gap-3">
              {DEFAULT_ATTRIBUTES.map((a) => (
                <div key={a.key} className="rounded-lg border border-border bg-card/30 p-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <Label className="text-xs">{a.name}</Label>
                    <Input
                      type="number"
                      min="1" max="20"
                      value={form.stats[a.key] ?? ""}
                      onChange={(e) => setStat(a.key, parseInt(e.target.value) || 0)}
                      className="w-16 h-9 text-center font-heading text-base"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 leading-snug">{a.description}</p>
                </div>
              ))}
            </div>

            <SectionLabel>Beskrivelse</SectionLabel>
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

        <SheetFooter className="px-6 py-4 border-t border-border shrink-0 flex-row gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Avbryt</Button>
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {character ? "Lagre" : "Opprett karakter"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}