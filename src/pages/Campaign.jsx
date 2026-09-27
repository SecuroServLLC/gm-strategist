import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCampaign } from "@/hooks/useCampaign";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollText, Save, Lightbulb, Ban, Sparkles } from "lucide-react";

export default function Campaign() {
  const { campaign, loading, refresh } = useCampaign();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (campaign) {
      setForm({
        title: campaign.title || "",
        premise: campaign.premise || "",
        setting: campaign.setting || "",
        tone: campaign.tone || "",
        status: campaign.status || "draft",
        themes: (campaign.themes || []).join("\n"),
        hints: (campaign.hints || []).join("\n"),
        constraints: (campaign.constraints || []).join("\n"),
      });
    } else if (!loading) {
      setForm({ title: "", premise: "", setting: "", tone: "", status: "draft", themes: "", hints: "", constraints: "" });
    }
  }, [campaign, loading]);

  if (loading || !form) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim() || "Uten tittel",
        premise: form.premise.trim(),
        setting: form.setting.trim(),
        tone: form.tone.trim(),
        status: form.status,
        themes: form.themes.split("\n").map((s) => s.trim()).filter(Boolean),
        hints: form.hints.split("\n").map((s) => s.trim()).filter(Boolean),
        constraints: form.constraints.split("\n").map((s) => s.trim()).filter(Boolean),
      };
      if (campaign) {
        await base44.entities.Campaign.update(campaign.id, payload);
      } else {
        await base44.entities.Campaign.create(payload);
      }
      await refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-3xl mx-auto px-8 py-10">
        <div className="flex items-center gap-2 mb-1">
          <ScrollText className="w-5 h-5 text-primary" />
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Rød tråd</span>
        </div>
        <h1 className="font-heading text-4xl mb-1">Hovedfortelling</h1>
        <p className="text-muted-foreground mb-8">Den røde tråden som binder hele kampanjen sammen – med hint og begrensninger.</p>

        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium">Kampanjens tittel</Label>
            <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="f.eks. Skygger over Eldoria" className="mt-1.5 font-heading text-lg h-12" />
          </div>

          <div>
            <Label className="text-sm font-medium">Premiss – den røde tråden</Label>
            <Textarea value={form.premise} onChange={(e) => set("premise", e.target.value)} rows={6} placeholder="Hva er hovedfortellingen? Hva står på spill? Hvor bærer det?" className="mt-1.5" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <Label className="text-sm font-medium">Verden / setting</Label>
              <Textarea value={form.setting} onChange={(e) => set("setting", e.target.value)} rows={3} placeholder="Tidsalder, geografi, stemning..." className="mt-1.5" />
            </div>
            <div>
              <Label className="text-sm font-medium">Tone</Label>
              <Input value={form.tone} onChange={(e) => set("tone", e.target.value)} placeholder="Mørk, episk, tragisk..." className="mt-1.5" />
            </div>
          </div>

          <div>
            <Label className="text-sm font-medium">Status</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Utkast</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="complete">Fullført</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="glass-card">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-primary">
                <Sparkles className="w-4 h-4" />
                <h3 className="font-heading text-lg">Temaer</h3>
              </div>
              <p className="text-sm text-muted-foreground -mt-2">Ett per linje.</p>
              <Textarea value={form.themes} onChange={(e) => set("themes", e.target.value)} rows={3} placeholder={"Makt og korrupsjon\nLengsel etter hjem\n..."}/>
            </CardContent>
          </Card>

          <Card className="glass-card border-amber-500/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-400">
                <Lightbulb className="w-4 h-4" />
                <h3 className="font-heading text-lg">Hint som skal sås</h3>
              </div>
              <p className="text-sm text-muted-foreground -mt-2">Hint GM bør legge inn underveis. Ett per linje.</p>
              <Textarea value={form.hints} onChange={(e) => set("hints", e.target.value)} rows={4} placeholder={"En brevdue med ulest segl\nRykte om en dør i fjellet\n..."}/>
            </CardContent>
          </Card>

          <Card className="glass-card border-rose-500/20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-400">
                <Ban className="w-4 h-4" />
                <h3 className="font-heading text-lg">Begrensninger – nekt</h3>
              </div>
              <p className="text-sm text-muted-foreground -mt-2">Hva GM bør unngå eller forby. Ett per linje.</p>
              <Textarea value={form.constraints} onChange={(e) => set("constraints", e.target.value)} rows={4} placeholder={"Ikke avslør skurken før akt 3\nUnngå reiser over 3 dager\n..."}/>
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-3 pt-2 pb-10">
            <Button variant="ghost" onClick={() => navigate("/")}>Avbryt</Button>
            <Button onClick={save} disabled={saving} className="gap-2">
              <Save className="w-4 h-4" /> {saving ? "Lagrer..." : campaign ? "Lagre endringer" : "Opprett kampanje"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}