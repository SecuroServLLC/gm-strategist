import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, Link2 } from "lucide-react";

export default function PlayerHooksCard({ campaign }) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  const run = async () => {
    setLoading(true); setErr(null); setData(null);
    try {
      const res = await base44.functions.invoke("playerHooks", { campaign_id: campaign.id });
      setData(res.data || res);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardContent className="p-5 space-y-3">
          <p className="text-sm text-muted-foreground">Koble hver spillers bakhistorie direkte inn i neste økt — tre konkrete koblinger per spiller.</p>
          <Button className="gap-1.5" onClick={run} disabled={loading}><Sparkles className="w-4 h-4" /> {loading ? "Tenker…" : "Generer spillerkroker"}</Button>
        </CardContent>
      </Card>
      {loading && <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}
      {err && <p className="text-sm text-destructive">{err}</p>}
      {data?.hooks?.length === 0 && <p className="text-sm text-muted-foreground">Ingen spillere med bakhistorie funnet. Legg til spillere på <span className="text-primary">Spelarar</span>-siden, eller gi karakterer en bakhistorie.</p>}
      {data?.hooks?.map((h, i) => (
        <Card key={i} className="glass-card">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Link2 className="w-4 h-4 text-primary" /> {h.player}{h.character ? ` — ${h.character}` : ""}</CardTitle></CardHeader>
          <CardContent><ol className="list-decimal list-inside text-sm space-y-1.5 text-foreground/90">{h.connections.map((c, j) => <li key={j}>{c}</li>)}</ol></CardContent>
        </Card>
      ))}
    </div>
  );
}