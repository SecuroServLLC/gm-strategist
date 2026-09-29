import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCampaign } from "@/hooks/useCampaign";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Loader2, Save, Upload, Wand2, Map as MapIcon, ArrowLeft, ScrollText } from "lucide-react";

const TYPES = [
  { value: "city", label: "By" },
  { value: "dungeon", label: "Grotte" },
  { value: "wilderness", label: "Villmark" },
  { value: "tavern", label: "Vertshus" },
  { value: "temple", label: "Tempel" },
  { value: "fortress", label: "Festning" },
  { value: "ruins", label: "Ruiner" },
  { value: "region", label: "Region" },
  { value: "other", label: "Annet" },
];

const EMPTY = { title: "", location_type: "other", description: "", location_notes: "", landmarks: [], connections: "", sketch_url: "" };

export default function MapDetail() {
  const { mapId } = useParams();
  const navigate = useNavigate();
  const { campaign, loading } = useCampaign();
  const isNew = mapId === "new";

  const [form, setForm] = useState(EMPTY);
  const [prompt, setPrompt] = useState("");
  const [withSketch, setWithSketch] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loadingMap, setLoadingMap] = useState(!isNew);
  const [landmarksText, setLandmarksText] = useState("");

  useEffect(() => {
    if (isNew || !campaign) return;
    let active = true;
    (async () => {
      setLoadingMap(true);
      try {
        const m = await base44.entities.MapItem.get(mapId);
        if (!active) return;
        setForm({ ...EMPTY, ...m, landmarks: m.landmarks || [] });
        setLandmarksText((m.landmarks || []).join("\n"));
      } finally {
        if (active) setLoadingMap(false);
      }
    })();
    return () => { active = false; };
  }, [mapId, isNew, campaign]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("generateMapConcept", { prompt, setting: campaign?.setting, withSketch });
      const d = res.data;
      if (d) {
        setForm((f) => ({
          ...EMPTY,
          title: d.title || "",
          location_type: d.location_type || "other",
          description: d.description || "",
          location_notes: d.location_notes || "",
          connections: d.connections || "",
          landmarks: d.landmarks || [],
          sketch_url: d.sketch_url || f.sketch_url,
        }));
        setLandmarksText((d.landmarks || []).join("\n"));
      }
    } catch (e) {
      alert("Kunne ikke generere: " + e.message);
    } finally {
      setGenerating(false);
    }
  };

  const onUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadPublicFile({ file });
      set("sketch_url", file_url);
    } catch (err) {
      alert("Opplasting feilet: " + err.message);
    }
  };

  const save = async () => {
    if (!campaign) return;
    setSaving(true);
    try {
      const payload = {
        campaign_id: campaign.id,
        title: form.title.trim() || "Uten tittel",
        location_type: form.location_type,
        description: form.description,
        location_notes: form.location_notes,
        landmarks: landmarksText.split("\n").map((s) => s.trim()).filter(Boolean),
        connections: form.connections,
        sketch_url: form.sketch_url,
      };
      if (isNew) {
        const created = await base44.entities.MapItem.create(payload);
        navigate("/maps");
      } else {
        await base44.entities.MapItem.update(mapId, payload);
        navigate("/maps");
      }
    } catch (e) {
      alert("Lagring feilet: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !campaign) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isNew && loadingMap) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-5xl mx-auto px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/maps"><ArrowLeft className="w-4 h-4" /></Link>
          </Button>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            <MapIcon className="w-4 h-4 text-primary" /> Kart
          </div>
        </div>

        <h1 className="font-heading text-4xl mb-6 flex items-center gap-2">
          <Wand2 className="w-6 h-6 text-primary" />
          {isNew ? "Nytt kart" : "Rediger kart"}
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Venstre: skisse + generering */}
          <div className="space-y-5">
            <div className="rounded-xl border border-border bg-accent/30 overflow-hidden">
              <div className="aspect-square w-full bg-accent/40 flex items-center justify-center">
                {form.sketch_url ? (
                  <Image src={form.sketch_url} fittingType="fill" className="w-full h-full" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground/50">
                    <MapIcon className="w-12 h-12" />
                    <span className="text-sm">Ingen skisse</span>
                  </div>
                )}
              </div>
            </div>

            <Card className="glass-card">
              <CardContent className="p-4 space-y-3">
                <Label className="text-sm flex items-center gap-1.5 text-primary">
                  <Sparkles className="w-4 h-4" /> Generer konsept
                </Label>
                <Textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={2}
                  placeholder="f.eks. 'En forlatt fjellfestning med en underjordisk elv og en forgjort gravplass'"
                />
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                    <Switch checked={withSketch} onCheckedChange={setWithSketch} />
                    Referanseskisse
                  </label>
                  <Button onClick={generate} disabled={generating || !prompt.trim()} className="gap-2">
                    {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {generating ? "Genererer..." : "Generer"}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div>
              <Label className="text-xs">Last opp eget kart (Inkarnate e.l.)</Label>
              <label className="mt-1 inline-flex items-center gap-2 text-sm cursor-pointer text-primary hover:underline">
                <Upload className="w-4 h-4" /> Velg bilde
                <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
              </label>
            </div>
          </div>

          {/* Høyre: skjema */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Tittel</Label>
                <Input value={form.title} onChange={(e) => set("title", e.target.value)} className="mt-1" />
              </div>
              <div>
                <Label className="text-xs">Type</Label>
                <Select value={form.location_type} onValueChange={(v) => set("location_type", v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label className="text-xs">Beskrivelse</Label>
              <Textarea value={form.description} onChange={(e) => set("description", e.target.value)} rows={3} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Landemerker (én per linje)</Label>
              <Textarea value={landmarksText} onChange={(e) => setLandmarksText(e.target.value)} rows={4} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">GM-notater (farer, NPCer, hemmeligheter)</Label>
              <Textarea value={form.location_notes} onChange={(e) => set("location_notes", e.target.value)} rows={4} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Koblinger i verdenen</Label>
              <Textarea value={form.connections} onChange={(e) => set("connections", e.target.value)} rows={2} className="mt-1" />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <Button variant="ghost" asChild><Link to="/maps">Avbryt</Link></Button>
              <Button onClick={save} disabled={saving} className="gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isNew ? "Opprett kart" : "Lagre"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}