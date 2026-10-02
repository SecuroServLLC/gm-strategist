import React from "react";
import InteractiveMap from "@/components/maps/InteractiveMap";
import useLiveMap from "@/hooks/useLiveMap";

export default function LiveMap({ map }) {
  const current = useLiveMap(map);
  if (!current) return <p className="text-sm text-muted-foreground">This map is no longer available.</p>;
  return <InteractiveMap key={current.id} map={current} />;
}