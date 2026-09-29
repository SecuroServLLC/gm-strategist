import React from "react";
import { useParams, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "@/lib/AuthContext";
import { useDevice } from "@/hooks/useDevice";
import { useCampaignData } from "@/hooks/useCampaignData";
import PlayerView from "@/components/sys/PlayerView";
import { Splash, Unknown } from "@/components/sys/SysStates";

export default function JoinGame() {
  const { code } = useParams();
  const location = useLocation();
  const { isAuthenticated, isLoadingAuth } = useAuth();
  const { device, loading } = useDevice(code);
  const data = useCampaignData(device?.campaign_id);

  if (isLoadingAuth) return <Splash />;
  if (!isAuthenticated) {
    return <Navigate to={`/login?returnTo=${encodeURIComponent(location.pathname)}`} replace />;
  }
  if (loading || data.loading) return <Splash />;
  if (!device) return <Unknown note="Denne spill-lenken er ikke registrert." />;

  return (
    <PlayerView
      data={data}
      partyMemberId={device.party_member_id}
      headerTitle={device.label || "Min spiller"}
      badgeLabel="Egen enhet"
    />
  );
}