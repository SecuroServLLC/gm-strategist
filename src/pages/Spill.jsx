import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCampaign } from "@/hooks/useCampaign";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dices, BookOpen, Swords, Backpack, ScrollText } from "lucide-react";
import PlayCard from "@/components/play/PlayCard";
import LoadoutBoard from "@/components/play/LoadoutBoard";
import SessionLog from "@/components/play/SessionLog";
import PlayMaps from "@/components/maps/PlayMaps";
import AiGameMaster from "@/components/play/AiGameMaster";
import SceneSoundscape from "@/components/audio/SceneSoundscape";

export default function Spill() {
  const { campaign, loading } = useCampaign();
  const [members, setMembers] = useState([]);
  const [items, setItems] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [events, setEvents] = useState([]);
  const currentSession = useRef(sessionId);
  currentSession.current = sessionId;

  useEffect(() => {
    if (!campaign) return;
    let active = true;
    (async () => {
      try {
        const [m, i, s] = await Promise.all([
          base44.entities.PartyMember.filter({ campaign_id: campaign.id }),
          base44.entities.InventoryItem.filter({ campaign_id: campaign.id }),
          base44.entities.Session.filter({ campaign_id: campaign.id }),
        ]);
        if (!active) return;
        s.sort((a, b) => (a.session_number || 0) - (b.session_number || 0));
        setMembers(m); setItems(i); setSessions(s);
        const playing = s.find((x) => x.status === "playing") || s[s.length - 1] || null;
        setSessionId(playing?.id || null);
      } catch (e) {}
    })();
    return () => { active = false; };
  }, [campaign?.id]);

  useEffect(() => {
    if (!campaign || !sessionId) { setEvents([]); return; }
    let active = true;
    (async () => {
      try {
        const ev = await base44.entities.SessionEvent.filter({ campaign_id: campaign.id, session_id: sessionId });
        if (active) setEvents(ev);
      } catch (e) {}
    })();
    return () => { active = false; };
  }, [campaign?.id, sessionId]);

  const updateMember = async (id, patch) => {
    setMembers((p) => p.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    try { await base44.entities.PartyMember.update(id, patch); } catch (e) {}
  };
  const moveItem = async (itemId, carriedBy) => {
    setItems((p) => p.map((i) => (i.id === itemId ? { ...i, carried_by: carriedBy } : i)));
    try { await base44.entities.InventoryItem.update(itemId, { carried_by: carriedBy }); } catch (e) {}
  };
  const addEvent = async ({ kind, text }) => {
    if (!sessionId) return;
    try {
      const created = await base44.entities.SessionEvent.create({ campaign_id: campaign.id, session_id: sessionId, kind, text });
      setEvents((p) => [...p, created]);
    } catch (e) {}
  };
  const deleteEvent = async (id) => {
    setEvents((p) => p.filter((e) => e.id !== id));
    try { await base44.entities.SessionEvent.delete(id); } catch (e) {}
  };

  if (loading) {
    return (<div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>);
  }
  if (!campaign) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Swords className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="mb-4">Du trenger en kampanje før du kan spille.</p>
          <Link to="/campaign"><Button variant="outline">Opprett rød tråd</Button></Link>
        </div>
      </div>
    );
  }

  const activeMembers = members.filter((m) => m.status !== "dead" && m.status !== "absent");

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex items-center gap-3 mb-2">
          <Swords className="w-6 h-6 text-primary" />
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Spillebordet</span>
        </div>
        <h1 className="font-heading text-4xl mb-1">Spill</h1>
        <p className="text-muted-foreground text-lg mb-6">HP, tilstander, ressurser, utrusting og hendelseslogg – alt du trenger ved bordet.</p>

        <Card className="glass-card mb-6">
          <CardContent className="p-4 flex items-center gap-3 flex-wrap">
            <span className="text-sm text-muted-foreground flex items-center gap-1.5"><BookOpen className="w-4 h-4" /> Aktiv økt:</span>
            {sessions.length === 0 ? (
              <span className="text-sm text-muted-foreground">Ingen økt enda. <Link to="/sessions" className="text-primary underline">Opprett en</Link>.</span>
            ) : (
              <Select value={sessionId || ""} onValueChange={setSessionId}>
                <SelectTrigger className="w-64"><SelectValue placeholder="Velg økt" /></SelectTrigger>
                <SelectContent>
                  {sessions.map((s) => <SelectItem key={s.id} value={s.id}>Økt {s.session_number} — {s.title}</SelectItem>)}
                </SelectContent>
              </Select>
            )}
            {sessionId && <Badge variant="secondary" className="ml-auto">{events.length} hendelser</Badge>}
          </CardContent>
        </Card>

        {sessionId && <SceneSoundscape key={`${campaign.id}:${sessionId}`} campaignId={campaign.id} sessionId={sessionId} />}

        <Tabs defaultValue="play">
          <TabsList className="mb-6 flex h-auto flex-wrap justify-start">
            <TabsTrigger value="play" className="gap-1.5"><Swords className="w-4 h-4" /> Følget</TabsTrigger>
            <TabsTrigger value="loot" className="gap-1.5"><Backpack className="w-4 h-4" /> Utrusting</TabsTrigger>
            <TabsTrigger value="log" className="gap-1.5"><ScrollText className="w-4 h-4" /> Logg</TabsTrigger>
            <TabsTrigger value="maps">Maps</TabsTrigger>
            <TabsTrigger value="ai-gm">AI Game Master</TabsTrigger>
          </TabsList>

          <TabsContent value="play">
            {activeMembers.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">Ingen aktive følgesvenner. Legg til de på <Link to="/group" className="text-primary underline">Følget</Link>-siden.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {activeMembers.map((m) => <PlayCard key={m.id} member={m} onUpdate={updateMember} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="loot">
            {members.length === 0 && items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">Ingen utrusting enda. Legg til gjenstander på <Link to="/group" className="text-primary underline">Følget</Link>-siden, så kan du dra dem mellom karakterer her.</p>
            ) : (
              <LoadoutBoard members={members} items={items} onMoveItem={moveItem} />
            )}
          </TabsContent>

          <TabsContent value="maps">
            <PlayMaps key={campaign.id} campaignId={campaign.id} />
          </TabsContent>

          <TabsContent value="ai-gm">
            {sessionId ? (
              <AiGameMaster key={sessionId} campaignId={campaign.id} sessionId={sessionId} onRecorded={(event) => {
                if (event.session_id === currentSession.current) setEvents((current) => [...current.filter((item) => item.id !== event.id), event]);
              }} />
            ) : (
              <p className="text-sm text-muted-foreground">Choose a session first. <Link to="/sessions" className="text-primary underline">Create a session</Link> to begin.</p>
            )}
          </TabsContent>

          <TabsContent value="log">
            {sessionId ? (
              <SessionLog events={events} onAdd={addEvent} onDelete={deleteEvent} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-10">Opprett en økt først for å logge hendelser.</p>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}