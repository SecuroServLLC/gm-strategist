import { useCallback, useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { normalizeDeviceId } from "@/lib/deviceIds";

export function useDevice(rawId) {
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const id = normalizeDeviceId(rawId);

  const refetch = useCallback(async () => {
    setLoading(true);
    try {
      const list = await base44.entities.Device.filter({ device_id: id });
      setDevice(list[0] || null);
    } catch {
      setDevice(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { refetch(); }, [refetch]);

  return { device, id, loading, refetch };
}