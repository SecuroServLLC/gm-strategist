import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, RefreshCw } from "lucide-react";

export default function CoDmResult({ result, applied, onApplyFaction, onSaveComplications }) {
  if (result?.error) return <p className="text-sm text-destructive">{result.error}</p>;

  return (
    <div className="space-y-5">
      {result.recap && (
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><RefreshCw className="w-4 h-4 text-primary" /> Analysert økt {result.session_number}: {result.session_title}</CardTitle></CardHeader>
          <CardContent><p className="text-sm text-muted-foreground whitespace-pre-line">{result.recap}</p></CardContent>
        </Card>
      )}

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base">Faksjonsoppdateringer</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {(result.faction_updates || []).length === 0 && <p className="text-sm text-muted-foreground">Ingen foreslåtte endringer.</p>}
          {(result.faction_updates || []).map((u, i) => (
            <div key={i} className="border border-border rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium">{u.name}</span>
                <Badge variant="secondary">{u.status}</Badge>
              </div>
              {u.note && <p className="text-sm text-muted-foreground">{u.note}</p>}
              <Button size="sm" variant="outline" className="mt-2 gap-1.5" disabled={applied["f" + i]} onClick={() => onApplyFaction(u, i)}>
                {applied["f" + i] ? <><Check className="w-3.5 h-3.5" /> Oppdatert</> : "Oppdater fraksjon"}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="glass-card">
        <CardHeader><CardTitle className="text-base">Konsekvenser</CardTitle></CardHeader>
        <CardContent>
          {(result.consequences || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">Ingen konsekvenser foreslått.</p>
          ) : (
            <ul className="list-disc list-inside text-sm space-y-1 text-foreground/90">{result.consequences.map((c, i) => <li key={i}>{c}</li>)}</ul>
          )}
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