import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ScrollText } from "lucide-react";

const STATUS_LABEL = { draft: "Utkast", active: "Aktiv", complete: "Fullført" };

export default function CampaignCard({ campaign, onOpen }) {
  return (
    <Card className="glass-card hover:border-primary/40 transition-colors cursor-pointer group h-full" onClick={onOpen}>
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center justify-between mb-3">
          <Badge variant="outline" className="border-primary/40 text-primary capitalize">{STATUS_LABEL[campaign.status] || campaign.status}</Badge>
          {campaign.tone && <Badge variant="secondary" className="capitalize">{campaign.tone}</Badge>}
        </div>
        <h3 className="font-heading text-2xl mb-2">{campaign.title}</h3>
        <div className="flex items-center gap-1.5 text-primary/80 mb-2"><ScrollText className="w-3.5 h-3.5" /><span className="text-xs uppercase tracking-widest">Rød tråd</span></div>
        <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line line-clamp-4 flex-1">{campaign.premise || "Ingen premiss satt."}</p>
        {campaign.setting && <p className="text-xs text-muted-foreground mt-3 line-clamp-2">{campaign.setting}</p>}
        <div className="flex items-center justify-end mt-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-sm font-medium">Åpne</span><ArrowRight className="w-4 h-4 ml-1" />
        </div>
      </CardContent>
    </Card>
  );
}