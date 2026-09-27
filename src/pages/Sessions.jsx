import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCampaign } from "@/hooks/useCampaign";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, BookOpen } from "lucide-react";
import SessionDetail from "@/components/SessionDetail";

const STATUS_SHORT = { planned: "Planlagt", playing: "Pågår", done: "Spilt" };

export default function Sessions() {
  const { campaign, loading } = useCampaign();
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [aiPreparing, setAiPreparing] = useState(false);

  useEffect(() => {
    if (!campaign) return;
    let active = true;
    setLoadingSessions(true);
    (async () => {
      try {
        const list = await base44.entities.Session.filter({ campaign_id: campaign.id });
        if (!active) return;
        list.sort((a, b) => (a.session_number || 0) - (b.session_number || 0));
        setSessions(list);
        setSelectedId((prev) => prev || (list.length ? list[list.length - 1].id : null));
      } catch (e) {} finally {
        if (active) setLoadingSessions(false);
      }
    })();
    return () => { active = false; };
  }, [campaign?.id]);

  useEffect(() => { setSelectedId(null); }, [campaign?.id]);

  const selected = sessions.find((s) => s.id === selectedId) || null;
  const selectedIndex = selected ? sessions.findIndex((s) => s.id === selected.id) : -1;
  const priorSession = selectedIndex > 0 ? sessions[selectedIndex - 1] : null;

  const createSession = async () => {
    const nextNum = sessions.length ? Math.max(...sessions.map((s) => s.session_number || 0)) + 1 : 1;
    const today = new Date().toISOString().slice(0, 10);
    const created = await base44.entities.Session.create({
      campaign_id: campaign.id,
      session_number: nextNum,
      title: `Økt ${nextNum}`,
      play_date: today,
      status: "planned",
    });
    setSessions((prev) => [...prev, created].sort((a, b) => (a.session_number || 0) - (b.session_number || 0)));
    setSelectedId(created.id);
  };

  const handleSave = async (id, form) => {
    const updated = await base44.entities.Session.update(id, {
      title: form.title,
      status: form.status,
      play_date: form.play_date,
      recap: form.recap,
      notes: form.notes,
      prep_notes: form.prep_notes,
    });
    setSessions((prev) => prev.map((s) => (s.id === id ? updated : s)));
  };

  const handleDelete = async (id) => {
    await base44.entities.Session.delete(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const handleAiPrepare = async (session) => {
    setAiPreparing(true);
    try {
      const res = await base44.functions.invoke("prepareNextSession", { campaign_id: campaign.id });
      const data = res.data || res;
      const openThreads = Array.isArray(data.open_threads) ? data.open_threads.join("\n") : "";
      const merged = {
        recap: data.last_recap ? (session.recap ? session.recap + "\n\n" + data.last_recap : data.last_recap) : session.recap,
        prep_notes: openThreads ? (session.prep_notes ? session.prep_notes + "\n\n" + openThreads : openThreads) : session.prep_notes,
      };
      const updated = await base44.entities.Session.update(session.id, merged);
      setSessions((prev) => prev.map((s) => (s.id === session.id ? updated : s)));
    } catch (e) {} finally {
      setAiPreparing(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="mb-4">Du trenger en kampanje før du kan planlegge økter.</p>
          <Link to="/kampanje"><Button variant="outline">Opprett rød tråd</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex">
      <div className="w-72 shrink-0 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="font-heading text-lg leading-none">Økter</h2>
            <p className="text-xs text-muted-foreground mt-1">{sessions.length} totalt</p>
          </div>
          <Button size="sm" className="gap-1.5" onClick={createSession}>
            <Plus className="w-4 h-4" /> Ny
          </Button>
        </div>
        <ScrollArea className="flex-1">
          <div className="p-2 space-y-1">
            {loadingSessions && sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4">Laster…</p>
            ) : sessions.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4">Ingen økter enda. Trykk «Ny» for å starte første økt.</p>
            ) : (
              sessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedId(s.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    selectedId === s.id ? "bg-accent border-primary/40" : "border-transparent hover:bg-accent/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Økt {s.session_number}</span>
                    <Badge variant="secondary" className="text-[10px] py-0">{STATUS_SHORT[s.status]}</Badge>
                  </div>
                  <p className="font-medium text-sm truncate">{s.title}</p>
                  {s.play_date && <p className="text-xs text-muted-foreground">{s.play_date}</p>}
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="flex-1 min-w-0">
        <SessionDetail
          session={selected}
          priorSession={priorSession}
          onSave={handleSave}
          onDelete={handleDelete}
          onAiPrepare={handleAiPrepare}
          aiPreparing={aiPreparing}
        />
      </div>
    </div>
  );
}