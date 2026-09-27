import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, User } from "lucide-react";

export default function SchrodingerNpcCard({ campaign }) {
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  const run = async () => {
    setLoading(true); setErr(null); setData(null);
    try {
      const res = await base44.functions.invoke("schrodingerNpc", { campaign_id: campaign.id, context: context.trim() });
      setData(res.data || res);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardContent className="p-5 space-y-3">
          <p className="text-sm text-muted-foreground">Nød-NPC-er du kan slippe inn hvor som helst når spillerne går en helt annen vei enn planlagt.</p>
          <div>
            <Label className="mb-1.5 block text-sm">Hvor er spillerne nå? (valgfritt)</Label>
            <Input value={context} onChange={(e) => setContext(e.target.value)} placeholder="f.eks. «de forlot vertshuset og gikk mot skogen»" />
          </div>
          <Button className="gap-1.5" onClick={run} disabled={loading}><Sparkles className="w-4 h-4" /> {loading ? "Tenker…" : "Generer 3 nød-NPC-er"}</Button>
        </CardContent>
      </Card>
      {loading && <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}
      {err && <p className="text-sm text-destructive">{err}</p>}
      {data?.npcs?.map((n, i) => (
        <Card key={i} className="glass-card">
          <CardContent className="p-4 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-heading text-lg flex items-center gap-2"><User className="w-4 h-4 text-primary" /> {n.name}</h3>
              <div className="flex gap-1.5">{n.race && <Badge variant="secondary">{n.race}</Badge>}{n.role && <Badge variant="outline">{n.role}</Badge>}</div>
            </div>
            {n.appearance && <p className="text-sm text-foreground/80">{n.appearance}</p>}
            <p className="text-sm"><span className="text-muted-foreground">Motivasjon:</span> {n.motivation}</p>
            <p className="text-sm text-amber-400/90"><span className="opacity-70">Hemmelighet:</span> {n.secret}</p>
            <p className="text-sm"><span className="text-muted-foreground">Quirk:</span> {n.quirk}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}