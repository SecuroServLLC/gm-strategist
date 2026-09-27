import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Gauge, Coffee, Swords } from "lucide-react";

const tempoLabel = { too_high: "For høyt", too_low: "For lavt", balanced: "Balansert" };
const tempoColor = { too_high: "bg-rose-500/20 text-rose-300 border-rose-500/30", too_low: "bg-sky-500/20 text-sky-300 border-sky-500/30", balanced: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };

export default function PacingCard({ campaign }) {
  const [keywords, setKeywords] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  const run = async () => {
    setLoading(true); setErr(null); setData(null);
    try {
      const res = await base44.functions.invoke("assessPacing", { campaign_id: campaign.id, keywords: keywords.trim() });
      setData(res.data || res);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardContent className="p-5 space-y-3">
          <div>
            <Label className="mb-1.5 block text-sm">Hvordan gikk forrige økt? (stikkord)</Label>
            <Textarea rows={3} value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="f.eks. «mye combat, lite rollespill, spillerne virket slitne, raskt tempo»" />
          </div>
          <Button className="gap-1.5" onClick={run} disabled={loading || !keywords.trim()}><Sparkles className="w-4 h-4" /> {loading ? "Tenker…" : "Vurder tempo"}</Button>
        </CardContent>
      </Card>
      {loading && <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}
      {err && <p className="text-sm text-destructive">{err}</p>}
      {data && (
        <>
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Gauge className="w-4 h-4 text-primary" /> Tempo-vurdering {data.tempo && <Badge variant="outline" className={tempoColor[data.tempo] || ""}>{tempoLabel[data.tempo] || data.tempo}</Badge>}</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-foreground/90">{data.assessment}</p></CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardHeader><CardTitle className="text-base flex items-center gap-2 text-sky-300"><Coffee className="w-4 h-4" /> Rolige øyeblikk</CardTitle></CardHeader>
              <CardContent><ul className="list-disc list-inside text-sm space-y-1 text-foreground/90">{(data.next_balance?.calm || []).map((c, i) => <li key={i}>{c}</li>)}</ul></CardContent>
            </Card>
            <Card className="glass-card">
              <CardHeader><CardTitle className="text-base flex items-center gap-2 text-rose-300"><Swords className="w-4 h-4" /> Action</CardTitle></CardHeader>
              <CardContent><ul className="list-disc list-inside text-sm space-y-1 text-foreground/90">{(data.next_balance?.action || []).map((c, i) => <li key={i}>{c}</li>)}</ul></CardContent>
            </Card>
          </div>
          {data.suggestion && <Card className="glass-card"><CardContent className="p-4"><p className="text-sm text-foreground/90">{data.suggestion}</p></CardContent></Card>}
        </>
      )}
    </div>
  );
}