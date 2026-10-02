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
    <label className="block text-sm">Acting character
      <select disabled={busy || blocked} value={characterId} onChange={(e) => setCharacterId(e.target.value)} className="mt-1 block w-full rounded-md border border-input bg-background p-2">
        <option value="">Party / character named in the action</option>
        {characters.map((character) => <option key={character.id} value={character.id}>{character.name}</option>)}
      </select>
    </label>
    {hasMore && <Button type="button" variant="outline" onClick={loadMore} disabled={busy}>Load More Characters</Button>}
    <label className="block text-sm">What do you do?
      <Textarea value={action} onChange={(e) => setAction(e.target.value)} maxLength={2000} disabled={busy || blocked} rows={3} className="mt-1" placeholder="Bob Bombe sprenger en dør. Han bruker en bombe fra utstyret sitt." />
    </label>
    <Button disabled={busy || blocked || !action.trim()} type="submit">{busy ? <Loader2 className="animate-spin" /> : <Send />}{busy ? 'Thinking…' : 'Send Action'}</Button>
    <p className="text-xs text-muted-foreground">{blocked ? 'Resolve the pending roll before sending another action.' : 'Describe your actual action and equipment. The Game Master never chooses your next move.'}</p>
  </form>;
}