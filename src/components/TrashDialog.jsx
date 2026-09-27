import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Trash2, RotateCcw, AlertTriangle } from "lucide-react";
import { TRASH_RETENTION_DAYS } from "@/lib/subscription";

function daysLeft(trashedAt) {
  if (!trashedAt) return TRASH_RETENTION_DAYS;
  const ms = new Date(trashedAt).getTime();
  if (!ms) return TRASH_RETENTION_DAYS;
  const elapsed = Date.now() - ms;
  return Math.max(0, TRASH_RETENTION_DAYS - Math.floor(elapsed / 86400000));
}

export default function TrashDialog({ open, onOpenChange, campaigns, onRestore, onPurge }) {
  const [purgeId, setPurgeId] = useState(null);
  const purgeTarget = campaigns.find((c) => c.id === purgeId);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="max-w-xl max-h-[80vh] overflow-y-auto scrollbar-thin">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Trash2 className="w-5 h-5 text-muted-foreground" /> Papirkurv</DialogTitle>
          <DialogDescription>Kampanjer her slettes permanent etter {TRASH_RETENTION_DAYS} dager. Du kan gjenopprette dem frem til da.</DialogDescription>
        </DialogHeader>

        {campaigns.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            <Trash2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">Papirkurven er tom.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {campaigns.map((c) => {
              const left = daysLeft(c.trashed_at);
              return (
                <div key={c.id} className="rounded-lg border border-border bg-card/60 p-3 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">{c.premise ? c.premise.slice(0, 80) : "Ingen premiss."}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={`text-xs font-semibold ${left <= 7 ? "text-destructive" : "text-amber-400"}`}>{left} dager igjen</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button size="sm" variant="outline" className="gap-1.5 h-8" onClick={() => onRestore(c.id)}>
                      <RotateCcw className="w-3.5 h-3.5" /> Gjenopprett
                    </Button>
                    <Button size="sm" variant="ghost" className="gap-1.5 h-8 text-destructive hover:text-destructive" onClick={() => setPurgeId(c.id)}>
                      <AlertTriangle className="w-3.5 h-3.5" /> Slett nå
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <AlertDialog open={!!purgeId} onOpenChange={(o) => !o && setPurgeId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Slett permanent nå?</AlertDialogTitle>
              <AlertDialogDescription>
                Dette sletter <span className="text-foreground font-medium">{purgeTarget?.title}</span> umiddelbart og kan ikke angres. All tilknyttet data (historie, karakterer, kart, økter) forblir.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Avbryt</AlertDialogCancel>
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={async () => { await onPurge(purgeId); setPurgeId(null); }}
              >
                Slett permanent
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
}