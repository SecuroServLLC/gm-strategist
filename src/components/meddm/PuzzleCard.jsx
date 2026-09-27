import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Puzzle, Lightbulb, AlertTriangle, Key } from "lucide-react";

export default function PuzzleCard({ campaign }) {
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  const run = async () => {
    setLoading(true); setErr(null); setData(null);
    try {
      const res = await base44.functions.invoke("generatePuzzle", { campaign_id: campaign.id, context: context.trim() });
      setData(res.data || res);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardContent className="p-5 space-y-3">
          <p className="text-sm text-muted-foreground">Gåter med flere løsningsmetoder — basert på hva partiet faktisk har i inventaret og hvilke ferdigheter de er gode på.</p>
          <div>
            <Label className="mb-1.5 block text-sm">Kontekst (valgfritt)</Label>
            <Input value={context} onChange={(e) => setContext(e.target.value)} placeholder="f.eks. «forseggjort lås på døren til krypten»" />
          </div>
          <Button className="gap-1.5" onClick={run} disabled={loading}><Sparkles className="w-4 h-4" /> {loading ? "Tenker…" : "Design flernivå-gåte"}</Button>
        </CardContent>
      </Card>
      {loading && <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}
      {err && <p className="text-sm text-destructive">{err}</p>}
      {data && (
        <>
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Puzzle className="w-4 h-4 text-primary" /> {data.title}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {data.premise && <p className="text-sm text-foreground/90">{data.premise}</p>}
              {data.the_puzzle && <p className="text-sm text-foreground/80">{data.the_puzzle}</p>}
            </CardContent>
          </Card>
          {data.solutions?.length > 0 && (
            <Card className="glass-card">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><Key className="w-4 h-4 text-primary" /> Løsningsmetoder</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {data.solutions.map((s, i) => (
                  <div key={i} className="border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1"><span className="font-medium">{s.method}</span>{s.uses && <Badge variant="secondary">{s.uses}</Badge>}</div>
                    {s.how && <p className="text-sm text-foreground/80">{s.how}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.hint && <Card className="glass-card"><CardContent className="p-4"><p className="text-sm text-sky-400/90 flex items-start gap-1.5"><Lightbulb className="w-4 h-4 mt-0.5 shrink-0" /><span><span className="opacity-70">Hint: </span>{data.hint}</span></p></CardContent></Card>}
            {data.failure_consequence && <Card className="glass-card"><CardContent className="p-4"><p className="text-sm text-rose-400/90 flex items-start gap-1.5"><AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" /><span><span className="opacity-70">Ved feil: </span>{data.failure_consequence}</span></p></CardContent></Card>}
          </div>
          {data.twist && <Card className="glass-card border-amber-500/20"><CardContent className="p-4"><p className="text-sm text-amber-400/90"><span className="opacity-70">Tvi: </span>{data.twist}</p></CardContent></Card>}
        </>
      )}
    </div>
  );
}