import React, { useState } from "react";
import { useCampaign } from "@/hooks/useCampaign";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Globe, Wand2 } from "lucide-react";
import WorldTreeViewer from "@/components/autogame/WorldTreeViewer";
import ToDoBadge from "@/components/ToDoBadge";

export default function AutoGame() {
  const { campaign, loading } = useCampaign();
  const [story, setStory] = useState("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const generate = async () => {
    if (!campaign || !story.trim()) return;
    setGenerating(true); setError(""); setResult(null);
    try {
      const res = await base44.functions.invoke("generateAutoGame", { campaign_id: campaign.id, story });
      if (res.data?.error) throw new Error(res.data.error);
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (!campaign) return <div className="p-8 text-center text-muted-foreground">Velg en kampanje først.</div>;

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-0.5">
            <Wand2 className="w-4 h-4 text-primary" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">AutoGame</span>
          </div>
          <h1 className="font-heading text-4xl">Hurtiggenerering av verden</h1>
          <p className="text-muted-foreground mt-1">Skriv inn rå-historien din, så bygger AI-en en komplett hierarkisk kartstruktur automatisk.</p>
        </div>

        <Card className="glass-card mb-6">
          <CardContent className="p-6 space-y-4">
            <div>
              <Label className="text-sm">Rå-historie / narrativ</Label>
              <Textarea
                value={story} onChange={(e) => setStory(e.target.value)} rows={8} className="mt-1.5"
                placeholder="Skriv inn den komplette historien din her. Eksempel: «I en tid der mørket senker seg over Mittverden, må en gruppe helter finne den eldgammel artefakten i slottet på fjellet. De starter i hytten i utkanten av Kongesby, reiser gjennom Nordlandsskogen, og finner tilflukt i kirken i Gamlebyen. Tårnet på neset voktes av en heks, og hulen under klippen skjuler en glemt sivilisasjon...»"
              />
              <p className="text-xs text-muted-foreground mt-1.5">Jo mer detaljert historien er, desto rikere blir den genererte verdenen. Nevn steder, bygninger og POI-er eksplisitt.</p>
            </div>
            <Button onClick={generate} disabled={generating || !story.trim()} className="gap-2 w-full">
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {generating ? "Genererer verden…" : "Generer komplett verden"}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <Globe className="w-5 h-5 text-primary" />
              <h2 className="font-heading text-2xl">{result.title}</h2>
              <Badge variant="outline" className="ml-auto">{result.node_count} noder</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{result.summary}</p>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Hierarkisk struktur (Zelda Twilight Princess-modell)</span>
              <ToDoBadge>Kartvisualisering & rom-innhold</ToDoBadge>
            </div>
            <Card className="glass-card">
              <CardContent className="p-4">
                <WorldTreeViewer worldId={result.world_id} onSelect={setSelectedNode} selectedId={selectedNode?.id} />
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}