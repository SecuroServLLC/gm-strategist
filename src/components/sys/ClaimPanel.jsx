import React, { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Hand } from "lucide-react";

export default function ClaimPanel({ device, campaign, onClaimed }) {
  const [chars, setChars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(null);

  const load = async () => {
    if (!campaign?.id) return;
    setLoading(true);
    try {
      const all = await base44.entities.Character.filter({ campaign_id: campaign.id });
      setChars(all.filter((c) => c.claim_status === "open"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [campaign?.id]);

  const claim = async (c) => {
    setBusy(c.id);
    try {
      const { claimCharacter } = await import("@/lib/claim");
      await claimCharacter(device, c, campaign);
      onClaimed?.();
    } catch (e) {
      alert("Kunne ikke claim: " + e.message);
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <header className="px-4 py-3 border-b border-border bg-card/60">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{campaign?.title}</p>
        <h1 className="font-heading text-lg">Velg din karakter</h1>
      </header>
      <main className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-2">
        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : chars.length === 0 ? (
          <p className="text-sm text-muted-foreground italic text-center py-10">
            Ingen ledige karakterer. Be GM om å lage og åpne noen for claim.
          </p>
        ) : (
          chars.map((c) => (
            <button
              key={c.id}
              onClick={() => claim(c)}
              disabled={busy !== null}
              className="w-full text-left p-4 rounded-lg border border-border bg-card/40 hover:border-primary/50 transition flex items-center gap-3 disabled:opacity-60"
            >
              <div className="flex-1 min-w-0">
                <p className="font-heading text-lg truncate">{c.name}</p>
                <p className="text-sm text-muted-foreground">
                  {c.archetype}
                  {c.race ? ` · ${c.race}` : ""}
                </p>
                {c.background && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.background}</p>}
              </div>
              {busy === c.id ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : <Hand className="w-5 h-5 text-primary" />}
            </button>
          ))
        )}
      </main>
    </div>
  );
}