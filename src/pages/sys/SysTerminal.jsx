import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDevice } from "@/hooks/useDevice";
import { useCampaignData } from "@/hooks/useCampaignData";
import CharacterPanel from "@/components/sys/CharacterPanel";
import TeamPanel from "@/components/sys/TeamPanel";
import InventoryPanel from "@/components/sys/InventoryPanel";
import MapPanel from "@/components/sys/MapPanel";
import LogFeed from "@/components/sys/LogFeed";
import { Splash, Unknown } from "@/components/sys/SysStates";
import { User, Users, Backpack, Map as MapIcon, ScrollText, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "gm_terminal_code";
const TABS = [
  { id: "character", label: "Karakter", icon: User },
  { id: "team", label: "Team", icon: Users },
  { id: "inventory", label: "Inventar", icon: Backpack },
  { id: "map", label: "Kart", icon: MapIcon },
  { id: "log", label: "Logg", icon: ScrollText },
];

const isActive = (d) => d?.status === "active" || (!d?.status && !!d?.campaign_id);

export default function SysTerminal() {
  const { deviceId } = useParams();
  const { device, loading, refetch } = useDevice(deviceId);
  const [tab, setTab] = useState("character");
  const data = useCampaignData(device?.campaign_id);

  // Husk terminalen permanent på nettbrettet
  useEffect(() => {
    if (device?.device_id) localStorage.setItem(STORAGE_KEY, device.device_id);
  }, [device?.device_id]);

  // Mens terminalen venter: polle etter godkjenning
  useEffect(() => {
    if (!device || isActive(device)) return;
    const t = setInterval(refetch, 4000);
    return () => clearInterval(t);
  }, [device, refetch]);

  if (loading) return <Splash />;
  if (!device) return <Unknown note="Denne terminal-koden er ikke registrert." />;
  if (!isActive(device)) return <Waiting code={device.device_id} label={device.label} />;

  const partyMember = data.partyMembers.find((m) => m.id === device.party_member_id);
  const character = data.characters.find((c) => c.id === partyMember?.character_id);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <header className="px-4 py-3 border-b border-border bg-card/60 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">{data.campaign?.title}</p>
          <h1 className="font-heading text-lg truncate">{partyMember?.name || character?.name || "Terminal"}</h1>
        </div>
        <span className="font-mono text-xs tracking-widest px-2 py-1 rounded-md bg-accent/60 border border-border shrink-0">{device.device_id}</span>
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

function Waiting({ code, label }) {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-6 text-center bg-background text-foreground">
      <div className="flex items-center gap-2 mb-6 text-amber-400">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
        <span className="text-xs uppercase tracking-[0.2em]">Venter på GM</span>
      </div>
      <p className="text-sm text-muted-foreground mb-3">Vis denne koden til GM for å bli sluppet inn:</p>
      <p className="font-mono text-7xl tracking-[0.25em] mb-6">{code}</p>
      {label && label !== "Terminal" && <p className="text-sm text-muted-foreground">{label}</p>}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-8">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Venter på godkjenning…
      </div>
    </div>
  );
}