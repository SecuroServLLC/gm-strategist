import React, { useEffect, useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Image } from "@/components/ui/image";
import { base44 } from "@/api/base44Client";
import OptionCard from "@/components/wizard/OptionCard";
import {
  Sword, Eye, Wand2, Crosshair, Handshake, Heart, BookOpen, Compass,
  Star, Shield, Skull, User, Mail, GraduationCap,
  Key, Flame, Smile, Scale, Crown, Cloud, Sun,
  ArrowRight, ArrowLeft, Loader2, Sparkles, Save, UserPlus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ARCHETYPES = [
  { id: "kriger", label: "Kriger", desc: "Tungt panser, våpenmester", icon: Sword },
  { id: "skygge", label: "Tyv / skygge", desc: "Sniking, låser, gift", icon: Eye },
  { id: "mystiker", label: "Mystiker / magiker", desc: "Formularer, okkult kunnskap", icon: Wand2 },
  { id: "jeger", label: "Jeger / sporer", desc: "Villmark, bueskyting, dyr", icon: Crosshair },
  { id: "diplomat", label: "Diplomat / kjøpmann", desc: "Sosial makt, forhandlinger", icon: Handshake },
  { id: "helbreder", label: "Helbreder", desc: "Liv, lindring, ritualer", icon: Heart },
  { id: "skolar", label: "Skolar / alkemist", desc: "Kunnskap, gåter, historie", icon: BookOpen },
  { id: "leiesoldat", label: "Leiesoldat / veiviser", desc: "Overlevelse, erfaring", icon: Compass },
];

const ROLES = [
  { id: "protagonist", label: "Protagonist", icon: Star },
  { id: "ally", label: "Alliert", icon: Shield },
  { id: "antagonist", label: "Antagonist", icon: Skull },
  { id: "npc", label: "NPC", icon: User },
  { id: "contact", label: "Kontakt", icon: Mail },
  { id: "mentor", label: "Mentor", icon: GraduationCap },
];

const TRAITS = [
  { id: "lojal", label: "Lojal", icon: Shield },
  { id: "hemmelighetsfull", label: "Hemmelighetsfull", icon: Key },
  { id: "ra", label: "Rå", icon: Flame },
  { id: "sjarmerende", label: "Sjarmerende", icon: Smile },
  { id: "rettferdig", label: "Rettferdig", icon: Scale },
  { id: "ambisios", label: "Ambisiøs", icon: Crown },
  { id: "melankolsk", label: "Melankolsk", icon: Cloud },
  { id: "lystig", label: "Lystig", icon: Sun },
];

const RACES = ["Menneske", "Alv", "Dverg", "Halving", "Ork", "Tiefling"];

const STEP_LABELS = ["Arketype", "Rolle", "Trekk", "Race", "Opprett"];
const MAX_TRAITS = 3;

export default function CharacterWizard({ open, onOpenChange, campaign, onDone }) {
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState({ archetype: null, role: "npc", traits: [], race: "Menneske", customRace: "" });
  const [gen, setGen] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(0);
      setSel({ archetype: null, role: "npc", traits: [], race: "Menneske", customRace: "" });
      setGen(null);
    }
  }, [open]);

  const race = sel.customRace.trim() || sel.race;

  const pickTrait = (id) => {
    setSel((s) => {
      const has = s.traits.includes(id);
      if (has) return { ...s, traits: s.traits.filter((t) => t !== id) };
      if (s.traits.length >= MAX_TRAITS) return s;
      return { ...s, traits: [...s.traits, id] };
    });
  };

  const composePrompt = () => {
    const arch = ARCHETYPES.find((a) => a.id === sel.archetype);
    const role = ROLES.find((r) => r.id === sel.role);
    const traits = sel.traits.map((id) => TRAITS.find((t) => t.id === id).label);
    return `En ${role.label.toLowerCase()} som ${arch.label.toLowerCase()} av racet ${race}. Personlighet: ${traits.join(", ") || "ukjent"}. Plassert i en ${campaign?.setting || "fantasy"} setting. Gi et meningsfylt navn, bakgrunn, personlighet, utseende og en hook mot kampanjen.`;
  };

  const canAdvance = () => {
    if (step === 0) return !!sel.archetype;
    if (step === 1) return !!sel.role;
    if (step === 2) return sel.traits.length > 0;
    if (step === 3) return !!race;
    return true;
  };

  const next = () => setStep((i) => Math.min(i + 1, STEP_LABELS.length - 1));
  const back = () => setStep((i) => Math.max(i - 1, 0));

  const generate = async () => {
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("generateCharacter", {
        prompt: composePrompt(),
        setting: campaign?.setting,
        withPortrait: true,
      });
      const c = res.data?.character;
      if (!c) throw new Error("Ingen karakter returnert");
      setGen(c);
    } catch (e) {
      alert("Generering feilet: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    if (!gen) return;
    setSaving(true);
    try {
      await base44.entities.Character.create({
        ...gen,
        campaign_id: campaign.id,
        role: sel.role,
        stats: gen.stats || {},
      });
      onDone();
    } catch (e) {
      alert("Lagring feilet: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (!campaign) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 gap-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <SheetTitle className="font-heading text-xl flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-primary" /> Bygg første karakter
          </SheetTitle>
          <div className="flex items-center gap-1.5 mt-2">
            {STEP_LABELS.map((label, i) => (
              <div
                key={label}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/50" : "w-4 bg-border"
                )}
              />
            ))}
            <span className="text-xs text-muted-foreground ml-2">{STEP_LABELS[step]}</span>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5">
          {step === 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ARCHETYPES.map((o) => (
                <OptionCard key={o.id} option={o} selected={sel.archetype === o.id} onClick={() => setSel((s) => ({ ...s, archetype: o.id }))} />
              ))}
            </div>
          )}
          {step === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {ROLES.map((o) => (
                <OptionCard key={o.id} option={o} selected={sel.role === o.id} onClick={() => setSel((s) => ({ ...s, role: o.id }))} />
              ))}
            </div>
          )}
          {step === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TRAITS.map((o) => (
                <OptionCard key={o.id} option={o} selected={sel.traits.includes(o.id)} onClick={() => pickTrait(o.id)} />
              ))}
              <p className="text-xs text-muted-foreground col-span-full">Velg opptil {MAX_TRAITS} trekk.</p>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {RACES.map((r) => (
                  <OptionCard key={r} option={{ label: r }} selected={sel.race === r && !sel.customRace} onClick={() => setSel((s) => ({ ...s, race: r, customRace: "" }))} />
                ))}
              </div>
              <div>
                <Label className="mb-1.5 block text-xs">Annet race (valgfritt)</Label>
                <Input value={sel.customRace} onChange={(e) => setSel((s) => ({ ...s, customRace: e.target.value }))} placeholder="f.eks. Dragefødt" />
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-primary/40 text-primary">{ARCHETYPES.find((a) => a.id === sel.archetype)?.label}</Badge>
                <Badge variant="outline" className="border-primary/40 text-primary">{ROLES.find((r) => r.id === sel.role)?.label}</Badge>
                <Badge variant="outline" className="border-primary/40 text-primary">{race}</Badge>
                {sel.traits.map((id) => (
                  <Badge key={id} variant="outline" className="border-primary/40 text-primary">{TRAITS.find((t) => t.id === id).label}</Badge>
                ))}
              </div>

              {!gen ? (
                <div className="rounded-xl border border-primary/25 bg-accent/30 p-5 text-center">
                  <p className="text-sm text-muted-foreground mb-4">Klar til å spinse frem en karakter ut fra valgene dine.</p>
                  <Button onClick={generate} disabled={generating} className="gap-2">
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {generating ? "Genererer…" : "Generer med AI"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-28 h-28 rounded-xl overflow-hidden bg-accent/40 border border-border shrink-0">
                      {gen.portrait_url ? (
                        <Image src={gen.portrait_url} fittingType="fill" className="w-full h-full" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">Ingen portrett</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-heading text-2xl truncate">{gen.name || "Uten navn"}</p>
                      <p className="text-sm text-muted-foreground">{gen.archetype} · {gen.race}</p>
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-4">{gen.background}</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={generate} disabled={generating} className="gap-1.5">
                    {generating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />} Prøv igjen
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <SheetFooter className="px-6 py-4 border-t border-border shrink-0 flex-row gap-2">
          <Button variant="ghost" onClick={back} disabled={step === 0} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Tilbake
          </Button>
          <Button variant="ghost" onClick={onDone}>Hopp over</Button>
          <div className="flex-1" />
          {step < 4 ? (
            <Button onClick={next} disabled={!canAdvance()} className="gap-1.5">
              Neste <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={save} disabled={!gen || saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Lagrer…" : "Opprett karakter"}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}