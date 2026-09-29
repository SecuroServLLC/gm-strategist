import React, { useState } from "react";
import CharacterPanel from "@/components/sys/CharacterPanel";
import TeamPanel from "@/components/sys/TeamPanel";
import InventoryPanel from "@/components/sys/InventoryPanel";
import MapPanel from "@/components/sys/MapPanel";
import LogFeed from "@/components/sys/LogFeed";
import { User, Users, Backpack, Map as MapIcon, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "character", label: "Karakter", icon: User },
  { id: "team", label: "Team", icon: Users },
  { id: "inventory", label: "Inventar", icon: Backpack },
  { id: "map", label: "Kart", icon: MapIcon },
  { id: "log", label: "Logg", icon: ScrollText },
];

export default function PlayerView({ data, partyMemberId, code, headerTitle, badgeLabel }) {
  const [tab, setTab] = useState("character");
  const partyMember = data.partyMembers.find((m) => m.id === partyMemberId);
  const character = data.characters.find((c) => c.id === partyMember?.character_id);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <header className="px-4 py-3 border-b border-border bg-card/60 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{data.campaign?.title}</p>
          <h1 className="font-heading text-lg truncate">
            {headerTitle || partyMember?.name || character?.name || "Spiller"}
          </h1>
        </div>
        {code && (
          <span className="font-mono text-xs tracking-widest px-2 py-1 rounded-md bg-accent/60 border border-border shrink-0">
            {code}
          </span>
        )}
        {badgeLabel && !code && (
          <span className="text-xs px-2 py-1 rounded-md bg-primary/15 text-primary shrink-0">{badgeLabel}</span>
        )}
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4">
        {tab === "character" && <CharacterPanel character={character} partyMember={partyMember} campaign={data.campaign} />}
        {tab === "team" && <TeamPanel partyMembers={data.partyMembers} characters={data.characters} />}
        {tab === "inventory" && <InventoryPanel inventory={data.inventory} memberId={partyMemberId} />}
        {tab === "map" && <MapPanel maps={data.maps} />}
        {tab === "log" && <LogFeed events={data.events} />}
      </main>

      <nav className="border-t border-border bg-card/60 grid grid-cols-5">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn("py-2.5 flex flex-col items-center gap-1 text-[10px]", tab === t.id ? "text-primary" : "text-muted-foreground")}
            >
              <Icon className="w-5 h-5" />
              {t.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
}