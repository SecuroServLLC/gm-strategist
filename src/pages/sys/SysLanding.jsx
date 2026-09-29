import React, { useCallback, useEffect, useState } from "react";
import { useCampaign } from "@/hooks/useCampaign";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetDescription } from "@/components/ui/sheet";
import { Tablet, Plus, Copy, Trash2, ExternalLink, Monitor, Gamepad2, Loader2 } from "lucide-react";
import { deviceLink, genHex, deviceIdLength } from "@/lib/deviceIds";

const TYPE_META = {
  terminal: { label: "Terminal", icon: Tablet },
  gamedisplay: { label: "Spilledisplay", icon: Monitor },
  game: { label: "Spill", icon: Gamepad2 },
};

export default function SysLanding() {
  const { campaign, loading } = useCampaign();
  const [devices, setDevices] = useState([]);
  const [partyMembers, setPartyMembers] = useState([]);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ device_type: "terminal", label: "", party_member_id: "" });

  const load = useCallback(async () => {
    if (!campaign) return;
    const [d, m] = await Promise.all([
      base44.entities.Device.filter({ campaign_id: campaign.id }),
      base44.entities.PartyMember.filter({ campaign_id: campaign.id }),
    ]);
    setDevices(d);
    setPartyMembers(m);
  }, [campaign]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    setSaving(true);
    try {
      const id = genHex(deviceIdLength(form.device_type));
      const payload = {
        device_id: id,
        device_type: form.device_type,
        label: form.label.trim() || TYPE_META[form.device_type].label,
        campaign_id: campaign.id,
      };
      if (form.device_type === "terminal" && form.party_member_id) {
        payload.party_member_id = form.party_member_id;
      }
      await base44.entities.Device.create(payload);
      setOpen(false);
      setForm({ device_type: "terminal", label: "", party_member_id: "" });
      await load();
    } catch (e) {
      alert("Feil: " + e.message);
    } finally { setSaving(false); }
  };

  const remove = async (d) => {
    if (!confirm(`Slette enhet "${d.label}"?`)) return;
    await base44.entities.Device.delete(d.id);
    await load();
  };

  const copy = (link) => navigator.clipboard?.writeText(window.location.origin + link);

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>;
  }
  if (!campaign) {
    return <div className="h-full flex items-center justify-center text-muted-foreground">Opprett en kampanje først.</div>;
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-3 mb-1">
          <Tablet className="w-5 h-5 text-primary" />
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">System</span>
        </div>
        <div className="flex items-end justify-between gap-4 mb-6">
          <div>
            <h1 className="font-heading text-3xl">Enheter</h1>
            <p className="text-muted-foreground text-sm">Koble nettbrett og skjermer til spillet med permanente lenker.</p>
          </div>
          <Button className="gap-1.5" onClick={() => setOpen(true)}><Plus className="w-4 h-4" /> Ny enhet</Button>
        </div>

        {devices.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-8 text-center text-muted-foreground">
              Ingen enheter registrert. Lag en for å få en deltbar lenke.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {devices.map((d) => {
              const meta = TYPE_META[d.device_type] || TYPE_META.terminal;
              const Icon = meta.icon;
              const link = deviceLink(d.device_type, d.device_id);
              const pm = partyMembers.find((m) => m.id === d.party_member_id);
              return (
                <div key={d.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/40">
                  <div className="w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{d.label}</p>
                      <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">{meta.label}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono truncate">{link}</p>
                    {pm && <p className="text-xs text-muted-foreground">Spiller: {pm.name}</p>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => copy(link)} title="Kopier lenke"><Copy className="w-4 h-4" /></Button>
                    <a href={link} target="_blank" rel="noreferrer">
                      <Button variant="ghost" size="icon" title="Åpne"><ExternalLink className="w-4 h-4" /></Button>
                    </a>
                    <Button variant="ghost" size="icon" onClick={() => remove(d)} title="Slett"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle>Ny enhet</SheetTitle>
            <SheetDescription>Generer en permanent lenke for en nettbrett- eller skjermenhet.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4 mt-4 pr-1">
            <div>
              <Label className="mb-1.5 block">Type</Label>
              <Select value={form.device_type} onValueChange={(v) => setForm((f) => ({ ...f, device_type: v, party_member_id: "" }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="terminal">Terminal – nettbrett (spiller)</SelectItem>
                  <SelectItem value="gamedisplay">Spilledisplay – felles skjerm</SelectItem>
                  <SelectItem value="game">Spill – økt-hub</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Navn (valgfritt)</Label>
              <Input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder={TYPE_META[form.device_type].label} />
            </div>
            {form.device_type === "terminal" && (
              <div>
                <Label className="mb-1.5 block">Koble til følgesvenn (valgfritt)</Label>
                <Select value={form.party_member_id} onValueChange={(v) => setForm((f) => ({ ...f, party_member_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Velg spiller…" /></SelectTrigger>
                  <SelectContent>
                    {partyMembers.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <p className="text-xs text-muted-foreground">ID genereres automatisk ({deviceIdLength(form.device_type)} hex-sifre).</p>
          </div>
          <SheetFooter className="mt-4">
            <Button variant="ghost" onClick={() => setOpen(false)}>Avbryt</Button>
            <Button onClick={create} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Opprett
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}