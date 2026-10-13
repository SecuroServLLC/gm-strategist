import React from 'react';
import PlayerStatCard from '@/components/sys/PlayerStatCard';
import { Button } from '@/components/ui/button';

export default function GameDisplayPlayers({ members, characters, campaign }) {
  if (!members.length) return <p className="text-sm text-muted-foreground italic">Ingen spillere claimet enda.</p>;
  if (characters.isPending) return <p role="status" className="text-sm text-muted-foreground">Laster spillere…</p>;
  if (characters.isError) return <div role="alert" className="text-sm text-destructive">Kunne ikke laste karakterene. <Button size="sm" variant="outline" onClick={() => characters.refetch()}>Prøv igjen</Button></div>;
  return <div className="grid grid-cols-1 gap-3">
    {members.map((member) => {
      const character = characters.data?.find((item) => item.id === member.character_id);
      return <PlayerStatCard key={member.id} character={character} partyMember={member} campaign={campaign} />;
    })}
  </div>;
}