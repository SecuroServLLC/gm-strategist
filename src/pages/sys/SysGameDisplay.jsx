import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useDevice } from "@/hooks/useDevice";
import { useCampaignData } from "@/hooks/useCampaignData";
import LogFeed from "@/components/sys/LogFeed";
import PlayerStatCard from "@/components/sys/PlayerStatCard";
import { Splash, Unknown } from "@/components/sys/SysStates";
import { Image } from "@/components/ui/image";
import { Monitor, Map as MapIcon, ScrollText, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const MODULES = [
  { id: "players", label: "Spillere", icon: Users },
  { id: "map", label: "Kart", icon: MapIcon },
  { id: "log", label: "Logg", icon: ScrollText },
];

export default function SysGameDisplay() {
  const { deviceId } = useParams();
  const { device, loading } = useDevice(deviceId);
  const data = useCampaignData(device?.campaign_id);
  const [on, setOn] = useState({ players: true, map: true, log: true });

  if (loading || data.loading) return <Splash />;
  if (!device) return <Unknown note="Denne display-ID-en er ikke registrert." />;

  const allPlayers = (data.partyMembers || []).filter((m) => m.status !== "dead" && m.character_id);
  const players = allPlayers
    .slice(0, 4)
    .map((m) => ({ m, c: data.characters.find((c) => c.id === m.character_id) }))
    .filter((x) => x.c);
  const extra = Math.max(0, allPlayers.length - 4);

  const currentMap = [...(data.maps || [])].sort(
    (a, b) => new Date(b.updated_date) - new Date(a.updated_date)
  )[0];

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <header className="px-4 py-3 border-b border-border bg-card/60 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{data.campaign?.title}</p>
          <h1 className="font-heading text-lg truncate">Spilledisplay</h1>
        </div>
        <span className="text-xs px-2 py-1 rounded-md bg-primary/15 text-primary shrink-0 flex items-center gap-1">
          <Monitor className="w-3.5 h-3.5" /> Display
        </span>
      </header>

      <div className="px-4 py-2 border-b border-border bg-card/40 flex gap-2 overflow-x-auto scrollbar-thin">
        {MODULES.map((mod) => {
          const Icon = mod.icon;
          return (
            <button
              key={mod.id}
              onClick={() => setOn((s) => ({ ...s, [mod.id]: !s[mod.id] }))}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs border flex items-center gap-1.5 shrink-0",
                on[mod.id] ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-muted-foreground"
              )}
            >
              <Icon className="w-3.5 h-3.5" /> {mod.label} {on[mod.id] ? "på" : "av"}
            </button>
          );
        })}
      </div>

      <main className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5">
        {on.players && (
          <section>
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
              Spillere (maks 4){extra > 0 && <span className="text-amber-400"> · +{extra} flere</span>}
            </h2>
            {players.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">Ingen spillere claimet enda.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {players.map(({ m, c }) => (
                  <PlayerStatCard key={m.id} character={c} partyMember={m} campaign={data.campaign} />
                ))}
              </div>
            )}
          </section>
        )}

        {on.map && (
          <section>
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Kart</h2>
            <div className="rounded-xl overflow-hidden border border-border bg-card/40">
              {currentMap?.sketch_url ? (
                <Image src={currentMap.sketch_url} fittingType="fit" className="w-full max-h-[55vh] object-contain" />
              ) : (
                <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
                  {currentMap?.title || "Ingen kart"}
                </div>
              )}
              {currentMap && (
                <div className="p-3 border-t border-border">
                  <p className="font-heading text-base">{currentMap.title}</p>
                  {currentMap.description && <p className="text-xs text-muted-foreground mt-1">{currentMap.description}</p>}
                </div>
              )}
            </div>
          </section>
        )}

        {on.log && (
          <section>
            <h2 className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Hendelseslogg</h2>
            <LogFeed events={data.events} />
          </section>
        )}
      </main>
    </div>
  );
}