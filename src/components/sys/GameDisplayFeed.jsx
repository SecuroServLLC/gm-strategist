import React from 'react';
import { Button } from '@/components/ui/button';

export default function GameDisplayFeed({ title, query, children, moreLabel }) {
  return <section aria-label={title} className="min-h-0 min-w-0 flex flex-col overflow-hidden rounded-xl border border-border bg-card/40">
    <h2 className="shrink-0 border-b border-border px-4 py-3 text-xs uppercase tracking-wider text-muted-foreground">{title}</h2>
    <div className="min-h-0 flex-1 overflow-y-auto scrollbar-thin p-4 [overflow-wrap:anywhere] [&_p]:whitespace-pre-wrap">
      {query.isPending ? <p role="status" className="text-sm text-muted-foreground">Laster…</p> : <>
        {query.isError && <div role="alert" className="mb-3 text-sm text-destructive">Kunne ikke oppdatere visningen. <Button variant="outline" size="sm" onClick={() => query.refetch()}>Prøv igjen</Button></div>}
        {children}
        {query.hasNextPage && <Button className="mt-3 w-full" variant="outline" disabled={query.isFetchingNextPage} onClick={() => query.fetchNextPage()}>{query.isFetchingNextPage ? 'Laster…' : moreLabel}</Button>}
      </>}
    </div>
  </section>;
}