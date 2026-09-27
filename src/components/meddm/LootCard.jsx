import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Gem, Skull } from "lucide-react";

export default function LootCard({ campaign }) {
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  const run = async () => {
    setLoading(true); setErr(null); setData(null);
    try {
      const res = await base44.functions.invoke("lootGenerator", { campaign_id: campaign.id, context: context.trim() });
      setData(res.data || res);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardContent className="p-5 space-y-3">
          <p className="text-sm text-muted-foreground">Generer magiske gjenstander skreddersydd for partiets sammensetning — men med en vri eller en liten forbannelse som skaper historier, ikke bare statistiske oppgraderinger.</p>
          <div>
            <Label className="mb-1.5 block text-sm">Kontekst (valgfritt)</Label>
            <Input value={context} onChange={(e) => setContext(e.target.value)} placeholder="f.eks. «belønning etter bossen i den gamle graven»" />
          </div>
          <Button className="gap-1.5" onClick={run} disabled={loading}><Sparkles className="w-4 h-4" /> {loading ? "Tenker…" : "Generer 3 loot-gjenstander"}</Button>
        </CardContent>
      </Card>
      {loading && <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}
      {err && <p className="text-sm text-destructive">{err}</p>}
      {data?.items?.map((it, i) => (
        <Card key={i} className="glass-card">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg flex items-center gap-2"><Gem className="w-4 h-4 text-primary" /> {it.name}</h3>
              {it.type && <Badge variant="secondary">{it.type}</Badge>}
            </div>
            {it.description && <p className="text-sm text-foreground/80">{it.description}</p>}
            {it.benefit && <p className="text-sm text-emerald-400/90"><span className="opacity-70">Fordel: </span>{it.benefit}</p>}
            {it.twist && <p className="text-sm text-amber-400/90"><span className="opacity-70">Tvi: </span>{it.twist}</p>}
            {it.curse && <p className="text-sm text-rose-400/90 flex items-start gap-1.5"><Skull className="w-3.5 h-3.5 mt-0.5 shrink-0" /><span><span className="opacity-70">Forbannelse: </span>{it.curse}</span></p>}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}