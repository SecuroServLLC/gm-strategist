import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Trash2, Plus, Users, Map as MapIcon, Workflow, Backpack, ScrollText,
  Sparkles, Loader2, ExternalLink, Lightbulb, Ban,
} from "lucide-react";
import WorldTreeViewer from "@/components/autogame/WorldTreeViewer";

const ROLE_COLORS = {
  protagonist: "text-amber-400 border-amber-500/30",
  ally: "text-emerald-400 border-emerald-500/30",
  antagonist: "text-red-400 border-red-500/30",
  npc: "text-sky-400 border-sky-500/30",
  contact: "text-violet-400 border-violet-500/30",
  mentor: "text-orange-400 border-orange-500/30",
};

const CATEGORY_LABELS = {
  weapon: "Våpen", armor: "Rustning", consumable: "Forbruk", valuable: "Verdi", currency: "Mynt", misc: "Diverse",
};

const LOCATION_LABELS = {
  city: "By", dungeon: "Dungeon", fortress: "Festning", region: "Region",
  ruins: "Ruiner", tavern: "Vertshus", temple: "Tempel", wilderness: "Villmark", other: "Annet",
};

function Section({ icon: Icon, title, count, children, link }) {
  return (
    <Card className="glass-card">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <Icon className="w-4.5 h-4.5 text-primary" />
          <h3 className="font-heading text-lg font-semibold">{title}</h3>
          <Badge variant="outline" className="ml-auto">{count}</Badge>
          {link && (
            <Link to={link}>
              <Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-xs">
                Åpne <ExternalLink className="w-3 h-3" />
              </Button>
            </Link>
          )}
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

export default function GenerationSummary({ result, onEdit, onDelete, editing, worldId }) {
  const [editMsg, setEditMsg] = useState("");

  const submitEdit = () => {
    if (!editMsg.trim() || editing) return;
    onEdit(editMsg.trim());
    setEditMsg("");
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2 flex-wrap">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="font-heading text-2xl">{result.title || "Generert verden"}</h2>
        <div className="flex gap-1.5 ml-auto">
          {result.steps?.map((s) => (
            <Badge key={s.name} variant={s.status === 'done' ? 'secondary' : 'destructive'} className="text-[10px]">
              {s.label}: {s.count}
            </Badge>
          ))}
        </div>
      </div>
      {result.summary && <p className="text-sm text-muted-foreground -mt-2">{result.summary}</p>}

      {/* Red Thread */}
      {result.red_thread && (result.red_thread.premise || result.red_thread.hints?.length || result.red_thread.constraints?.length) && (
        <Section icon={ScrollText} title="Rød Tråd" count={0} link="/campaign">
          {result.red_thread.premise && (
            <div className="mb-3">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">Hovedfortelling</span>
              <p className="text-sm mt-1 leading-relaxed">{result.red_thread.premise}</p>
            </div>
          )}
          {result.red_thread.hints?.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Hint</span>
              </div>
              <ul className="space-y-1">
                {result.red_thread.hints.map((h, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-amber-400/60 mt-0.5">•</span> {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {result.red_thread.constraints?.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <Ban className="w-3.5 h-3.5 text-red-400" />
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Begrensninger</span>
              </div>
              <ul className="space-y-1">
                {result.red_thread.constraints.map((c, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-red-400/60 mt-0.5">•</span> {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Section>
      )}

      {/* Characters */}
      {result.characters?.length > 0 && (
        <Section icon={Users} title="Karakterer" count={result.characters.length} link="/characters">
          <div className="grid sm:grid-cols-2 gap-2">
            {result.characters.map((c) => (
              <div key={c.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-card/40 border border-border/50 group">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate block">{c.name}</span>
                  {c.archetype && <span className="text-xs text-muted-foreground truncate block">{c.archetype}</span>}
                </div>
                <Badge variant="outline" className={`text-[10px] shrink-0 ${ROLE_COLORS[c.role] || ''}`}>
                  {c.role}
                </Badge>
                <button
                  onClick={() => onDelete('character', c.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/20"
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* World Structure */}
      {worldId && (
        <Section icon={MapIcon} title="Verdensstruktur" count={0}>
          <WorldTreeViewer worldId={worldId} />
        </Section>
      )}

      {/* Maps */}
      {result.maps?.length > 0 && (
        <Section icon={MapIcon} title="Kart" count={result.maps.length} link="/maps">
          <div className="grid sm:grid-cols-2 gap-2">
            {result.maps.map((m) => (
              <div key={m.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-card/40 border border-border/50 group">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate block">{m.title}</span>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {LOCATION_LABELS[m.location_type] || m.location_type}
                </Badge>
                <button
                  onClick={() => onDelete('map', m.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/20"
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Story Flow */}
      {result.story_nodes?.length > 0 && (
        <Section icon={Workflow} title="Story Flow" count={result.story_nodes.length} link="/story">
          <div className="space-y-1.5">
            {result.story_nodes.map((s) => (
              <div key={s.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-card/40 border border-border/50 group">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate block">{s.title}</span>
                </div>
                <Badge variant="outline" className="text-[10px] shrink-0">{s.node_type}</Badge>
                <button
                  onClick={() => onDelete('story', s.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/20"
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Items */}
      {result.items?.length > 0 && (
        <Section icon={Backpack} title="Gjenstander" count={result.items.length} link="/group">
          <div className="grid sm:grid-cols-2 gap-2">
            {result.items.map((i) => (
              <div key={i.id} className="flex items-center gap-2 p-2.5 rounded-lg bg-card/40 border border-border/50 group">
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium truncate block">{i.name}</span>
                </div>
                {i.quantity > 1 && <span className="text-xs text-muted-foreground">×{i.quantity}</span>}
                <Badge variant="outline" className="text-[10px] shrink-0">
                  {CATEGORY_LABELS[i.category] || i.category}
                </Badge>
                <button
                  onClick={() => onDelete('item', i.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-destructive/20"
                >
                  <Trash2 className="w-3.5 h-3.5 text-destructive" />
                </button>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Edit input */}
      <Card className="glass-card border-primary/30">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Plus className="w-4.5 h-4.5 text-primary" />
            <h3 className="font-heading text-lg font-semibold">Legg til mer</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Skriv en melding for å legge til nye karakterer, steder, story-elementer eller gjenstander. Dette bygger videre på det som finnes — ingenting erstattes.
          </p>
          <Textarea
            value={editMsg}
            onChange={(e) => setEditMsg(e.target.value)}
            rows={3}
            placeholder="F.eks. «Legg til en mystisk kjøpmann i havnebyen som selger magiske artefakter» eller «Legg til en drage som bor i fjellet»"
            disabled={editing}
          />
          <Button onClick={submitEdit} disabled={!editMsg.trim() || editing} className="gap-2 mt-3 w-full">
            {editing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {editing ? "Legger til…" : "Legg til i verdenen"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}