import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";

export default function useLiveMap(map) {
  const [live, setLive] = useState(map);
  useEffect(() => { setLive(map); }, [map]);
  useEffect(() => {
    if (!map?.id) return;
    return base44.entities.MapItem.subscribe((event) => {
      if (event.id !== map.id) return;
      if (event.type === 'delete') setLive(null);
      else setLive((previous) => ({ ...previous, ...event.data }));
    });
  }, [map?.id]);
  return live;
}