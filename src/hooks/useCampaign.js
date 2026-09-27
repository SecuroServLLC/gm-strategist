import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

export function useCampaign() {
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const list = await base44.entities.Campaign.list("-created_date", 1);
      setCampaign(list[0] || null);
    } catch (e) {
      setCampaign(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  return { campaign, loading, refresh, setCampaign };
}