import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";

export default function AiGmActionForm({ characters, hasMore, loadMore, busy, blocked, onSubmit }) {
  const [action, setAction] = useState('');
  const [characterId, setCharacterId] = useState('');
  const submit = async (event) => {
    event.preventDefault();
    if (await onSubmit({ action: action.trim(), character_id: characterId })) setAction('');
  };
  return <form onSubmit={submit} className="space-y-3 rounded-xl border border-border bg-card p-4">
    <h2 className="font-heading text-2xl">Enter Player Move</h2>
    <p className="text-sm text-muted-foreground">Choose who acted and describe what the player attempted. The Game Master responds and asks for a dice roll when needed.</p>
    <label className="block text-sm">Who is acting?
      <select disabled={busy || blocked} value={characterId} onChange={(e) => setCharacterId(e.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background p-2">
        <option value="">Party / character named in the action</option>
        {characters.map((character) => <option key={character.id} value={character.id}>{character.name}</option>)}
      </select>
    </label>
    {hasMore && <Button type="button" variant="outline" onClick={loadMore} disabled={busy}>Load More Characters</Button>}
    <label className="block text-sm">What did the player attempt?
      <Textarea value={action} onChange={(e) => setAction(e.target.value)} maxLength={2000} disabled={busy || blocked} rows={3} className="mt-1" placeholder="The rogue tries to sneak past the guards while the fighter distracts them." />
    </label>
    <Button disabled={busy || blocked || !action.trim()} type="submit">{busy ? <Loader2 className="animate-spin" /> : <Send />}{busy ? 'Thinking…' : 'Submit Player Move'}</Button>
    <p className="text-xs text-muted-foreground">{blocked ? 'Resolve the pending roll before sending another action.' : 'Describe the player’s move and any equipment used. The Game Master never chooses moves for the players.'}</p>
  </form>;
}