import React from 'react';
import { Link } from 'react-router-dom';
import { Image } from '@/components/ui/image';
import { UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ActionActorPicker({ players, selected, lead, onToggle, onLead, disabled }) {
  const actors = players.filter((player) => selected.includes(player.device_id) && player.ready);
  return <fieldset disabled={disabled} className="space-y-3">
    <legend className="mb-2 text-sm font-medium">Hvem deltar i handlingen?</legend>
    {!players.length && <p className="text-sm text-muted-foreground">Ingen terminaler er lagt til i spillet. <Link to="/sys" className="text-primary underline">Åpne Enheter</Link> og slipp inn terminalene først.</p>}
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
      {players.map((player) => <label key={player.device_id} className={cn('min-h-16 flex items-center gap-3 rounded-lg border p-3', !player.ready ? 'border-border opacity-60' : selected.includes(player.device_id) ? 'border-primary bg-primary/10 cursor-pointer' : 'border-border bg-background cursor-pointer')}>
        <input type="checkbox" className="h-5 w-5 accent-primary shrink-0" checked={selected.includes(player.device_id)} disabled={!player.ready} onChange={() => onToggle(player.device_id)} />
        {player.character?.portrait_url ? <Image src={player.character.portrait_url} alt="" className="h-11 w-11 shrink-0 rounded-md" /> : <UserRound className="h-9 w-9 shrink-0 text-muted-foreground" />}
        <span className="min-w-0"><span className="block font-medium break-words">{player.character?.name || 'Velger karakter…'}</span><span className="block text-xs text-muted-foreground">Terminal {player.code}{player.character && !player.ready ? ' · Ikke aktiv' : ''}</span></span>
      </label>)}
    </div>
    {actors.length > 1 && <label className="block text-sm">Hvem utfører handlingen og kaster terningen?
      <select className="mt-1 min-h-11 w-full rounded-md border border-input bg-background px-3" value={lead} onChange={(event) => onLead(event.target.value)}>
        {actors.map((actor) => <option key={actor.device_id} value={actor.device_id}>{actor.character.name}</option>)}
      </select>
    </label>}
  </fieldset>;
}