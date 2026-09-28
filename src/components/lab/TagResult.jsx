import React from "react";
import { Users, Backpack, Pencil, Trash2, Link2, Sparkles, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TagResult({ result, onEdit, onDelete, onLink, onCreateCharacter }) {
  if (!result) return null;

  if (result.status === "hit") {
    const Icon = result.targetType === "character" ? Users : Backpack;
    return (
      <Card className="glass-card border-emerald-500/30">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
              <Icon className="w-6 h-6 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider text-emerald-400/80">
                {result.targetType === "character" ? "Karakter" : "Følgesvenn"}
              </p>
              <p className="font-heading text-2xl truncate">{result.targetName || "Ukjent"}</p>
              <p className="text-xs text-muted-foreground mt-1 break-all">Tag: {result.tagId}</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
              <Pencil className="w-3.5 h-3.5" /> Endre
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onDelete}
              className="gap-1.5 text-destructive hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" /> Slett
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (result.status === "miss") {
    return (
      <Card className="glass-card border-amber-500/30">
        <CardContent className="p-5">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500/15 flex items-center justify-center shrink-0">
              <Tag className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wider text-amber-400/80">Ukjent tag</p>
              <p className="font-mono text-sm break-all mt-1">{result.tagId}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-3">Koble denne tagen til noe i kampanjen:</p>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button size="sm" onClick={onLink} className="gap-1.5">
              <Link2 className="w-3.5 h-3.5" /> Koble til
            </Button>
            <Button size="sm" variant="outline" onClick={onCreateCharacter} className="gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Lag ny karakter
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}