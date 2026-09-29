import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useDevice } from "@/hooks/useDevice";
import { useCampaignData } from "@/hooks/useCampaignData";
import CharacterPanel from "@/components/sys/CharacterPanel";
import TeamPanel from "@/components/sys/TeamPanel";
import InventoryPanel from "@/components/sys/InventoryPanel";
import MapPanel from "@/components/sys/MapPanel";
import LogFeed from "@/components/sys/LogFeed";
import { Splash, Unknown } from "@/components/sys/SysStates";
import { User, Users, Backpack, Map as MapIcon, ScrollText } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "character", label: "Karakter", icon: User },
  { id: "team", label: "Team", icon: Users },
  { id: "inventory", label: "Inventar", icon: Backpack },
  { id: "map", label: "Kart", icon: MapIcon },
  { id: "log", label: "Logg", icon: ScrollText },
];

export default function SysTerminal() {
  const { deviceId } = useParams();
  const { device, loading } = useDevice(deviceId);
  const [tab, setTab] = useState("character");
  const data = useCampaignData(device?.campaign_id);

  if (loading || data.loading) return <Splash />;
  if (!device) return <Unknown note="Denne terminal-ID-en er ikke registrert." />;

  const partyMember = data.partyMembers.find((m) => m.id === device.party_member_id);
  const character = data.characters.find((c) => c.id === partyMember?.character_id);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <header className="px-4 py-3 border-b border-border bg-card/60 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{data.campaign?.title}</p>
          <h1 className="font-heading text-lg truncate">{partyMember?.name || character?.name || "Spiller"}</h1>
        </div>
        <span className="text-xs px-2 py-1 rounded-md bg-primary/15 text-primary shrink-0">Terminal</span>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-thin px-4 py-4">
        {tab === "character" && <CharacterPanel character={character} partyMember={partyMember} />}
        {tab === "team" && <TeamPanel partyMembers={data.partyMembers} characters={data.characters} />}
        {tab === "inventory" && <InventoryPanel inventory={data.inventory} memberId={device.party_member_id} />}
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
              className={cn(
                "py-2.5 flex flex-col items-center gap-1 text-[10px]",
                tab === t.id ? "text-primary" : "text-muted-foreground"
              )}
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