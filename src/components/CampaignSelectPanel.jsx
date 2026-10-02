import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, ScrollText, MapPin, Users, BookOpen, Tag } from "lucide-react";

const STATUS_LABEL = { draft: "Draft", active: "Active", complete: "Complete" };
const MODE_LABEL = { digital: "Digital", physical: "Physical", hybrid: "Hybrid" };

export default function CampaignSelectPanel({ campaign, counts, countsLoading, onPlay }) {
  return (
    <Card className="glass-card border-primary/30 h-full">
      <CardContent className="p-6 flex flex-col h-full">
        <div className="flex items-center gap-1.5 mb-3 flex-wrap">
          <Badge variant="outline" className="border-primary/40 text-primary capitalize">{STATUS_LABEL[campaign.status] || campaign.status}</Badge>
          <Badge variant="secondary" className="capitalize">{MODE_LABEL[campaign.play_mode] || "Digital"}</Badge>
          {campaign.tone && <Badge variant="secondary" className="capitalize">{campaign.tone}</Badge>}
        </div>

        <h2 className="font-heading text-3xl mb-3 leading-tight">{campaign.title}</h2>

        <div className="flex items-center gap-1.5 text-primary/80 mb-1.5">
          <ScrollText className="w-3.5 h-3.5" />
          <span className="text-xs uppercase tracking-widest">Red Thread</span>
        </div>
        <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line mb-4">{campaign.premise || "No premise set."}</p>

        {campaign.setting && (
          <div className="mb-3">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> Setting</p>
            <p className="text-sm text-foreground/80">{campaign.setting}</p>
          </div>
        )}

        {campaign.themes?.length > 0 && (
          <div className="mb-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1.5"><Tag className="w-3 h-3" /> Themes</p>
            <div className="flex flex-wrap gap-1.5">
              {campaign.themes.map((t, i) => <Badge key={i} variant="secondary" className="capitalize">{t}</Badge>)}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="rounded-lg border border-border bg-card/40 p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1"><BookOpen className="w-3.5 h-3.5" /><span className="text-xs uppercase tracking-widest">Sessions</span></div>
            <p className="font-heading text-2xl">{countsLoading ? "…" : counts?.sessions ?? 0}</p>
          </div>
          <div className="rounded-lg border border-border bg-card/40 p-3">
            <div className="flex items-center gap-1.5 text-muted-foreground mb-1"><Users className="w-3.5 h-3.5" /><span className="text-xs uppercase tracking-widest">Characters</span></div>
            <p className="font-heading text-2xl">{countsLoading ? "…" : counts?.characters ?? 0}</p>
          </div>
        </div>

        <div className="mt-auto">
          <Button size="lg" className="w-full gap-2 text-base" onClick={onPlay}>
            <Play className="w-5 h-5" /> Play this campaign
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}