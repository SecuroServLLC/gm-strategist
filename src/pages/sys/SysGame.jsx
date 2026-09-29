import React from "react";
import { useParams } from "react-router-dom";
import { useDevice } from "@/hooks/useDevice";
import { useCampaignData } from "@/hooks/useCampaignData";
import LogFeed from "@/components/sys/LogFeed";
import TeamPanel from "@/components/sys/TeamPanel";
import { Splash, Unknown } from "@/components/sys/SysStates";
import { Gamepad2 } from "lucide-react";

export default function SysGame() {
  const { deviceId } = useParams();
  const { device, loading } = useDevice(deviceId);
  const data = useCampaignData(device?.campaign_id);

  if (loading || data.loading) return <Splash />;
  if (!device) return <Unknown note="Denne game-ID-en er ikke registrert." />;

  const sessions = data.sessions || [];
  const currentSession =
    sessions.filter((s) => s.status !== "done").sort((a, b) => a.session_number - b.session_number)[0] ||
    sessions[sessions.length - 1];

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <header className="px-4 py-3 border-b border-border bg-card/60 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Spilløkt</p>
          <h1 className="font-heading text-lg truncate">{data.campaign?.title}</h1>
        </div>
        <span className="text-xs px-2 py-1 rounded-md bg-primary/15 text-primary shrink-0 flex items-center gap-1">
          <Gamepad2 className="w-3.5 h-3.5" /> Game
        </span>
      </header>

      <main className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-5">
        {data.campaign?.premise && (
          <div className="p-3 rounded-lg border border-border bg-card/40">
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Rød tråd</p>
            <p className="text-sm">{data.campaign.premise}</p>
          </div>
        )}
        {currentSession && (
          <div className="p-3 rounded-lg border border-primary/30 bg-primary/5">
            <p className="text-xs uppercase tracking-wider text-primary mb-1">
              Nåværende økt · #{currentSession.session_number}
            </p>
            <p className="font-heading text-lg">{currentSession.title}</p>
            {currentSession.mode && <p className="text-xs text-muted-foreground mt-0.5">Modus: {currentSession.mode}</p>}
          </div>
        )}
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Team</p>
          <TeamPanel partyMembers={data.partyMembers} characters={data.characters} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Logg</p>
          <LogFeed events={data.events} />
        </div>
      </main>
    </div>
  );
}