import React from "react";
import { Image } from "@/components/ui/image";
import { Map as MapIcon, FileText } from "lucide-react";

export default function MapPanel({ maps }) {
  if (!maps || maps.length === 0) {
    return <p className="text-sm text-muted-foreground italic">Ingen kart registrert.</p>;
  }
  const current = [...maps].sort((a, b) => new Date(b.updated_date) - new Date(a.updated_date))[0];
  return (
    <div className="space-y-4">
      <div className="rounded-xl overflow-hidden border border-border bg-card/40">
        {current.sketch_url ? (
          <Image src={current.sketch_url} fittingType="fit" className="w-full max-h-[50vh] object-contain" />
        ) : (
          <div className="h-48 flex items-center justify-center text-muted-foreground text-sm">
            {current.description || "Ingen skisse"}
          </div>
        )}
        <div className="p-3 border-t border-border">
          <p className="font-heading text-lg flex items-center gap-2">
            <MapIcon className="w-4 h-4 text-primary" /> {current.title}
          </p>
          {current.description && <p className="text-xs text-muted-foreground mt-1">{current.description}</p>}
        </div>
      </div>
      {maps.length > 1 && (
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Andre kart</p>
          <div className="space-y-1">
            {maps.filter((m) => m.id !== current.id).map((m) => (
              <div key={m.id} className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card/40 text-sm">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="truncate">{m.title}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}