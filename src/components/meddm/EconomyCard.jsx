import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Sparkles, Coins, TrendingUp, Scale, AlertTriangle, ScrollText, ArrowRightLeft } from "lucide-react";

function ListBlock({ icon: Icon, title, color, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <div className={`flex items-center gap-1.5 mb-1.5 ${color}`}><Icon className="w-3.5 h-3.5" /><span className="text-xs uppercase tracking-widest font-medium">{title}</span></div>
      <ul className="list-disc list-inside text-sm space-y-1 text-foreground/90 mb-3">{items.map((c, i) => <li key={i}>{c}</li>)}</ul>
    </div>
  );
}

export default function EconomyCard({ campaign }) {
  const [activity, setActivity] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  const run = async () => {
    setLoading(true); setErr(null); setData(null);
    try {
      const res = await base44.functions.invoke("economyCheck", { campaign_id: campaign.id, activity: activity.trim() });
      setData(res.data || res);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardContent className="p-5 space-y-3">
          <p className="text-sm text-muted-foreground">Beskriv den økonomiske aktiviteten — AI-en fungerer som regnskapsfører og regelverks-sjekker for vareflyt, skatter og profitt.</p>
          <div>
            <Label className="mb-1.5 block text-sm">Aktivitet</Label>
            <Textarea rows={3} value={activity} onChange={(e) => setActivity(e.target.value)} placeholder="f.eks. «Partiet kjøper et forlatt vertshus i havnebyen og vil drive det, mens de smugler varer på svartebørsen»" />
          </div>
          <Button className="gap-1.5" onClick={run} disabled={loading || !activity.trim()}><Sparkles className="w-4 h-4" /> {loading ? "Tenker…" : "Analyser økonomi"}</Button>
        </CardContent>
      </Card>
      {loading && <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}
      {err && <p className="text-sm text-destructive">{err}</p>}
      {data && (
        <>
          <Card className="glass-card">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Coins className="w-4 h-4 text-primary" /> Vurdering</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-foreground/90">{data.assessment}</p>
              {data.goods_flow && <p className="text-sm"><span className="text-muted-foreground">Vareflyt: </span>{data.goods_flow}</p>}
              {data.profit && <p className="text-sm text-emerald-400/90"><span className="opacity-70">Profitt: </span>{data.profit}</p>}
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card"><CardContent className="p-4"><ListBlock icon={TrendingUp} title="Inntekter" color="text-emerald-400" items={data.income} /><ListBlock icon={Coins} title="Kostnader" color="text-rose-400" items={data.costs} /></CardContent></Card>
            <Card className="glass-card"><CardContent className="p-4"><ListBlock icon={Scale} title="Skatter & kutt" color="text-amber-400" items={data.taxes} /><ListBlock icon={AlertTriangle} title="Risikoer" color="text-rose-400" items={data.risks} /></CardContent></Card>
          </div>
          {data.rule_notes?.length > 0 && (
            <Card className="glass-card">
              <CardHeader><CardTitle className="text-base flex items-center gap-2"><ScrollText className="w-4 h-4 text-primary" /> Regelnotater</CardTitle></CardHeader>
              <CardContent><ul className="list-disc list-inside text-sm space-y-1 text-foreground/90">{data.rule_notes.map((c, i) => <li key={i}>{c}</li>)}</ul></CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}