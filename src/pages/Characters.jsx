import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCampaign } from "@/hooks/useCampaign";
import CharacterCard from "@/components/CharacterCard";
import CharacterDialog from "@/components/CharacterDialog";
import CharacterGenerator from "@/components/CharacterGenerator";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Plus, ScrollText, Loader2, Dices } from "lucide-react";

const ROLE_OPTIONS = [
  { value: "all", label: "Alle" },
  { value: "protagonist", label: "Protagonist" },
  { value: "ally", label: "Alliert" },
  { value: "antagonist", label: "Antagonist" },
  { value: "npc", label: "NPC" },
  { value: "contact", label: "Kontakt" },
  { value: "mentor", label: "Mentor" },
];

export default function Characters() {
  const { campaign, loading } = useCampaign();
  const [characters, setCharacters] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [roleFilter, setRoleFilter] = useState("all");
  const [genOpen, setGenOpen] = useState(false);
  const [prefill, setPrefill] = useState(null);

  const filtered = roleFilter === "all" ? characters : characters.filter((c) => c.role === roleFilter);

  const load = useCallback(async () => {
    if (!campaign) return;
    setLoadingList(true);
    try {
      const list = await base44.entities.Character.filter({ campaign_id: campaign.id });
      setCharacters(list);
    } finally {
      setLoadingList(false);
    }
  }, [campaign]);

  useEffect(() => { load(); }, [load]);

  const openNew = () => { setEditing(null); setPrefill(null); setDialogOpen(true); };
  const openEdit = (c) => { setEditing(c); setDialogOpen(true); };
  const openGenerator = () => { setGenOpen(true); };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="glass-card max-w-md">
          <CardContent className="p-8 text-center">
            <ScrollText className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="font-heading text-2xl mb-2">Ingen kampanje</h2>
            <p className="text-muted-foreground mb-5">Opprett den røde tråden før du genererer karakterer.</p>
            <Link to="/kampanje"><Button className="gap-2"><ScrollText className="w-4 h-4" /> Opprett rød tråd</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-6xl mx-auto px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Karakterer</span>
            </div>
            <h1 className="font-heading text-4xl">Karakterkort</h1>
            <p className="text-muted-foreground mt-1">{characters.length} karakterer · AI-genererte, skreddersydd for ditt system.</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={openNew} className="gap-2">
              <Plus className="w-4 h-4" /> Ny karakter
            </Button>
            <Button onClick={openGenerator} variant="outline" className="gap-2">
              <Dices className="w-4 h-4" /> Foreslå karakterer
            </Button>
          </div>
        </div>

        {characters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mb-6">
            {ROLE_OPTIONS.map((r) => {
              const count = r.value === "all" ? characters.length : characters.filter((c) => c.role === r.value).length;
              const active = roleFilter === r.value;
              return (
                <button
                  key={r.value}
                  onClick={() => setRoleFilter(r.value)}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${active ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"}`}
                >
                  {r.label} <span className={active ? "opacity-80" : "opacity-50"}>{count}</span>
                </button>
              );
            })}
          </div>
        )}

        {loadingList ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
        ) : characters.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 text-primary/30 mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">Ingen karakterer enda. La AIen skape den første.</p>
              <Button onClick={openNew} className="gap-2"><Plus className="w-4 h-4" /> Generer karakter</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
            {filtered.map((c) => (
              <CharacterCard key={c.id} character={c} onClick={() => openEdit(c)} />
            ))}
          </div>
        )}
      </div>

      <CharacterDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        character={editing}
        prefill={prefill}
        campaignId={campaign.id}
        setting={campaign.setting}
        onSaved={load}
      />

      <CharacterGenerator
        open={genOpen}
        onOpenChange={setGenOpen}
        setting={campaign.setting}
        onPick={(c) => { setPrefill(c); setGenOpen(false); setDialogOpen(true); }}
      />
    </div>
  );
}