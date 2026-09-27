import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, RefreshCw, Eye, Landmark, Coins, Swords, Hourglass } from "lucide-react";

function PowerBar({ power, delta }) {
  const p = Math.max(0, Math.min(100, power || 0));
  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-0.5">
        <span>Makt</span>
        <span>{power ?? "?"}/100 {typeof delta === "number" && delta !== 0 && <span className={delta > 0 ? "text-emerald-400" : "text-rose-400"}>({delta > 0 ? "+" : ""}{delta})</span>}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-primary transition-all" style={{ width: `${p}%` }} /></div>
    </div>
  );
}

function ListBlock({ icon: Icon, title, color, items }) {
  if (!items || items.length === 0) return null;
  return (
    <div>
      <div className={`flex items-center gap-1.5 mb-1.5 ${color}`}><Icon className="w-3.5 h-3.5" /><span className="text-xs uppercase tracking-widest font-medium">{title}</span></div>
      <ul className="list-disc list-inside text-sm space-y-1 text-foreground/90 mb-3">{items.map((c, i) => <li key={i}>{c}</li>)}</ul>
    </div>
  );
}

export default function CoDmResult({ result, applied, onApplyFaction, onApplyNpc, onSaveComplications }) {
  if (result?.error) return <p className="text-sm text-destructive">{result.error}</p>;
  const ripple = result.ripple || {};

  return (
    <div className="space-y-5">
      {result.happening && (
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><RefreshCw className="w-4 h-4 text-primary" /> Det som skjedde</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground whitespace-pre-line">{result.happening}</p></CardContent>
        </Card>
      )}

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base">Faksjons- &amp; maktmatrise</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(result.faction_updates || []).length === 0 && <p className="text-sm text-muted-foreground">Ingen fraksjonsendringer foreslått.</p>}
          {(result.faction_updates || []).map((u, i) => (
            <div key={i} className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{u.name}</span>
                {u.status && <Badge variant="secondary">{u.status}</Badge>}
              </div>
              <PowerBar power={u.power} delta={u.power_delta} />
              {u.activity && <p className="text-sm text-foreground/80 mt-2"><span className="text-muted-foreground">Gjør i bakgrunnen:</span> {u.activity}</p>}
              {u.agenda_note && <p className="text-xs text-amber-400/80 mt-1"><span className="opacity-70">Skjult agenda:</span> {u.agenda_note}</p>}
              <Button size="sm" variant="outline" className="mt-2 gap-1.5" disabled={applied["f" + i]} onClick={() => onApplyFaction(u, i)}>
                {applied["f" + i] ? <><Check className="w-3.5 h-3.5" /> Oppdatert</> : "Oppdater fraksjon"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base">Ripple-effekt — konsekvenser</CardTitle></CardHeader>
        <CardContent>
          <ListBlock icon={Landmark} title="Politiske" color="text-sky-400" items={ripple.political} />
          <ListBlock icon={Coins} title="Økonomiske" color="text-emerald-400" items={ripple.economic} />
          <ListBlock icon={Swords} title="Hevnaksjoner" color="text-rose-400" items={ripple.revenge} />
          <ListBlock icon={Hourglass} title="Langsiktige" color="text-amber-400" items={ripple.long_term} />
          {!ripple.political?.length && !ripple.economic?.length && !ripple.revenge?.length && !ripple.long_term?.length && <p className="text-sm text-muted-foreground">Ingen konsekvenser foreslått.</p>}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Eye className="w-4 h-4 text-primary" /> Hemmelige NPC-agendaer</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(result.npc_agendas || []).length === 0 && <p className="text-sm text-muted-foreground">Ingen agenda-oppdateringer foreslått.</p>}
          {(result.npc_agendas || []).map((ag, i) => (
            <div key={i} className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{ag.name}</span>
              </div>
              {ag.agenda && <p className="text-sm text-foreground/90"><span className="text-amber-400/80">Ny skjult agenda:</span> {ag.agenda}</p>}
              {ag.note && <p className="text-xs text-muted-foreground mt-1">{ag.note}</p>}
              <Button size="sm" variant="outline" className="mt-2 gap-1.5" disabled={applied["n" + i]} onClick={() => onApplyNpc(ag, i)}>
                {applied["n" + i] ? <><Check className="w-3.5 h-3.5" /> Oppdatert</> : "Oppdater NPC"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-card border-amber-500/20">
        <CardHeader><CardTitle className="text-base flex items-center gap-2 text-amber-400"><Sparkles className="w-4 h-4" /> Tre komplikasjoner</CardTitle></CardHeader>
        <CardContent>
          {(result.complications || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen komplikasjoner foreslått.</p>
          ) : (
            <>
              <ul className="list-decimal list-inside text-sm space-y-2 text-foreground/90">{result.complications.map((c, i) => <li key={i}>{c}</li>)}</ul>
              <Button size="sm" className="mt-3 gap-1.5" disabled={applied.complications} onClick={onSaveComplications}>
                {applied.complications ? <><Check className="w-3.5 h-3.5" /> Lagret til neste økt</> : "Lagre til neste økt"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}