import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCampaign } from "@/hooks/useCampaign";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cog, Save } from "lucide-react";
import AttributeList from "@/components/system/AttributeList";
import SkillList from "@/components/system/SkillList";
import DiceConfigForm from "@/components/system/DiceConfigForm";
import ModeList from "@/components/system/ModeList";

export default function System() {
  const { campaign, loading, refresh } = useCampaign();
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (campaign) {
      setForm({
        attributes: campaign.attributes || [],
        skills: campaign.skills || [],
        dice_config: campaign.dice_config || {},
        modes: campaign.modes || [],
      });
    }
  }, [campaign]);

  if (loading || !form) {
    return (<div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>);
  }
  if (!campaign) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Cog className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="mb-4">Du treng ei kampanje først.</p>
          <Link to="/"><Button variant="outline">Til kampanjane</Button></Link>
        </div>
      </div>
    );
  }

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const save = async () => {
    setSaving(true);
    try {
      await base44.entities.Campaign.update(campaign.id, {
        attributes: form.attributes,
        skills: form.skills,
        dice_config: form.dice_config,
        modes: form.modes,
      });
      await refresh();
    } finally { setSaving(false); }
  };

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-3xl mx-auto px-8 py-10 space-y-6">
        <div className="flex items-center gap-3 mb-2"><Cog className="w-6 h-6 text-primary" /><span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Regelverk</span></div>
        <h1 className="font-heading text-4xl mb-1">System</h1>
        <p className="text-muted-foreground text-lg">Eigendefinerte attributtar, ferdigheter, terningmekanikk og modusar – heile regelverket for denne kampanjen.</p>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Attributtar</CardTitle></CardHeader>
          <CardContent><AttributeList value={form.attributes} onChange={(v) => set("attributes", v)} /></CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Ferdigheter</CardTitle></CardHeader>
          <CardContent><SkillList value={form.skills} onChange={(v) => set("skills", v)} attributes={form.attributes} /></CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Terningmekanikk</CardTitle></CardHeader>
          <CardContent><DiceConfigForm value={form.dice_config} onChange={(v) => set("dice_config", v)} /></CardContent>
        </Card>

        <Card className="glass-card">
          <CardHeader><CardTitle className="text-lg">Spillemodusar</CardTitle></CardHeader>
          <CardContent><ModeList value={form.modes} onChange={(v) => set("modes", v)} /></CardContent>
        </Card>

        <div className="flex justify-end pb-10">
          <Button onClick={save} disabled={saving} className="gap-1.5"><Save className="w-4 h-4" /> {saving ? "Lagrar…" : "Lagre system"}</Button>
        </div>
      </div>
    </div>
  );
}