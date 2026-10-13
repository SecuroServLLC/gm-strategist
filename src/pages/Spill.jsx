import React from 'react';
import { Link } from 'react-router-dom';
import { useCampaign } from '@/hooks/useCampaign';
import { Button } from '@/components/ui/button';
import { Loader2, Swords } from 'lucide-react';
import PlayTable from '@/components/play/PlayTable';

export default function Spill() {
  const { campaign, loading } = useCampaign();
  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!campaign) return <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground"><Swords className="h-10 w-10" /><p>Du trenger en kampanje før du kan spille.</p><Link to="/campaign"><Button variant="outline">Opprett rød tråd</Button></Link></div>;
  return <PlayTable key={campaign.id} campaignId={campaign.id} />;
}