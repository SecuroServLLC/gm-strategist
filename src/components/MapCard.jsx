import React from "react";
import { Image } from "@/components/ui/image";
import { Badge } from "@/components/ui/badge";
import { Map as MapIcon, MapPin } from "lucide-react";

const TYPE_LABELS = {
  city: "By", dungeon: "Grotte", wilderness: "Villmark", tavern: "Vertshus",
  temple: "Tempel", fortress: "Festning", ruins: "Ruiner", region: "Region", other: "Annet",
};

export default function MapCard({ map, onClick }) {
  return (
    <button onClick={onClick} className="text-left glass-card rounded-2xl overflow-hidden hover:border-primary/40 transition-all group hover:-translate-y-0.5 w-full">
      <div className="relative h-44 overflow-hidden bg-accent/30">
        {map.sketch_url ? (
          <Image src={map.sketch_url} fittingType="fill" className="w-full h-full transition-transform group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <MapIcon className="w-12 h-12 text-muted-foreground/40" />
          </div>
        )}
        <div className="absolute top-2.5 left-2.5">
          <Badge variant="outline" className="bg-background/70 backdrop-blur capitalize">{TYPE_LABELS[map.location_type] || map.location_type}</Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-heading text-xl leading-tight mb-1">{map.title}</h3>
        {map.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-2.5">{map.description}</p>}
        {map.landmarks?.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-primary/80">
            <MapPin className="w-3.5 h-3.5" /> {map.landmarks.length} landemerker
          </div>
        )}
      </div>
    </button>
  );
}