import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCampaign } from "@/hooks/useCampaign";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Workflow, Users, Map as MapIcon, ScrollText, ArrowRight, Sparkles, Dices, BookOpen } from "lucide-react";

export default function Home() {
  const { campaign, loading } = useCampaign();
  const [counts, setCounts] = useState({ nodes: 0, characters: 0, maps: 0, sessions: 0 });

  useEffect(() => {
    if (!campaign) return;
    (async () => {
      try {
        const [nodes, characters, maps, sessions] = await Promise.all([
          base44.entities.StoryNode.filter({ campaign_id: campaign.id }),
          base44.entities.Character.filter({ campaign_id: campaign.id }),
          base44.entities.MapItem.filter({ campaign_id: campaign.id }),
          base44.entities.Session.filter({ campaign_id: campaign.id }),
        ]);
        setCounts({ nodes: nodes.length, characters: characters.length, maps: maps.length, sessions: sessions.length });
      } catch (e) {}
    })();
  }, [campaign]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center gap-3 mb-2">
          <Dices className="w-6 h-6 text-primary" />
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Oversikt</span>
        </div>
        <h1 className="font-heading text-4xl text-foreground mb-1">
          {campaign ? campaign.title : "Velkommen, Keeper"}
        </h1>
        <p className="text-muted-foreground text-lg mb-10">
          {campaign ? "Din kampanje i et nøtteskall." : "Begynn med å spinne den røde tråden."}
        </p>

        {!campaign ? (
          <Card className="glass-card border-primary/20 max-w-2xl">
            <CardContent className="p-8 text-center">
              <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="font-heading text-2xl mb-2">Ingen kampanje enda</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Definer den røde tråden først – hovedfortellingen, verdenen, og de hintene og begrensningene som styrer spillet.
              </p>
              <Link to="/kampanje">
                <Button size="lg" className="gap-2">
                  <ScrollText className="w-4 h-4" /> Opprett rød tråd
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="glass-card mb-8">
              <CardContent className="p-7">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-primary/40 text-primary capitalize">{campaign.status}</Badge>
                    {campaign.tone && <Badge variant="secondary" className="capitalize">{campaign.tone}</Badge>}
                  </div>
                  <Link to="/kampanje">
                    <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                      Rediger <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
                <div className="flex items-center gap-2 mb-3 text-primary">
                  <ScrollText className="w-4 h-4" />
                  <span className="text-xs uppercase tracking-widest">Den røde tråden</span>
                </div>
                <p className="text-foreground/90 leading-relaxed whitespace-pre-line font-heading text-lg">
                  {campaign.premise || "Ingen premiss satt enda."}
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { to: "/historie", label: "Historienoder", value: counts.nodes, icon: Workflow, desc: "Scener, valg og terningutfall" },
                { to: "/karakterer", label: "Karakterer", value: counts.characters, icon: Users, desc: "Karakterkort og arketyper" },
                { to: "/kart", label: "Kart", value: counts.maps, icon: MapIcon, desc: "Lokasjoner og skisser" },
                { to: "/sesjoner", label: "Økter", value: counts.sessions, icon: BookOpen, desc: "Spilte økter og notater" },
              ].map((s) => {
                const Icon = s.icon;
                return (
                  <Link key={s.to} to={s.to}>
                    <Card className="glass-card hover:border-primary/40 transition-colors h-full group cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-3">
                          <Icon className="w-5 h-5 text-primary/70 group-hover:text-primary transition-colors" />
                          <span className="font-heading text-4xl text-foreground">{s.value}</span>
                        </div>
                        <h3 className="font-heading text-xl mb-0.5">{s.label}</h3>
                        <p className="text-sm text-muted-foreground">{s.desc}</p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Videre planlegging</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {[
                  { to: "/historie", icon: Workflow, label: "Bygg historie-flyt", desc: "Tegn opp scener, valg og terningkast i et flytskjema." },
                  { to: "/karakterer", icon: Users, label: "Generer karakterer", desc: "La AIen lage unike karakterkort med portrett." },
                  { to: "/kart", icon: MapIcon, label: "Lag kartgalleriet", desc: "10–15 kart med notater og referanseskisser." },
                  { to: "/sesjoner", icon: BookOpen, label: "Planlegg økter", desc: "Flere økter per kampanje – notater bæres inn i neste økt." },
                  ].map((a) => {
                  const Icon = a.icon;
                  return (
                    <Link key={a.to} to={a.to} className="flex items-center gap-4 p-3 rounded-lg hover:bg-accent/40 transition-colors group">
                      <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center">
                        <Icon className="w-4.5 h-4.5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{a.label}</p>
                        <p className="text-sm text-muted-foreground">{a.desc}</p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                    </Link>
                  );
                })}
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}