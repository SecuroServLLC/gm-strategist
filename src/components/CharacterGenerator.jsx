import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, Check, Dices, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_ATTRIBUTES } from "@/lib/attributes";

const ROLES = [
  { value: "protagonist", label: "Protagonist" },
  { value: "ally", label: "Alliert" },
  { value: "antagonist", label: "Antagonist" },
  { value: "npc", label: "NPC" },
  { value: "contact", label: "Kontakt" },
  { value: "mentor", label: "Mentor" },
];

const TONES = [
  { value: "nøytral", label: "Nøytral" },
  { value: "mørk", label: "Mørk & dyster" },
  { value: "episk", label: "Episk & heltemodig" },
  { value: "komisk", label: "Komisk & lun" },
  { value: "tragisk", label: "Tragisk" },
];

const POWERS = [
  { value: "lav", label: "Lav (6–10)" },
  { value: "standard", label: "Standard (8–14)" },
  { value: "helt", label: "Helt (12–16)" },
  { value: "legendarisk", label: "Legendarisk (15–20)" },
];

function StatLine({ stats }) {
  return (
    <p className="text-xs text-muted-foreground leading-relaxed">
      {DEFAULT_ATTRIBUTES.map((a) => `${a.name} ${stats?.[a.key] ?? "—"}`).join(" · ")}
    </p>
  );
}

export default function CharacterGenerator({ open, onOpenChange, setting, onPick, onAddAll }) {
  const [prompt, setPrompt] = useState("");
  const [count, setCount] = useState("3");
  const [tone, setTone] = useState("nøytral");
  const [power, setPower] = useState("standard");
  const [roles, setRoles] = useState(["protagonist", "ally", "npc"]);
  const [raceHint, setRaceHint] = useState("");
  const [archetypeHint, setArchetypeHint] = useState("");
  const [generating, setGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [addingAll, setAddingAll] = useState(false);
  const [added, setAdded] = useState(0);

  const toggleRole = (v) =>
    setRoles((rs) => (rs.includes(v) ? rs.filter((r) => r !== v) : [...rs, v]));

  const addAll = async () => {
    if (!suggestions.length || !onAddAll) return;
    setAddingAll(true);
    setAdded(0);
    try {
      await onAddAll(suggestions);
      setAdded(suggestions.length);
      setSuggestions([]);
    } catch (e) {
      alert("Kunne ikke legge til alle: " + e.message);
    } finally {
      setAddingAll(false);
    }
  };

  const generate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("generateCharacter", {
        prompt,
        setting,
        count: Math.max(1, parseInt(count) || 3),
        tone,
        powerLevel: power,
        roles,
        raceHint,
        archetypeHint,
      });
      setSuggestions(res.data?.characters || []);
    } catch (e) {
      alert("Kunne ikke generere: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 gap-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b border-border shrink-0">
          <SheetTitle className="font-heading text-xl flex items-center gap-2">
            <Dices className="w-5 h-5 text-primary" /> Foreslå karakterer
          </SheetTitle>
          <p className="text-xs text-muted-foreground">
            Still inn hva du vil ha, så foreslår AIen flere ulike karakterer du kan velge mellom og tilpasse videre.
          </p>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-5 space-y-5">
            <div>
              <Label className="text-xs">Hva slags karakterer vil du ha?</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                className="mt-1"
                placeholder="f.eks. 'Et lite følge av utenlandske leiesoldater med mystiske fortider' eller 'tre kyber i et tettbygget havneby'"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Hvor mange vil du ha?</Label>
                <Input
                  type="number"
                  min={1}
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  className="mt-1"
                  placeholder="f.eks. 6"
                />
                <p className="text-[10px] text-muted-foreground mt-1">AIen lager minst dette antallet, ofte noen ekstra å velge mellom.</p>
              </div>
              <div>
                <Label className="text-xs">Stemning</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{TONES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Kraftnivå (attributter)</Label>
                <Select value={power} onValueChange={setPower}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{POWERS.map((p) => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Race-hint (valgfritt)</Label>
                <Input value={raceHint} onChange={(e) => setRaceHint(e.target.value)} className="mt-1" placeholder="f.eks. alver, dverger, mennesker" />
              </div>
              <div className="col-span-2">
                <Label className="text-xs">Arketype-hint (valgfritt)</Label>
                <Input value={archetypeHint} onChange={(e) => setArchetypeHint(e.target.value)} className="mt-1" placeholder="f.eks. skyggevever, kantinerer, healer" />
              </div>
            </div>

            <div>
              <Label className="text-xs mb-1.5 block">Roller å vurdere</Label>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((r) => {
                  const active = roles.includes(r.value);
                  return (
                    <button
                      key={r.value}
                      onClick={() => toggleRole(r.value)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs border transition-colors",
                        active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {r.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button onClick={generate} disabled={generating || !prompt.trim()} className="w-full gap-2">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Genererer forslag..." : `Foreslå minst ${Math.max(1, parseInt(count) || 3)}`}
            </Button>

            {added > 0 && (
              <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-sm text-primary">
                {added} karakterer lagt til i kampanjen. Lukk for å se dem, eller generer flere.
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">
                    {suggestions.length} forslag
                  </p>
                  {onAddAll && (
                    <Button onClick={addAll} disabled={addingAll} size="sm" className="gap-1.5">
                      {addingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Users className="w-3.5 h-3.5" />}
                      {addingAll ? "Legger til alle…" : "Legg til alle"}
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground -mt-1">Trykk «Bruk» for å tilpasse én, eller «Legg til alle» for å opprette hele gruppen på én gang.</p>
                {suggestions.map((c, i) => (
                  <div key={i} className="rounded-xl border border-border bg-card/40 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-heading text-lg truncate">{c.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {c.archetype}
                          {c.race ? ` · ${c.race}` : ""} <span className="text-primary/70">· {c.role}</span>
                        </p>
                      </div>
                      <Button size="sm" onClick={() => onPick?.(c)} className="gap-1.5 shrink-0">
                        <Check className="w-3.5 h-3.5" /> Bruk
                      </Button>
                    </div>
                    <StatLine stats={c.stats} />
                    {c.background && <p className="text-xs text-muted-foreground line-clamp-3">{c.background}</p>}
                    {c.abilities?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {c.abilities.slice(0, 4).map((ab, j) => (
                          <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-accent/40 text-muted-foreground">
                            {ab.split(":")[0]}
                          </span>
                        ))}
                      </div>
                    )}
                    {c.hook && <p className="text-xs text-primary/80 italic">Hook: {c.hook}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}