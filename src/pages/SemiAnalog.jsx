import React from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Compass, ArrowLeft } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { getActiveCampaignId } from '@/hooks/useCampaign';
import { Button } from '@/components/ui/button';
import SemiMapLibrary from '@/components/semi/SemiMapLibrary';
import SemiBoard from '@/components/semi/SemiBoard';
export default function SemiAnalog() {
  const campaignId = getActiveCampaignId(), [params, setParams] = useSearchParams(), mapId = params.get('map');
  const campaign = useQuery({ queryKey: ['semi-campaign',campaignId], enabled: !!campaignId, queryFn: () => base44.entities.Campaign.get(campaignId) });
  const map = useQuery({ queryKey: ['semi-map',mapId], enabled: !!mapId, queryFn: () => base44.entities.SemiAnalogMap.get(mapId) });
  if (!campaignId) return <Navigate to="/" replace />;
  const back = () => setParams({});
  return <main className="min-h-screen bg-background text-foreground parchment">
    <header className="border-b bg-card/90 px-4 sm:px-8 py-4 flex flex-wrap items-center gap-4"><Link to="/dashboard" aria-label="Til Dashboard" className="p-2 rounded hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"><ArrowLeft className="w-5 h-5" /></Link><div className="rounded-xl border border-primary/30 bg-primary/10 p-2.5"><Compass className="w-6 h-6 text-primary" /></div><div><h1 className="text-2xl leading-none">SEMI Analog</h1><p className="text-xs text-muted-foreground mt-1">{campaign.data?.title || 'GM-Strategist'} · GM-arbeidsrom</p></div><span className="ml-auto text-xs uppercase tracking-widest text-muted-foreground hidden sm:block">Planlegg · Spill · Fortell</span></header>
    <div className="max-w-[1600px] mx-auto p-4 sm:p-8">{!mapId ? <SemiMapLibrary campaignId={campaignId} onOpen={id => setParams({ map: id })} /> : map.isLoading ? <p role="status" className="p-10 text-center">Åpner spillebordet…</p> : map.isError || !map.data || map.data.campaign_id !== campaignId ? <div role="alert" className="rounded-xl border p-6 space-y-4"><p>Kartet kunne ikke åpnes. Kontroller at riktig kampanje er valgt.</p><Button onClick={back}>Til kartoversikten</Button><Button variant="outline" onClick={() => map.refetch()}>Prøv igjen</Button></div> : <SemiBoard key={map.data.id} initial={map.data} onBack={back} />}</div>
  </main>;
}