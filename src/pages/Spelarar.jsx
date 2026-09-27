import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCampaign } from "@/hooks/useCampaign";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, UserPlus, Pencil, Trash2 } from "lucide-react";
import PlayerDialog from "@/components/PlayerDialog";

export default function Spelarar() {
  const { campaign, loading } = useCampaign();
  const [players, setPlayers] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [dialog, setDialog] = useState({ open: false, player: null });

  useEffect(() => {
    if (!campaign) return;
    let active = true;
    (async () => {
      try {
        const [p, c] = await Promise.all([
          base44.entities.Player.filter({ campaign_id: campaign.id }),
          base44.entities.Character.filter({ campaign_id: campaign.id }),
        ]);
        if (!active) return;
        setPlayers(p); setCharacters(c);
      } catch (e) {}
    })();
    return () => { active = false; };
  }, [campaign?.id]);

  const save = async (payload) => {
    if (payload.id) {
      const u = await base44.entities.Player.update(payload.id, { name: payload.name, contact: payload.contact, role: payload.role, character_id: payload.character_id || null, notes: payload.notes });
      setPlayers((p) => p.map((x) => (x.id === payload.id ? u : x)));
    } else {
      const c = await base44.entities.Player.create({ ...payload, campaign_id: campaign.id });
      setPlayers((p) => [...p, c]);
    }
    setDialog({ open: false, player: null });
  };
  const del = async (id) => { await base44.entities.Player.delete(id); setPlayers((p) => p.filter((x) => x.id !== id)); };

  const charName = (id) => (characters.find((c) => c.id === id)?.name) || "";

  if (loading) {
    return (<div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>);
  }
  if (!campaign) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <UserPlus className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="mb-4">Du trenger en kampanje først.</p>
          <Link to="/"><Button variant="outline">Til kampanjene</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center gap-3 mb-2"><UserPlus className="w-6 h-6 text-primary" /><span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Bordet</span></div>
        <div className="flex items-end justify-between gap-4 mb-8">
          <div><h1 className="font-heading text-4xl mb-1">Spillere</h1><p className="text-muted-foreground text-lg">Hvem som sitter med, og hva de spiller.</p></div>
          <Button className="gap-1.5" onClick={() => setDialog({ open: true, player: null })}><Plus className="w-4 h-4" /> Legg til spiller</Button>
        </div>
        {players.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-10">Ingen spillere registrert enda. Legg til de som er med ved bordet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {players.map((pl) => (
              <Card key={pl.id} className="glass-card group">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <Badge variant="outline" className="border-primary/30 text-primary/90">{pl.role || "Spiller"}</Badge>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDialog({ open: true, player: pl })}><Pencil className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => del(pl.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                  <h3 className="font-heading text-lg leading-tight mb-1">{pl.name}</h3>
                  {pl.character_id && <p className="text-sm text-primary/90">Spiller: {charName(pl.character_id)}</p>}
                  {pl.contact && <p className="text-xs text-muted-foreground mt-1">{pl.contact}</p>}
                  {pl.notes && <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{pl.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <PlayerDialog open={dialog.open} player={dialog.player} characters={characters} onOpenChange={(o) => setDialog({ open: o, player: null })} onSave={save} />
    </div>
  );
}