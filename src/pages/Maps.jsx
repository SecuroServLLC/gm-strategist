import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCampaign } from "@/hooks/useCampaign";
import MapCard from "@/components/MapCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Map as MapIcon, Plus, ScrollText, Loader2 } from "lucide-react";

export default function Maps() {
  const { campaign, loading } = useCampaign();
  const navigate = useNavigate();
  const [maps, setMaps] = useState([]);
  const [loadingList, setLoadingList] = useState(true);

  const load = useCallback(async () => {
    if (!campaign) return;
    setLoadingList(true);
    try {
      const list = await base44.entities.MapItem.filter({ campaign_id: campaign.id });
      setMaps(list);
    } finally {
      setLoadingList(false);
    }
  }, [campaign]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="glass-card max-w-md">
          <CardContent className="p-8 text-center">
            <ScrollText className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="font-heading text-2xl mb-2">Ingen kampanje</h2>
            <p className="text-muted-foreground mb-5">Opprett den røde tråden før du bygger kartgalleriet.</p>
            <Link to="/campaign"><Button className="gap-2"><ScrollText className="w-4 h-4" /> Opprett rød tråd</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <MapIcon className="w-4 h-4 text-primary" />
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Kart</span>
            </div>
            <h1 className="font-heading text-4xl">Kartgalleri</h1>
            <p className="text-muted-foreground mt-1">{maps.length} kart · mål mot 10–15 komplette lokasjoner.</p>
          </div>
          <Button onClick={() => navigate("/maps/new")} className="gap-2">
            <Plus className="w-4 h-4" /> Nytt kart
          </Button>
        </div>

        {loadingList ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
        ) : maps.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <MapIcon className="w-12 h-12 text-primary/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">Ingen kart enda. Generer et konsept eller last opp din egen skisse.</p>
              <Button onClick={() => navigate("/maps/new")} className="gap-2"><Plus className="w-4 h-4" /> Nytt kart</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {maps.map((m) => (
              <MapCard key={m.id} map={m} onClick={() => navigate(`/maps/${m.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}