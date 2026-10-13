import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDevice } from '@/hooks/useDevice';
import useGameDisplayData from '@/components/sys/useGameDisplayData';
import GameDisplayHeader from '@/components/sys/GameDisplayHeader';
import GameDisplayContent from '@/components/sys/GameDisplayContent';
import { Splash, Unknown } from '@/components/sys/SysStates';
import { Button } from '@/components/ui/button';

export default function SysGameDisplay() {
  const { deviceId } = useParams();
  const { device, loading } = useDevice(deviceId);
  const data = useGameDisplayData(device?.campaign_id);
  const [on, setOn] = useState({ players: true, map: true, log: true });
  if (loading) return <Splash />;
  if (!device) return <Unknown note="Denne display-ID-en er ikke registrert." />;
  if (!device.campaign_id) return <Unknown note="Displayet er ikke koblet til en kampanje ennå." />;
  if (data.campaign.isPending) return <Splash />;
  if (data.campaign.isError) return <div role="alert" className="h-dvh flex flex-col gap-3 items-center justify-center bg-background text-foreground">
    <p>Kunne ikke laste kampanjen.</p><Button onClick={() => data.campaign.refetch()}>Prøv igjen</Button>
  </div>;
  return <div className="h-dvh min-h-0 flex flex-col overflow-hidden bg-background text-foreground">
    <GameDisplayHeader title={data.campaign.data?.title} on={on} setOn={setOn} />
    <GameDisplayContent key={device.campaign_id} on={on} data={data} />
  </div>;
}