import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Cloud, MapPin, Compass } from "lucide-react";

const encColor = { combat: "bg-rose-500/20 text-rose-300 border-rose-500/30", social: "bg-sky-500/20 text-sky-300 border-sky-500/30", exploration: "bg-amber-500/20 text-amber-300 border-amber-500/30", hazard: "bg-orange-500/20 text-orange-300 border-orange-500/30" };
const encLabel = { combat: "Kamp", social: "Sosialt", exploration: "Utforsk", hazard: "Fare" };

export default function TravelWeatherCard({ campaign }) {
  const [route, setRoute] = useState("");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  const run = async () => {
    setLoading(true); setErr(null); setData(null);
    try {
      const res = await base44.functions.invoke("travelWeather", { campaign_id: campaign.id, route: route.trim() });
      setData(res.data || res);
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-4">
      <Card className="glass-card">
        <CardContent className="p-5 space-y-3">
          <p className="text-sm text-muted-foreground">Generer vær som påvirker mekanikken (exhaustion, syn, flom som stenger veier) pluss unike hendelser underveis.</p>
          <div>
            <Label className="mb-1.5 block text-sm">Reiserute / region (valgfritt)</Label>
            <Input value={route} onChange={(e) => setRoute(e.target.value)} placeholder="f.eks. «3 dager nordover gjennom Fjellpasset til Klippebyen»" />
          </div>
          <Button className="gap-1.5" onClick={run} disabled={loading}><Sparkles className="w-4 h-4" /> {loading ? "Tenker…" : "Generer vær & reise"}</Button>
        </CardContent>
      </Card>
      {loading && <div className="flex justify-center py-8"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>}
      {err && <p className="text-sm text-destructive">{err}</p>}
      {data?.weather && (
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Cloud className="w-4 h-4 text-primary" /> {data.weather.name}{data.weather.duration && <Badge variant="outline" className="ml-1">{data.weather.duration}</Badge>}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.weather.description && <p className="text-sm text-foreground/90">{data.weather.description}</p>}
            {data.weather.mechanical_effects?.length > 0 && <ul className="list-disc list-inside text-sm space-y-1 text-amber-400/90">{data.weather.mechanical_effects.map((e, i) => <li key={i}>{e}</li>)}</ul>}
          </CardContent>
        </Card>
      )}
      {data?.road_conditions && <Card className="glass-card"><CardContent className="p-4"><p className="text-sm"><span className="text-muted-foreground">Veier &amp; forhold: </span>{data.road_conditions}</p></CardContent></Card>}
      {data?.encounters?.length > 0 && (
        <Card className="glass-card">
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Compass className="w-4 h-4 text-primary" /> Hendelser underveis</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {data.encounters.map((en, i) => (
              <div key={i} className="border border-border rounded-lg p-3">
                <div className="flex items-center justify-between mb-1"><span className="font-medium">{en.title}</span>{en.type && <Badge variant="outline" className={encColor[en.type] || ""}>{encLabel[en.type] || en.type}</Badge>}</div>
                {en.description && <p className="text-sm text-foreground/80">{en.description}</p>}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}