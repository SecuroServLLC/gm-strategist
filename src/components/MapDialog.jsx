import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, Save, Upload, Wand2, Map as MapIcon } from "lucide-react";

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

export default function MapDialog({ open, onOpenChange, map, campaignId, setting, onSaved }) {
  const [form, setForm] = useState(EMPTY);
  const [prompt, setPrompt] = useState("");
  const [withSketch, setWithSketch] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [landmarksText, setLandmarksText] = useState("");

  useEffect(() => {
    if (map) {
      setForm({ ...EMPTY, ...map, landmarks: map.landmarks || [] });
      setLandmarksText((map.landmarks || []).join("\n"));
      setPrompt("");
    } else {
      setForm(EMPTY);
      setLandmarksText("");
    }
  }, [map, open]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const generate = async () => {
    if (!prompt.trim()) return;
    setGenerating(true);
    try {
      const res = await base44.functions.invoke("generateMapConcept", { prompt, setting, withSketch });
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
    setSaving(true);
    try {
      const payload = {
        campaign_id: campaignId,
        title: form.title.trim() || "Uten tittel",
        location_type: form.location_type,
        description: form.description,
        location_notes: form.location_notes,
        landmarks: landmarksText.split("\n").map((s) => s.trim()).filter(Boolean),
        connections: form.connections,
        sketch_url: form.sketch_url,
      };
      if (map) {
        await base44.entities.MapItem.update(map.id, payload);
      } else {
        await base44.entities.MapItem.create(payload);
      }
      onSaved();
      onOpenChange(false);
    } catch (e) {
      alert("Lagring feilet: " + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[92vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-heading text-xl flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            {map ? "Rediger kart" : "Nytt kart"}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1">
          <div className="space-y-5 pr-2 pb-2">
            <div className="rounded-xl border border-primary/25 bg-accent/30 p-4 space-y-3">
              <Label className="text-sm flex items-center gap-1.5 text-primary"><Sparkles className="w-4 h-4" /> Beskriv lokasjonen</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={2}
                placeholder="f.eks. 'En forlatt fjellfestning med en underjordisk elv og en forgjort gravplass'"
              />
              <div className="flex items-center justify-between flex-wrap gap-3">
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <Switch checked={withSketch} onCheckedChange={setWithSketch} />
                  Generer referanseskisse
                </label>
                <Button onClick={generate} disabled={generating || !prompt.trim()} className="gap-2">
                  {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {generating ? "Genererer..." : "Generer konsept"}
                </Button>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-40 h-40 rounded-xl overflow-hidden bg-accent/40 border border-border shrink-0 flex items-center justify-center">
                {form.sketch_url ? (
                  <Image src={form.sketch_url} fittingType="fill" className="w-full h-full" />
                ) : (
                  <div className="flex flex-col items-center gap-1 text-muted-foreground/50">
                    <MapIcon className="w-8 h-8" />
                    <span className="text-[10px]">Ingen skisse</span>
                  </div>
                )}
              </div>
              <div className="flex-1 flex flex-col justify-center gap-2">
                <Label className="text-xs">Last opp eget kart (Inkarnate e.l.)</Label>
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer text-primary hover:underline">
                  <Upload className="w-4 h-4" /> Velg bilde
                  <input type="file" accept="image/*" className="hidden" onChange={onUpload} />
                </label>
              </div>
            </div>

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
              <Textarea value={form.location_notes} onChange={(e) => set("location_notes", e.target.value)} rows={3} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Koblinger i verdenen</Label>
              <Textarea value={form.connections} onChange={(e) => set("connections", e.target.value)} rows={2} className="mt-1" />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="border-t border-border pt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Avbryt</Button>
          <Button onClick={save} disabled={saving} className="gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {map ? "Lagre" : "Opprett kart"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}