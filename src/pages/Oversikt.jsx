import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCampaign } from "@/hooks/useCampaign";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Workflow, Users, Map as MapIcon, ScrollText, ArrowRight, Dices, BookOpen, Backpack, Printer, Swords, UserPlus, Cog, Library } from "lucide-react";

export default function Oversikt() {
  const { campaign, loading } = useCampaign();
  const [counts, setCounts] = useState({ nodes: 0, characters: 0, maps: 0, sessions: 0, party: 0, players: 0 });

  useEffect(() => {
    if (!campaign) return;
    (async () => {
      try {
        const [n, c, m, s, p, pl] = await Promise.all([
          base44.entities.StoryNode.filter({ campaign_id: campaign.id }),
          base44.entities.Character.filter({ campaign_id: campaign.id }),
          base44.entities.MapItem.filter({ campaign_id: campaign.id }),
          base44.entities.Session.filter({ campaign_id: campaign.id }),
          base44.entities.PartyMember.filter({ campaign_id: campaign.id }),
          base44.entities.Player.filter({ campaign_id: campaign.id }),
        ]);
        setCounts({ nodes: n.length, characters: c.length, maps: m.length, sessions: s.length, party: p.length, players: pl.length });
      } catch (e) {}
    })();
  }, [campaign?.id]);

  if (loading) {
    return (<div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>);
  }
  if (!campaign) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Library className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="mb-4">Vel eller opprett ei kampanje først.</p>
          <Link to="/"><Button variant="outline">Til kampanjane</Button></Link>
        </div>
      </div>
    );
  }

  const stats = [
    { to: "/historie", label: "Historienoder", value: counts.nodes, icon: Workflow, desc: "Scener, valg og terningutfall" },
    { to: "/karakterer", label: "Karakterer", value: counts.characters, icon: Users, desc: "Karakterkort og arketyper" },
    { to: "/kart", label: "Kart", value: counts.maps, icon: MapIcon, desc: "Lokasjoner og skisser" },
    { to: "/sesjoner", label: "Økter", value: counts.sessions, icon: BookOpen, desc: "Spilte økter og notater" },
    { to: "/gruppe", label: "Følget", value: counts.party, icon: Backpack, desc: "Følgesvenner og inventar" },
    { to: "/spelarar", label: "Spelarar", value: counts.players, icon: UserPlus, desc: "Kven som er med" },
  ];
  const actions = [
    { to: "/historie", icon: Workflow, label: "Bygg historie-flyt", desc: "Tegn opp scener, valg og terningkast i et flytskjema." },
    { to: "/karakterer", icon: Users, label: "Generer karakterer", desc: "La AIen lage unike karakterkort med portrett." },
    { to: "/kart", icon: MapIcon, label: "Lag kartgalleriet", desc: "10–15 kart med notater og referanseskisser." },
    { to: "/system", icon: Cog, label: "Sett opp regelverket", desc: "Eigendefinerte attributtar, ferdigheter, terningmekanikk og modusar." },
    { to: "/spelarar", icon: UserPlus, label: "Registrer spelarar", desc: "Kven som er med, og kva karakter dei speler." },
    { to: "/sesjoner", icon: BookOpen, label: "Planlegg økter", desc: "Flere økter per kampanje – notater bæres inn i neste økt." },
    { to: "/gruppe", icon: Backpack, label: "Sett opp følget", desc: "Karakterer og brikker på laget, pluss inventar og gull." },
    { to: "/spill", icon: Swords, label: "Spill økta", desc: "HP, tilstander, ressurser, utrusting og hendelseslogg ved bordet." },
    { to: "/utskrift", icon: Printer, label: "Print A6-ark", desc: "NPC-kort og brikkekort, fire per A4-side." },
  ];

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center gap-3 mb-2">
          <Dices className="w-6 h-6 text-primary" />
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Oversikt</span>
        </div>
        <h1 className="font-heading text-4xl text-foreground mb-1">{campaign.title}</h1>
        <p className="text-muted-foreground text-lg mb-10">Din kampanje i et nøtteskall.</p>

        <Card className="glass-card mb-8">
          <CardContent className="p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/40 text-primary capitalize">{campaign.status}</Badge>
                {campaign.tone && <Badge variant="secondary" className="capitalize">{campaign.tone}</Badge>}
              </div>
              <Link to="/kampanje"><Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">Rediger <ArrowRight className="w-3.5 h-3.5" /></Button></Link>
            </div>
            <div className="flex items-center gap-2 mb-3 text-primary"><ScrollText className="w-4 h-4" /><span className="text-xs uppercase tracking-widest">Den røde tråden</span></div>
            <p className="text-foreground/90 leading-relaxed whitespace-pre-line font-heading text-lg">{campaign.premise || "Ingen premiss satt enda."}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <Link key={s.to} to={s.to}>
                <Card className="glass-card hover:border-primary/40 transition-colors h-full group cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-3"><Icon className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors" /><span className="font-heading text-4xl text-foreground">{s.value}</span></div>
                    <h3 className="font-heading text-xl mb-0.5">{s.label}</h3><p className="text-sm text-muted-foreground">{s.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Videre planlegging</CardTitle></CardHeader>
          <CardContent className="space-y-2.5">
            {actions.map((a) => {
              const Icon = a.icon;
              return (
                <Link key={a.to} to={a.to} className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/40 transition-colors group">
                  <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center"><Icon className="w-4.5 h-4.5 text-primary" /></div>
                  <div className="flex-1"><p className="font-medium">{a.label}</p><p className="text-sm text-muted-foreground">{a.desc}</p></div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}