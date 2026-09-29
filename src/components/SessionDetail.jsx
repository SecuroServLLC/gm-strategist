import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Save, Sparkles, Clock, BookOpen, ListChecks, NotebookPen } from "lucide-react";

const STATUS_LABELS = { planned: "Planlagt", playing: "Pågår", done: "Spilt" };

export default function SessionDetail({ session, priorSession, onSave, onDelete, onAiPrepare, aiPreparing, modes }) {
  const [form, setForm] = useState(session);

  useEffect(() => { setForm(session); }, [session]);

  if (!session || !form) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p>Velg en økt eller opprett en ny for å begynne.</p>
        </div>
      </div>
    );
  }

  const dirty = JSON.stringify(form) !== JSON.stringify(session);
  const update = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-3xl mx-auto px-8 py-8 space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-primary/40 text-primary">Økt {session.session_number}</Badge>
              <Badge
                variant="secondary"
                className={session.status === "playing" ? "border border-amber-500/40 text-amber-300" : ""}
              >
                {STATUS_LABELS[session.status]}
              </Badge>
            </div>
            <Input
              value={form.title || ""}
              onChange={(e) => update("title", e.target.value)}
              className="text-2xl font-heading border-none px-0 focus-visible:ring-0 bg-transparent h-auto py-0"
            />
          </div>
          <Button variant="ghost" size="icon" onClick={() => onDelete(session.id)} className="text-muted-foreground hover:text-destructive shrink-0">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>

        {priorSession && (
          <Card className="glass-card border-primary/20">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-primary">
                <Clock className="w-4 h-4" />
                <CardTitle className="text-base">Fra forrige økt (#{priorSession.session_number})</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-2">
              {priorSession.recap && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Hva skjedde</p>
                  <p className="text-sm text-foreground/90 whitespace-pre-line">{priorSession.recap}</p>
                </div>
              )}
              {priorSession.prep_notes && (
                <div>
                  <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Åpne tråder</p>
                  <p className="text-sm text-foreground/90 whitespace-pre-line">{priorSession.prep_notes}</p>
                </div>
              )}
              <Button variant="outline" size="sm" className="gap-1.5 mt-2" onClick={() => onAiPrepare(session)} disabled={aiPreparing}>
                <Sparkles className="w-3.5 h-3.5" /> {aiPreparing ? "Klargjør…" : "Klargjør økt fra tidligere"}
              </Button>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div>
            <Label className="mb-1.5 block">Status</Label>
            <Select value={form.status} onValueChange={(v) => update("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planlagt</SelectItem>
                <SelectItem value="playing">Pågår</SelectItem>
                <SelectItem value="done">Spilt</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="mb-1.5 block">Spilledato</Label>
            <Input type="date" value={form.play_date || ""} onChange={(e) => update("play_date", e.target.value)} />
          </div>
          <div>
            <Label className="mb-1.5 block">Modus</Label>
            <Select value={form.mode || "none"} onValueChange={(v) => update("mode", v === "none" ? "" : v)}>
              <SelectTrigger><SelectValue placeholder="Ikke valgt" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Ikke valgt</SelectItem>
                {(modes || []).map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          </div>

        <div>
          <Label className="mb-1.5 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Sammendrag – hva skjedde</Label>
          <Textarea rows={3} value={form.recap || ""} onChange={(e) => update("recap", e.target.value)} placeholder="Kort oppsummering av økten…" />
        </div>

        <div>
          <Label className="mb-1.5 flex items-center gap-1.5"><NotebookPen className="w-3.5 h-3.5" /> Løpende notater under spillet</Label>
          <Textarea rows={9} value={form.notes || ""} onChange={(e) => update("notes", e.target.value)} placeholder="Skriv ned hva som skjer her – dette bæres inn i neste økt…" className="font-mono text-sm" />
        </div>

        <div>
          <Label className="mb-1.5 flex items-center gap-1.5"><ListChecks className="w-3.5 h-3.5" /> Ting å huske til neste gang</Label>
          <Textarea rows={4} value={form.prep_notes || ""} onChange={(e) => update("prep_notes", e.target.value)} placeholder="Åpne tråder, hint, NPCs å gjenkalle, loot å registrere…" />
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onSave(session.id, form)} disabled={!dirty} className="gap-1.5">
            <Save className="w-4 h-4" /> Lagre økt
          </Button>
        </div>
      </div>
    </div>
  );
}