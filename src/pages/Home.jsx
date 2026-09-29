import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCampaign } from "@/hooks/useCampaign";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Library, Plus, Sparkles, Trash2, CreditCard } from "lucide-react";
import CampaignCard from "@/components/CampaignCard";
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

  const limit = campaignLimit();

  const open = (c) => { setActive(c.id); navigate("/oversikt"); };

  if (loading) {
    return (<div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>);
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex items-center gap-3 mb-2">
          <Library className="w-6 h-6 text-primary" />
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Historier</span>
        </div>
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-4xl mb-1">Kampanjer</h1>
            <p className="text-muted-foreground text-lg">Hvilken historie vil du utforske i kveld?</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/40 text-primary">{campaigns.length} / {limit}</Badge>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setSubOpen(true)}><CreditCard className="w-4 h-4" /> Abonnement</Button>
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setTrashOpen(true)}>
              <Trash2 className="w-4 h-4" /> Papirkurv {trashedCampaigns.length > 0 && <span className="ml-0.5 text-xs bg-muted rounded-full px-1.5">{trashedCampaigns.length}</span>}
            </Button>
            <Button className="gap-1.5" onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4" /> Ny kampanje</Button>
          </div>
        </div>

        {campaigns.length === 0 ? (
          <Card className="glass-card border-primary/20 max-w-2xl mx-auto">
            <CardContent className="p-10 text-center">
              <Sparkles className="w-10 h-10 text-primary mx-auto mb-4" />
              <h2 className="font-heading text-2xl mb-2">Ingen kampanje enda</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">Spinn den røde tråden først – hovedfortellingen, verden, og hintene som styrer spillet.</p>
              <Button size="lg" className="gap-2" onClick={() => setDialogOpen(true)}><Plus className="w-4 h-4" /> Opprett rød tråd</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {campaigns.map((c) => <CampaignCard key={c.id} campaign={c} onOpen={() => open(c)} onDelete={setDeleteTarget} />)}
            </div>
            )}
            </div>
            <CreationWizard
              open={dialogOpen}
              onOpenChange={setDialogOpen}
              activeCount={campaigns.length}
              onSaved={(c) => { setActive(c.id); setDialogOpen(false); setCharWizard(c); }}
            />
            <CharacterWizard
              open={!!charWizard}
              onOpenChange={(o) => !o && setCharWizard(null)}
              campaign={charWizard}
              onDone={() => { setCharWizard(null); navigate("/oversikt"); }}
            />
            <DeleteCampaignDialog
            open={!!deleteTarget}
            onOpenChange={(o) => !o && setDeleteTarget(null)}
            campaign={deleteTarget}
            onConfirm={async (c) => { await trash(c.id); setDeleteTarget(null); }}
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