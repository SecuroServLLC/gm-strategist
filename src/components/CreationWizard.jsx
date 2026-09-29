import React, { useEffect, useState } from "react";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { base44 } from "@/api/base44Client";
import { campaignLimit } from "@/lib/subscription";
import OptionCard from "@/components/wizard/OptionCard";
import {
  Swords, Scroll, Crown, Tent, Search, Smile, Landmark, Snowflake, Sun, Trees,
  Cog, Anchor, Moon, Sparkles, CloudRain, Eye, Monitor, Table, Layers,
  ArrowRight, ArrowLeft, Loader2, Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TEMAS = [
  { id: "mork", label: "Mørk fantasy", desc: "Skygger, forbannelser, moral i gråtoner", icon: Moon },
  { id: "episk", label: "Episk heltreise", desc: "Stor skala, skjebne, verdensredning", icon: Scroll },
  { id: "intrige", label: "Politisk intrige", desc: "Fraksjoner, makt, forræderi", icon: Crown },
  { id: "overlevelse", label: "Overlevelse", desc: "Knapp ressurser, fare, utpost", icon: Tent },
  { id: "mystikk", label: "Mystikk & etterforskning", desc: "Gåter, avsløringer, det skjulte", icon: Search },
  { id: "komisk", label: "Komisk & eventyrlyst", desc: "Lett, humoristisk, sjarmerende", icon: Smile },
];

const SETTINGS = [
  { id: "middelalder", label: "Middelalder-fantasy", desc: "Borger, riddere, drager", icon: Landmark },
  { id: "vinter", label: "Nordlig vinter", desc: "Snø, fjell, lange netter", icon: Snowflake },
  { id: "orken", label: "Ørkenrike", desc: "Sand, oaser, gamle guder", icon: Sun },
  { id: "urskog", label: "Urskog & elver", desc: "Vill natur, fe, ruinbyer", icon: Trees },
  { id: "steampunk", label: "Steampunk-by", desc: "Tannhjul, røyk, oppfinnelser", icon: Cog },
  { id: "havneby", label: "Havneby & øyrike", desc: "Skip, smuglere, hemmeligheter", icon: Anchor },
];

const TONER = [
  { id: "mork", label: "Mørk & nådeløs", icon: Moon },
  { id: "episk", label: "Episk & storslått", icon: Sparkles },
  { id: "melankolsk", label: "Melankolsk", icon: CloudRain },
  { id: "lystig", label: "Lystig & humoristisk", icon: Smile },
  { id: "ra", label: "Rå & realistisk", icon: Eye },
];

const MODES = [
  { id: "digital", label: "Digital", desc: "Skjerm-basert", icon: Monitor },
  { id: "physical", label: "Fysisk", desc: "Bord & brikker", icon: Table },
  { id: "hybrid", label: "Hybrid", desc: "Bord + skjermvisning", icon: Layers },
];

const STEP_LABELS = ["Tema", "Verden", "Tone", "Spillemåte", "Opprett"];

export default function CreationWizard({ open, onOpenChange, onSaved, activeCount = 0 }) {
  const [step, setStep] = useState(0);
  const [sel, setSel] = useState({ tema: null, setting: null, tone: null, mode: "digital", title: "", premise: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setStep(0);
      setSel({ tema: null, setting: null, tone: null, mode: "digital", title: "", premise: "" });
    }
  }, [open]);

  const limit = campaignLimit();
  const atQuota = activeCount >= limit;

  const pick = (k, v) => setSel((s) => ({ ...s, [k]: s[k] === v ? null : v }));

  const composePremise = () => {
    const t = TEMAS.find((x) => x.id === sel.tema);
    const s = SETTINGS.find((x) => x.id === sel.setting);
    const tn = TONER.find((x) => x.id === sel.tone);
    return `${t?.label || "En historie"} i ${s?.label || "en ukjent verden"}. ${tn?.label || ""} tone. ${t?.desc || ""}`.trim();
  };

  const canAdvance = () => {
    if (step === 0) return !!sel.tema;
    if (step === 1) return !!sel.setting;
    if (step === 2) return !!sel.tone;
    return true;
  };

  const next = () => {
    if (step === 3) setSel((s) => ({ ...s, premise: s.premise || composePremise() }));
    setStep((i) => Math.min(i + 1, STEP_LABELS.length - 1));
  };
  const back = () => setStep((i) => Math.max(i - 1, 0));

  const submit = async () => {
    if (!sel.title.trim() || atQuota) return;
    setSaving(true);
    try {
      const s = SETTINGS.find((x) => x.id === sel.setting);
      const tn = TONER.find((x) => x.id === sel.tone);
      const created = await base44.entities.Campaign.create({
        title: sel.title.trim(),
        premise: sel.premise.trim(),
        setting: s?.label || "",
        tone: tn?.label || "",
        status: "draft",
        play_mode: sel.mode,
      });
      onSaved(created);
    } catch (e) {
      alert("Oppretting feilet: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  const options = [TEMAS, SETTINGS, TONER, MODES][step];
  const fieldKey = ["tema", "setting", "tone", "mode"][step];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 gap-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <SheetTitle className="font-heading text-xl flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" /> Spinn den røde tråden
          </SheetTitle>
          <div className="flex items-center gap-1.5 mt-2">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "h-1.5 rounded-full transition-all",
                    i === step ? "w-8 bg-primary" : i < step ? "w-4 bg-primary/50" : "w-4 bg-border"
                  )}
                />
              </div>
            ))}
            <span className="text-xs text-muted-foreground ml-2">{STEP_LABELS[step]}</span>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-6 py-5">
          {step < 4 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {options.map((o) => (
                <OptionCard
                  key={o.id}
                  option={o}
                  selected={sel[fieldKey] === o.id}
                  onClick={() => pick(fieldKey, o.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-primary/40 text-primary">{TEMAS.find((x) => x.id === sel.tema)?.label}</Badge>
                <Badge variant="outline" className="border-primary/40 text-primary">{SETTINGS.find((x) => x.id === sel.setting)?.label}</Badge>
                <Badge variant="outline" className="border-primary/40 text-primary">{TONER.find((x) => x.id === sel.tone)?.label}</Badge>
                <Badge variant="outline" className="border-primary/40 text-primary">{MODES.find((x) => x.id === sel.mode)?.label}</Badge>
              </div>
              <div>
                <Label className="mb-1.5 block">Kampanjetittel</Label>
                <Input
                  value={sel.title}
                  onChange={(e) => setSel((s) => ({ ...s, title: e.target.value }))}
                  placeholder="f.eks. Skygger over Eldoria"
                  autoFocus
                />
              </div>
              <div>
                <Label className="mb-1.5 block">Premiss – den røde tråden</Label>
                <Textarea
                  rows={5}
                  value={sel.premise}
                  onChange={(e) => setSel((s) => ({ ...s, premise: e.target.value }))}
                  placeholder="Hovedfortellingen – hva står på spill?"
                />
              </div>
              {atQuota && (
                <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
                  Du har nådd gratis-kvoten på {limit} aktive kampanjer.
                </div>
              )}
            </div>
          )}
        </div>

        <SheetFooter className="px-6 py-4 border-t border-border shrink-0 flex-row gap-2">
          <Button variant="ghost" onClick={back} disabled={step === 0} className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Tilbake
          </Button>
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)}>Avbryt</Button>
          {step < 4 ? (
            <Button onClick={next} disabled={!canAdvance()} className="gap-1.5">
              Neste <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={submit} disabled={saving || !sel.title.trim() || atQuota} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {saving ? "Oppretter…" : "Opprett rød tråd"}
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}