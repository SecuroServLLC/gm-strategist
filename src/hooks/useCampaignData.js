import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export function useCampaignData(campaignId) {
  const [data, setData] = useState({
    campaign: null, characters: [], partyMembers: [], inventory: [],
    maps: [], sessions: [], events: [], loading: true,
  });

  useEffect(() => {
    let active = true;
    (async () => {
      if (!campaignId) { if (active) setData((d) => ({ ...d, loading: false })); return; }
      try {
        const [campaign, characters, partyMembers, inventory, maps, sessions] = await Promise.all([
          base44.entities.Campaign.get(campaignId),
          base44.entities.Character.filter({ campaign_id: campaignId }),
          base44.entities.PartyMember.filter({ campaign_id: campaignId }),
          base44.entities.InventoryItem.filter({ campaign_id: campaignId }),
          base44.entities.MapItem.filter({ campaign_id: campaignId }),
          base44.entities.Session.filter({ campaign_id: campaignId }),
        ]);
        const orderedSessions = [...sessions].sort((a, b) => a.session_number - b.session_number);
        let events = [];
        try {
          events = await base44.entities.SessionEvent.filter({ campaign_id: campaignId });
        } catch { events = []; }
        if (active) {
          setData({ campaign, characters, partyMembers, inventory, maps, sessions: orderedSessions, events, loading: false });
        }
      } catch {
        if (active) setData((d) => ({ ...d, loading: false }));
      }
    })();
    return () => { active = false; };
  }, [campaignId]);

  return data;
}