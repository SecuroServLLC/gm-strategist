import React, { useState } from "react";
import { useCampaign } from "@/hooks/useCampaign";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import TemplatePicker from "@/components/autogame/TemplatePicker";
import GenerationProgress from "@/components/autogame/GenerationProgress";
import GenerationSummary from "@/components/autogame/GenerationSummary";

export default function AutoGame() {
  const { campaign, loading } = useCampaign();
  const [story, setStory] = useState("");
  const [template, setTemplate] = useState("medium");
  const [generating, setGenerating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const generate = async () => {
    if (!campaign || !story.trim()) return;
    setGenerating(true); setError("");
    try {
      const res = await base44.functions.invoke("runAutoGame", {
        campaign_id: campaign.id, story, template_id: template,
      });
      if (res.data?.error) throw new Error(res.data.error);
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleEdit = async (message) => {
    if (!campaign || !result?.world_id) return;
    setEditing(true); setError("");
    try {
      const res = await base44.functions.invoke("runAutoGame", {
        campaign_id: campaign.id, edit_message: message, template_id: template, world_id: result.world_id,
      });
      if (res.data?.error) throw new Error(res.data.error);
      const d = res.data;
      setResult(prev => ({
        ...prev,
        characters: [...(prev.characters || []), ...(d.characters || [])],
        maps: [...(prev.maps || []), ...(d.maps || [])],
        story_nodes: [...(prev.story_nodes || []), ...(d.story_nodes || [])],
        items: [...(prev.items || []), ...(d.items || [])],
        steps: d.steps,
      }));
    } catch (e) {
      setError(e.response?.data?.error || e.message);
    } finally {
      setEditing(false);
    }
  };

  const handleDelete = async (type, id) => {
    const entityMap = {
      character: 'Character', map: 'MapItem', story: 'StoryNode', item: 'InventoryItem',
    };
    const entity = entityMap[type];
    if (!entity) return;
    try {
      await base44.entities[entity].delete(id);
      setResult(prev => ({
        ...prev,
        [type === 'map' ? 'maps' : type === 'story' ? 'story_nodes' : type === 'item' ? 'items' : 'characters']:
          (prev[type === 'map' ? 'maps' : type === 'story' ? 'story_nodes' : type === 'item' ? 'items' : 'characters'] || []).filter(x => x.id !== id),
      }));
    } catch (e) {
      setError(e.response?.data?.error || e.message);
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
          <p className="text-muted-foreground mt-1">Skriv rå-historien, velg en mal, så bygger AI-en karakterer, kart, story flow, rød tråd og utstyr — alt i én kjøring.</p>
        </div>

        {/* Input form */}
        <Card className="glass-card mb-6">
          <CardContent className="p-6 space-y-5">
            <div>
              <Label className="text-sm mb-2.5 block">Velg mal</Label>
              <TemplatePicker selected={template} onSelect={setTemplate} />
            </div>
            <div>
              <Label className="text-sm">Rå-historie / narrativ</Label>
              <Textarea
                value={story} onChange={(e) => setStory(e.target.value)} rows={8} className="mt-1.5"
                placeholder="Skriv inn den komplette historien din her. Eksempel: «I en tid der mørket senker seg over Mittverden, må en gruppe helter finne den eldgammel artefakten i slottet på fjellet. De starter i hytten i utkanten av Kongesby, reiser gjennom Nordlandsskogen, og finner tilflukt i kirken i Gamlebyen. Tårnet på neset voktes av en heks, og hulen under klippen skjuler en glemt sivilisasjon...»"
              />
              <p className="text-xs text-muted-foreground mt-1.5">Jo mer detaljert historien er, desto rikere blir den genererte verdenen. Nevn steder, karakterer og konflikter eksplisitt.</p>
            </div>
            <Button onClick={generate} disabled={generating || !story.trim()} className="gap-2 w-full" size="lg">
              {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              {generating ? "Bygger verden…" : "Generer komplett verden"}
            </Button>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
        </Card>

        {/* Progress while generating */}
        {generating && (
          <Card className="glass-card mb-6">
            <CardContent className="p-6">
              <GenerationProgress steps={[]} />
            </CardContent>
          </Card>
        )}

        {/* Summary after generation */}
        {result && !generating && (
          <GenerationSummary
            result={result}
            worldId={result.world_id}
            onEdit={handleEdit}
            onDelete={handleDelete}
            editing={editing}
          />
        )}
      </div>
    </div>
  );
}