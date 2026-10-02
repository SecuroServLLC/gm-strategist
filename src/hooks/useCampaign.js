import { useEffect, useState, useCallback } from "react";
import { base44 } from "@/api/base44Client";

const STORAGE_KEY = "gm_active_campaign_id";
const TRASH_MS = 30 * 24 * 60 * 60 * 1000; // 30 dager

export const getActiveCampaignId = () => (typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null);

export function useCampaign() {
  const [all, setAll] = useState([]);
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const list = await base44.entities.Campaign.list("-created_date", 200);
      const now = Date.now();
      // Auto-slett kampanjer som har ligget i papirkurven mer enn 30 dager.
      const expired = (list || []).filter(
        (c) => c.trashed && c.trashed_at && now - new Date(c.trashed_at).getTime() > TRASH_MS
      );
      if (expired.length) {
        await Promise.all(expired.map((c) => base44.entities.Campaign.delete(c.id).catch(() => {})));
      }
      const kept = (list || []).filter((c) => !expired.find((e) => e.id === c.id));
      setAll(kept);
      const active = kept.filter((c) => !c.trashed);
      const stored = localStorage.getItem(STORAGE_KEY);
      setCampaign(active.find((c) => c.id === stored) || null);
    } catch (e) {
      setAll([]);
      setCampaign(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const setActive = useCallback((id) => {
    if (id) localStorage.setItem(STORAGE_KEY, id); else localStorage.removeItem(STORAGE_KEY);
    setCampaign(all.find((c) => c.id === id && !c.trashed) || null);
  }, [all]);

  const trash = useCallback(async (id) => {
    const upd = await base44.entities.Campaign.update(id, { trashed: true, trashed_at: new Date().toISOString() });
    setAll((p) => p.map((c) => (c.id === id ? upd : c)));
    setCampaign((c) => (c && c.id === id ? null : c));
  }, []);

  const restore = useCallback(async (id) => {
    const upd = await base44.entities.Campaign.update(id, { trashed: false, trashed_at: null });
    setAll((p) => p.map((c) => (c.id === id ? upd : c)));
  }, []);

  const purge = useCallback(async (id) => {
    await base44.entities.Campaign.delete(id);
    setAll((p) => p.filter((c) => c.id !== id));
    setCampaign((c) => (c && c.id === id ? null : c));
  }, []);

  const campaigns = all.filter((c) => !c.trashed);
  const trashedCampaigns = all.filter((c) => c.trashed);

  return { campaign, campaigns, trashedCampaigns, loading, setActive, refresh, trash, restore, purge };
}