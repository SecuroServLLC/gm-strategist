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
import { Tablet, Plus, Copy, Trash2, ExternalLink, Monitor, Gamepad2, Loader2, LogIn, UserPlus } from "lucide-react";
import { deviceLink, genDeviceId } from "@/lib/deviceIds";

const TYPE_META = {
  terminal: { label: "Terminal", icon: Tablet },
  gamedisplay: { label: "Spilledisplay", icon: Monitor },
  game: { label: "Spill", icon: Gamepad2 },
};

const isActive = (d) => d.status === "active" || (!d.status && !!d.campaign_id);

export default function SysLanding() {
  const { campaign, loading } = useCampaign();
  const [devices, setDevices] = useState([]);
  const [partyMembers, setPartyMembers] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [admitTarget, setAdmitTarget] = useState(null);
  const [admitPm, setAdmitPm] = useState("");
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ device_type: "terminal", label: "" });

  const load = useCallback(async () => {
    const [d, m] = await Promise.all([
      base44.entities.Device.list("-created_date", 200),
      campaign ? base44.entities.PartyMember.filter({ campaign_id: campaign.id }) : Promise.resolve([]),
    ]);
    setDevices(d);
    setPartyMembers(m);
  }, [campaign]);

  useEffect(() => { load(); }, [load]);

  const create = async () => {
    setSaving(true);
    try {
      const id = genDeviceId(form.device_type);
      const payload = {
        device_id: id,
        device_type: form.device_type,
        label: form.label.trim() || TYPE_META[form.device_type].label,
      };
      if (form.device_type === "terminal") {
        payload.status = "pending";
      } else {
        if (!campaign) { alert("Opprett en kampanje først."); return; }
        payload.status = "active";
        payload.campaign_id = campaign.id;
      }
      await base44.entities.Device.create(payload);
      setCreateOpen(false);
      setForm({ device_type: "terminal", label: "" });
      await load();
    } catch (e) {
      alert("Feil: " + e.message);
    } finally { setSaving(false); }
  };

  const admit = async () => {
    if (!admitTarget || !campaign) return;
    setSaving(true);
    try {
      await base44.entities.Device.update(admitTarget.id, {
        status: "active",
        campaign_id: campaign.id,
        party_member_id: admitPm || null,
      });
      setAdmitTarget(null);
      setAdmitPm("");
      await load();
    } catch (e) {
      alert("Feil: " + e.message);
    } finally { setSaving(false); }
  };

  const unlink = async (d) => {
    if (!confirm("Sett enheten tilbake til venting?")) return;
    await base44.entities.Device.update(d.id, { status: "pending", campaign_id: null, party_member_id: null });
    await load();
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

  const pending = devices.filter((d) => d.device_type === "terminal" && !isActive(d));
  const active = devices.filter(isActive);

  const Row = ({ d, children }) => {
    const meta = TYPE_META[d.device_type] || TYPE_META.terminal;
    const Icon = meta.icon;
    const link = deviceLink(d.device_type, d.device_id);
    return (
      <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card/40">
        <div className="w-10 h-10 rounded-lg bg-accent/50 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium truncate">{d.label}</p>
            <Badge variant="outline" className="border-primary/40 text-primary text-[10px]">{meta.label}</Badge>
            {d.device_type === "terminal" && (
              <span className="font-mono text-sm tracking-widest text-foreground/90 bg-accent/60 border border-border rounded px-2 py-0.5">{d.device_id}</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground font-mono truncate">{link}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {children}
          <Button variant="ghost" size="icon" onClick={() => copy(link)} title="Kopier lenke"><Copy className="w-4 h-4" /></Button>
          <a href={link} target="_blank" rel="noreferrer"><Button variant="ghost" size="icon" title="Åpne"><ExternalLink className="w-4 h-4" /></Button></a>
          <Button variant="ghost" size="icon" onClick={() => remove(d)} title="Slett"><Trash2 className="w-4 h-4 text-destructive" /></Button>
        </div>
      </div>
    );
  };

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
            <p className="text-muted-foreground text-sm">Admin styrer alt. Lag terminaler og slipp spillere inn.</p>
          </div>
          <Button className="gap-1.5" onClick={() => setCreateOpen(true)}><Plus className="w-4 h-4" /> Ny enhet</Button>
        </div>

        {pending.length > 0 && (
          <div className="mb-6">
            <h2 className="font-heading text-lg mb-2 flex items-center gap-2"><LogIn className="w-4 h-4 text-amber-400" /> Venter på godkjenning ({pending.length})</h2>
            <div className="space-y-2">
              {pending.map((d) => (
                <Row key={d.id} d={d}>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={() => { setAdmitTarget(d); setAdmitPm(""); }}>
                    <UserPlus className="w-3.5 h-3.5" /> Slipp inn
                  </Button>
                </Row>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="font-heading text-lg mb-2">Aktive enheter ({active.length})</h2>
          {active.length === 0 ? (
            <Card className="glass-card"><CardContent className="p-8 text-center text-muted-foreground">Ingen aktive enheter. Lag en terminal og slipp inn en spiller.</CardContent></Card>
          ) : (
            <div className="space-y-2">
              {active.map((d) => {
                const pm = partyMembers.find((m) => m.id === d.party_member_id);
                return (
                  <Row key={d.id} d={d}>
                    {pm && <span className="text-xs text-muted-foreground hidden sm:inline mr-1">{pm.name}</span>}
                    {d.device_type === "terminal" && (
                      <Button variant="ghost" size="sm" onClick={() => unlink(d)} title="Tilbake til venting">Koble fra</Button>
                    )}
                  </Row>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle>Ny enhet</SheetTitle>
            <SheetDescription>Terminaler starter som ventende. Skjermer blir aktive med en gang.</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4 mt-4 pr-1">
            <div>
              <Label className="mb-1.5 block">Type</Label>
              <Select value={form.device_type} onValueChange={(v) => setForm((f) => ({ ...f, device_type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="terminal">Terminal – spillernettbrett</SelectItem>
                  <SelectItem value="gamedisplay">Spilledisplay – felles skjerm</SelectItem>
                  <SelectItem value="game">Spill – økt-hub</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block">Navn (valgfritt)</Label>
              <Input value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} placeholder={TYPE_META[form.device_type].label} />
            </div>
            <p className="text-xs text-muted-foreground">
              {form.device_type === "terminal"
                ? "Terminalen får en 4-tegns kode og vises i ventelisten til du slipper den inn."
                : "Skjermen blir aktiv umiddelbart med 16 hex-sifre."}
            </p>
          </div>
          <SheetFooter className="mt-4">
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>Avbryt</Button>
            <Button onClick={create} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Opprett
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet open={!!admitTarget} onOpenChange={(o) => !o && setAdmitTarget(null)}>
        <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
          <SheetHeader>
            <SheetTitle>Slipp inn terminal</SheetTitle>
            <SheetDescription>Koble til en følgesvenn i «{campaign?.title}».</SheetDescription>
          </SheetHeader>
          <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4 mt-4 pr-1">
            <div className="text-center py-4">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Kode</p>
              <p className="font-mono text-4xl tracking-[0.3em]">{admitTarget?.device_id}</p>
            </div>
            <div>
              <Label className="mb-1.5 block">Følgesvenn (valgfritt)</Label>
              <Select value={admitPm} onValueChange={setAdmitPm}>
                <SelectTrigger><SelectValue placeholder="Velg spiller…" /></SelectTrigger>
                <SelectContent>
                  {partyMembers.map((m) => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-2">La stå tomt for en generell terminal.</p>
            </div>
          </div>
          <SheetFooter className="mt-4">
            <Button variant="ghost" onClick={() => setAdmitTarget(null)}>Avbryt</Button>
            <Button onClick={admit} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />} Slipp inn
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}