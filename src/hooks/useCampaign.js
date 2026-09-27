import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "gm_active_campaign_id";

export function useCampaign() {
  const [campaigns, setCampaigns] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const list = await base44.entities.Campaign.list("-created_date", 100);
      setCampaigns(list);
      const stored = localStorage.getItem(STORAGE_KEY);
      setCampaign(list.find((c) => c.id === stored) || list[0] || null);
    } catch (e) {
      setCampaigns([]);
      setCampaign(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const setActive = useCallback((id) => {
    if (id) localStorage.setItem(STORAGE_KEY, id); else localStorage.removeItem(STORAGE_KEY);
    setCampaign(campaigns.find((c) => c.id === id) || null);
  }, [campaigns]);

  return { campaign, campaigns, loading, setActive, refresh };
}