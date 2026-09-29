import React from "react";
import { useParams } from "react-router-dom";
import { useDevice } from "@/hooks/useDevice";
import { useCampaignData } from "@/hooks/useCampaignData";
import LogFeed from "@/components/sys/LogFeed";
import { Splash, Unknown } from "@/components/sys/SysStates";
import { Image } from "@/components/ui/image";
import { Monitor } from "lucide-react";

export default function SysGameDisplay() {
  const { deviceId } = useParams();
  const { device, loading } = useDevice(deviceId);
  const data = useCampaignData(device?.campaign_id);

  if (loading || data.loading) return <Splash />;
  if (!device) return <Unknown note="Denne display-ID-en er ikke registrert." />;

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

      <main className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
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
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Hendelseslogg</p>
          <LogFeed events={data.events} />
        </div>
      </main>
    </div>
  );
}