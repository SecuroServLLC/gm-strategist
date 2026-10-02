import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCampaign } from "@/hooks/useCampaign";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Library, Plus, Sparkles, Trash2, CreditCard } from "lucide-react";
import CampaignCard from "@/components/CampaignCard";
import CampaignSelectPanel from "@/components/CampaignSelectPanel";
import CreationWizard from "@/components/CreationWizard";
import CharacterWizard from "@/components/CharacterWizard";
import DeleteCampaignDialog from "@/components/DeleteCampaignDialog";
import TrashDialog from "@/components/TrashDialog";
import SubscriptionPanel from "@/components/SubscriptionPanel";
import { campaignLimit } from "@/lib/subscription";

export default function Home() {
  const { campaigns, trashedCampaigns, loading, setActive, trash, restore, purge, refresh } = useCampaign();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [trashOpen, setTrashOpen] = useState(false);
  const [subOpen, setSubOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [charWizard, setCharWizard] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [counts, setCounts] = useState(null);
  const [countsLoading, setCountsLoading] = useState(false);

  const limit = campaignLimit();
  const selected = campaigns.find((c) => c.id === selectedId) || null;

  const play = (c) => { setActive(c.id); navigate("/dashboard"); };

  useEffect(() => {
    if (!selected) { setCounts(null); return; }
    let active = true;
    setCountsLoading(true);
    Promise.all([
      base44.entities.Session.count({ campaign_id: selected.id }).catch(() => 0),
      base44.entities.Character.count({ campaign_id: selected.id }).catch(() => 0),
    ]).then(([s, c]) => { if (active) setCounts({ sessions: s, characters: c }); })
      .finally(() => { if (active) setCountsLoading(false); });
    return () => { active = false; };
  }, [selected?.id]);

  if (loading) {
    return (<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>);
  }

  return (
    <div className="min-h-screen overflow-y-auto scrollbar-thin bg-background text-foreground">
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex items-center gap-3 mb-2">
          <Library className="w-6 h-6 text-primary" />
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Stories</span>
        </div>
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-4xl mb-1">Select Campaign</h1>
            <p className="text-muted-foreground text-lg">Pick a story to play, then press Play to enter.</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/40 text-primary">{campaigns.length} / {limit}</Badge>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setSubOpen(true)}><CreditCard className="w-4 h-4" /> Subscription</Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setTrashOpen(true)}>
              <Trash2 className="w-4 h-4" /> Trash {trashedCampaigns.length > 0 && <span className="ml-0.5 text-xs bg-muted rounded-full px-1.5">{trashedCampaigns.length}</span>}
            </Button>
            <Button className="gap-1.5" onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4" /> New</Button>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <Card className="glass-card border-primary/20 max-w-2xl mx-auto">
            <CardContent className="p-10 text-center">
              <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="font-heading text-2xl mb-2">No campaigns yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">Spin the red thread first — the main story, the world, and the hints that steer the game.</p>
              <Button size="lg" className="gap-2" onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4" /> Create campaign</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5">
              {campaigns.map((c) => (
                <CampaignCard key={c.id} campaign={c} selected={selectedId === c.id} onSelect={(campaign) => setSelectedId(campaign.id)} onDelete={setDeleteTarget} />
              ))}
            </div>
            <div className="lg:w-96 shrink-0">
              {selected ? (
                <CampaignSelectPanel campaign={selected} counts={counts} countsLoading={countsLoading} onPlay={() => play(selected)} />
              ) : (
                <Card className="glass-card border-dashed border-border h-full">
                  <CardContent className="p-8 text-center h-full flex flex-col items-center justify-center min-h-[200px]">
                    <Library className="w-8 h-8 text-muted-foreground/50 mb-3" />
                    <p className="text-sm text-muted-foreground">Select a campaign to see its details.</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      <CreationWizard
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        activeCount={campaigns.length}
        onSaved={(c) => { setActive(c.id); setDialogOpen(false); setCharWizard(c); setSelectedId(c.id); }}
      />
      <CharacterWizard
        open={!!charWizard}
        onOpenChange={(o) => !o && setCharWizard(null)}
        campaign={charWizard}
        onDone={() => { setCharWizard(null); navigate("/dashboard"); }}
      />
      <DeleteCampaignDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        campaign={deleteTarget}
        onConfirm={async (c) => { await trash(c.id); if (selectedId === c.id) setSelectedId(null); setDeleteTarget(null); }}
      />
      <TrashDialog
        open={trashOpen}
        onOpenChange={setTrashOpen}
        campaigns={trashedCampaigns}
        onRestore={async (id) => { await restore(id); await refresh(); }}
        onPurge={async (id) => { await purge(id); }}
      />
      <SubscriptionPanel open={subOpen} onOpenChange={setSubOpen} activeCount={campaigns.length} />
    </div>
  );
}