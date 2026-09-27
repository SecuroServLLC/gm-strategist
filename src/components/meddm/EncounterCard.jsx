import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Swords, Mountain, Cog, Flag, Skull } from "lucide-react";

export default function EncounterCard({ campaign }) {
  const [concept, setConcept] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  const run = async () => {
    setLoading(true); setErr(null); setData(null);
    try {
      const res = await base44.functions.invoke("dynamicEncounter", { campaign_id: campaign.id, concept: concept.trim() });
      setData(res.data || res);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardContent className="p-5 space-y-3">
          <p className="text-sm text-muted-foreground">Design en kampsituasjon der selve rommet er en trussel — synkende templer, stigende lava, krystaller som bytter skade, is som knekker.</p>
          <div>
            <Label className="mb-1.5 block text-sm">Konsept (valgfritt)</Label>
            <Input value={concept} onChange={(e) => setConcept(e.target.value)} placeholder="f.eks. «et tempel som synker i sumpen mens kampen pågår»" />
          </div>
          <Button className="gap-1.5" onClick={run} disabled={loading}><Sparkles className="w-4 h-4" /> {loading ? "Tenker…" : "Design dynamisk møte"}</Button>
        </CardContent>
      </Card>
      {loading && <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}
      {err && <p className="text-sm text-destructive">{err}</p>}
      {data && (
        <>
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Swords className="w-4 h-4 text-primary" /> {data.title}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-foreground/90">{data.setup}</p>
              {data.terrain?.length > 0 && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5 text-amber-400"><Mountain className="w-3.5 h-3.5" /><span className="text-xs uppercase tracking-widest font-medium">Dynamisk terreng</span></div>
                  <ul className="space-y-1.5">{data.terrain.map((t, i) => (<li key={i} className="text-sm"><span className="font-medium">{t.name}:</span> <span className="text-foreground/80">{t.effect}</span></li>))}</ul>
                </div>
              )}
              {data.escalation && <p className="text-sm text-rose-400/90"><span className="opacity-70">Eskalering: </span>{data.escalation}</p>}
            </CardContent>
          </Card>
          {data.special_mechanics?.length > 0 && <Card className="glass-card"><CardHeader><CardTitle className="text-base flex items-center gap-2"><Cog className="w-4 h-4 text-primary" /> Spesielle mekanikker</CardTitle></CardHeader><CardContent><ul className="list-disc list-inside text-sm space-y-1 text-foreground/90">{data.special_mechanics.map((m, i) => <li key={i}>{m}</li>)}</ul></CardContent></Card>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.enemies?.length > 0 && <Card className="glass-card"><CardHeader><CardTitle className="text-base flex items-center gap-2"><Flag className="w-4 h-4 text-primary" /> Fiender</CardTitle></CardHeader><CardContent><ul className="list-disc list-inside text-sm space-y-1 text-foreground/90">{data.enemies.map((m, i) => <li key={i}>{m}</li>)}</ul></CardContent></Card>}
            {data.gm_tactics?.length > 0 && <Card className="glass-card"><CardHeader><CardTitle className="text-base flex items-center gap-2"><Cog className="w-4 h-4 text-primary" /> GM-taktikk</CardTitle></CardHeader><CardContent><ul className="list-disc list-inside text-sm space-y-1 text-foreground/90">{data.gm_tactics.map((m, i) => <li key={i}>{m}</li>)}</ul></CardContent></Card>}
          </div>
          {data.twist && <Card className="glass-card border-amber-500/20"><CardContent className="p-4"><p className="text-sm text-amber-400/90 flex items-start gap-1.5"><Skull className="w-4 h-4 mt-0.5 shrink-0" /><span><span className="opacity-70">Tvi: </span>{data.twist}</span></p></CardContent></Card>}
        </>
      )}
    </div>
  );
}