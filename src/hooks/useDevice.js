import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { normalizeDeviceId } from "@/lib/deviceIds";

export function useDevice(rawId) {
  const [device, setDevice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const id = normalizeDeviceId(rawId);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setError(false);
      try {
        const list = await base44.entities.Device.filter({ device_id: id });
        if (active) setDevice(list[0] || null);
      } catch {
        if (active) {
          setDevice(null);
          setError(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [id]);

  return { device, id, loading, error };
}