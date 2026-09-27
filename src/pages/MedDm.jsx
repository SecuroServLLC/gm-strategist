import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCampaign } from "@/hooks/useCampaign";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Bot, Pencil, Trash2, Sparkles, RefreshCw, Link2, User, Gauge, Coins, Cloud, Gem } from "lucide-react";
import FactionDialog from "@/components/FactionDialog";
import CoDmResult from "@/components/CoDmResult";
import PlayerHooksCard from "@/components/meddm/PlayerHooksCard";
import SchrodingerNpcCard from "@/components/meddm/SchrodingerNpcCard";
import PacingCard from "@/components/meddm/PacingCard";
import EconomyCard from "@/components/meddm/EconomyCard";
import TravelWeatherCard from "@/components/meddm/TravelWeatherCard";
import LootCard from "@/components/meddm/LootCard";

function FactionPower({ power }) {
  const p = Math.max(0, Math.min(100, power || 0));
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5"><span>Makt</span><span>{power ?? "?"}/100</span></div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary" style={{ width: `${p}%` }} /></div>
    </div>
  );
}

const TOOLS = [
  { id: "ripple", label: "Ripple", icon: RefreshCw },
  { id: "hooks", label: "Spillerkroker", icon: Link2 },
  { id: "npc", label: "Nød-NPC", icon: User },
  { id: "tempo", label: "Tempo", icon: Gauge },
  { id: "okonomi", label: "Økonomi", icon: Coins },
  { id: "reise", label: "Reise & vær", icon: Cloud },
  { id: "loot", label: "Loot", icon: Gem },
];

export default function MedDm() {
  const { campaign, loading } = useCampaign();
  const [factions, setFactions] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [event, setEvent] = useState("");
  const [result, setResult] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [dialog, setDialog] = useState({ open: false, faction: null });
  const [applied, setApplied] = useState({});
  const [activeTool, setActiveTool] = useState("ripple");

  useEffect(() => {
    if (!campaign) return;
    let active = true;
    (async () => {
      try {
        const [f, s, c] = await Promise.all([
          base44.entities.Faction.filter({ campaign_id: campaign.id }),
          base44.entities.Session.filter({ campaign_id: campaign.id }),
          base44.entities.Character.filter({ campaign_id: campaign.id }),
        ]);
        if (!active) return;
        s.sort((a, b) => (a.session_number || 0) - (b.session_number || 0));
        setFactions(f); setSessions(s); setCharacters(c);
      } catch (e) {}
    })();
    return () => { active = false; };
  }, [campaign?.id]);

  const latestWithRecap = [...sessions].reverse().find((s) => s.recap && s.recap.trim()) || null;

  const saveFaction = async (payload) => {
    if (payload.id) {
      const u = await base44.entities.Faction.update(payload.id, { name: payload.name, status: payload.status, power: payload.power, agenda: payload.agenda, description: payload.description, notes: payload.notes });
      setFactions((p) => p.map((x) => (x.id === payload.id ? u : x)));
    } else {
      const c = await base44.entities.Faction.create({ ...payload, campaign_id: campaign.id });
      setFactions((p) => [...p, c]);
    }
    setDialog({ open: false, faction: null });
  };
  const delFaction = async (id) => { await base44.entities.Faction.delete(id); setFactions((p) => p.filter((x) => x.id !== id)); };

  const analyze = async () => {
    setAnalyzing(true); setResult(null); setApplied({});
    try {
      const res = await base44.functions.invoke("coDmAnalyze", { campaign_id: campaign.id, event: event.trim() });
      setResult(res.data || res);
    } catch (e) { setResult({ error: e.message }); }
    finally { setAnalyzing(false); }
  };

  const applyFactionUpdate = async (upd, idx) => {
    const match = factions.find((f) => f.name.toLowerCase() === upd.name.toLowerCase());
    if (!match) { setApplied((a) => ({ ...a, ["f" + idx]: true })); return; }
    const tag = `Etter økt ${result.session_number || ""}: ${[upd.activity, upd.agenda_note].filter(Boolean).join(" — ")}`.trim();
    const newNotes = [match.notes, tag].filter(Boolean).join("\n");
    const newActivities = upd.activity ? [...(match.activities || []), upd.activity] : (match.activities || []);
    const u = await base44.entities.Faction.update(match.id, {
      status: upd.status || match.status,
      power: typeof upd.power === "number" ? upd.power : match.power,
      activities: newActivities,
      notes: newNotes,
    });
    setFactions((p) => p.map((x) => (x.id === match.id ? u : x)));
    setApplied((a) => ({ ...a, ["f" + idx]: true }));
  };

  const applyNpcAgenda = async (ag, idx) => {
    const match = characters.find((c) => c.name.toLowerCase() === ag.name.toLowerCase());
    if (!match) { setApplied((a) => ({ ...a, ["n" + idx]: true })); return; }
    const tag = `Etter økt ${result.session_number || ""}: ${ag.note || ""}`.trim();
    const newNotes = [match.notes, tag].filter(Boolean).join("\n");
    const u = await base44.entities.Character.update(match.id, { secret_agenda: ag.agenda, notes: newNotes });
    setCharacters((p) => p.map((x) => (x.id === match.id ? u : x)));
    setApplied((a) => ({ ...a, ["n" + idx]: true }));
  };

  const saveComplications = async () => {
    if (!result?.complications?.length) return;
    const planned = sessions.find((s) => s.status === "planned") || null;
    const target = planned || sessions[sessions.length - 1] || null;
    if (!target) return;
    const text = "Komplikasjoner fra med-DM:\n" + result.complications.map((c, i) => `${i + 1}. ${c}`).join("\n");
    const newPrep = target.prep_notes ? target.prep_notes + "\n\n" + text : text;
    const u = await base44.entities.Session.update(target.id, { prep_notes: newPrep });
    setSessions((p) => p.map((x) => (x.id === target.id ? u : x)));
    setApplied((a) => ({ ...a, complications: true }));
  };

  if (loading) {
    return (<div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>);
  }
  if (!campaign) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Bot className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="mb-4">Du trenger en kampanje først.</p>
          <Link to="/"><Button variant="outline">Til kampanjene</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex items-center gap-3 mb-2"><Bot className="w-6 h-6 text-primary" /><span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Levende verden</span></div>
        <h1 className="font-heading text-4xl mb-1">Med-DM</h1>
        <p className="text-muted-foreground text-lg mb-8">En levende verden: fraksjoner og makter beveger seg i bakgrunnen, konsekvenser riper gjennom politikk, økonomi og hevn, og viktige NPC-er har hemmelige agendaer som utvikler seg uavhengig av spillerne.</p>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl">Fraksjoner &amp; makt</h2>
              <Button size="sm" className="gap-1.5" onClick={() => setDialog({ open: true, faction: null })}><Plus className="w-4 h-4" /> Legg til</Button>
            </div>
            {factions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ingen fraksjoner enda. Legg til tjuvligaer, magi-laug, adelsfamilier og makter – med makt og skjult agenda.</p>
            ) : (
              <div className="space-y-3">
                {factions.map((f) => (
                  <Card key={f.id} className="glass-card group">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h3 className="font-heading text-lg leading-tight">{f.name}</h3>
                          {f.status && <Badge variant="secondary" className="mt-1">{f.status}</Badge>}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDialog({ open: true, faction: f })}><Pencil className="w-3.5 h-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => delFaction(f.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                        </div>
                      </div>
                      <FactionPower power={f.power} />
                      {f.description && <p className="text-sm text-foreground/80 mt-2">{f.description}</p>}
                      {f.agenda && <p className="text-xs text-amber-400/80 mt-1">Skjult agenda: {f.agenda}</p>}
                      {f.activities?.length > 0 && <p className="text-xs text-muted-foreground mt-1">Gjør: {f.activities.slice(-2).join("; ")}</p>}
                      {f.notes && <p className="text-xs text-muted-foreground mt-2 whitespace-pre-line">{f.notes}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-3 space-y-4">
            <h2 className="font-heading text-xl">Forberedelser &amp; med-DM</h2>
            <div className="flex flex-wrap gap-2">
              {TOOLS.map((t) => (
                <Button key={t.id} variant={activeTool === t.id ? "default" : "outline"} size="sm" className="gap-1.5" onClick={() => setActiveTool(t.id)}>
                  <t.icon className="w-4 h-4" /> {t.label}
                </Button>
              ))}
            </div>
            <div className="mt-2">
              {activeTool === "ripple" && (
                <div className="space-y-4">
                  <Card className="glass-card">
                    <CardContent className="p-5 space-y-3">
                      <div>
                        <Label className="mb-1.5 block text-sm">Hva gjorde spillerne sist?</Label>
                        <Textarea rows={3} value={event} onChange={(e) => setEvent(e.target.value)} placeholder={latestWithRecap ? `Bruk oppsummeringa fra økt ${latestWithRecap.session_number}, eller skriv selv…` : "f.eks. «De brente ned lageret til smuglerne og friga gisselet»"} />
                        {latestWithRecap && !event && <p className="text-xs text-muted-foreground mt-1">Tomt felt bruker oppsummeringa fra økt {latestWithRecap.session_number}.</p>}
                      </div>
                      <Button className="gap-1.5" onClick={analyze} disabled={analyzing || (!event.trim() && !latestWithRecap)}>
                        <Sparkles className="w-4 h-4" /> {analyzing ? "Med-DM tenker…" : "Kjør ripple-effekt"}
                      </Button>
                    </CardContent>
                  </Card>
                  {analyzing && <div className="flex items-center justify-center py-10"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}
                  {result && !analyzing && <CoDmResult result={result} applied={applied} onApplyFaction={applyFactionUpdate} onApplyNpc={applyNpcAgenda} onSaveComplications={saveComplications} />}
                </div>
              )}
              {activeTool === "hooks" && <PlayerHooksCard campaign={campaign} />}
              {activeTool === "npc" && <SchrodingerNpcCard campaign={campaign} />}
              {activeTool === "tempo" && <PacingCard campaign={campaign} />}
              {activeTool === "okonomi" && <EconomyCard campaign={campaign} />}
              {activeTool === "reise" && <TravelWeatherCard campaign={campaign} />}
              {activeTool === "loot" && <LootCard campaign={campaign} />}
            </div>
          </div>
        </div>
      </div>
      <FactionDialog open={dialog.open} faction={dialog.faction} onOpenChange={(o) => setDialog({ open: o, faction: null })} onSave={saveFaction} />
    </div>
  );
}