import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useDevice } from "@/hooks/useDevice";
import { useCampaignData } from "@/hooks/useCampaignData";
import PlayerView from "@/components/sys/PlayerView";
import { Splash, Unknown } from "@/components/sys/SysStates";
import { Loader2 } from "lucide-react";

const STORAGE_KEY = "gm_terminal_code";
const isActive = (d) => d?.status === "active" || (!d?.status && !!d?.campaign_id);

export default function SysTerminal() {
  const { deviceId } = useParams();
  const { device, loading, refetch } = useDevice(deviceId);
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

  return <PlayerView data={data} partyMemberId={device.party_member_id} code={device.device_id} />;
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