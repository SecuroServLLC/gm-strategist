import React from 'react';
import { Link } from 'react-router-dom';
import { Swords, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function PlaySessionHeader({ table }) {
  const sessions = table.sessions.data?.pages.flatMap((page) => page.items) || [];
  const suggested = table.suggested.data;
  const options = suggested && !sessions.some((session) => session.id === suggested.id) ? [suggested, ...sessions] : sessions;
  return <header className="mb-6">
    <div className="mb-2 flex items-center gap-3 text-primary"><Swords className="h-6 w-6" /><span className="text-xs uppercase tracking-widest">Spillebordet</span></div>
    <h1 className="font-heading text-4xl">Spill</h1>
    <p className="mb-5 mt-1 text-muted-foreground">Velg tilkoblede spillere, beskriv handlingene og registrer terningkast. Terminalene følger spillet automatisk.</p>
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-4">
      <label htmlFor="play-session" className="flex items-center gap-2 text-sm"><BookOpen className="h-4 w-4" />Aktiv økt</label>
      {table.sessions.isPending || table.suggested.isPending ? <span role="status">Laster økter…</span> : table.sessions.isError || table.suggested.isError ? <Button variant="outline" onClick={() => { table.sessions.refetch(); table.suggested.refetch(); }}>Prøv å laste økter igjen</Button> : !options.length ? <p className="text-sm text-muted-foreground">Ingen økter. <Link to="/sessions" className="text-primary underline">Opprett en økt</Link>.</p> : <select id="play-session" value={table.sessionId} onChange={(event) => table.setSessionId(event.target.value)} className="min-h-11 min-w-0 max-w-full rounded-md border border-input bg-background px-3">{options.map((session) => <option key={session.id} value={session.id}>Økt {session.session_number} · {session.title}</option>)}</select>}
      {table.sessions.hasNextPage && <Button variant="outline" disabled={table.sessions.isFetchingNextPage} onClick={() => table.sessions.fetchNextPage()}>Vis flere økter</Button>}
      {table.sessionId && typeof table.eventCount.data === 'number' && <Badge variant="secondary">{table.eventCount.data} hendelser</Badge>}
      <Link to="/sys" className="ml-auto text-sm text-primary underline">Administrer terminaler</Link>
    </div>
  </header>;
}