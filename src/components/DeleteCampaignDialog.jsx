import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, AlertTriangle } from "lucide-react";

// Ekstra bekreftelse for å flytte en kampanje til papirkurv (soft-delete).
// Kampanjen slettes ikke umiddelbart — den ligger 30 dager i papirkurven før permanent sletting.
export default function DeleteCampaignDialog({ open, onOpenChange, campaign, onConfirm }) {
  const [ack, setAck] = useState(false);

  useEffect(() => { if (open) setAck(false); }, [open, campaign?.id]);

  const submit = async () => {
    if (!ack || !campaign) return;
    await onConfirm(campaign);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="w-5 h-5" /> Flytt til papirkurv?
          </DialogTitle>
          <DialogDescription>
            Dette flytter <span className="text-foreground font-medium">{campaign?.title}</span> til papirkurven.
            Kampanjen <strong>slettes ikke umiddelbart</strong> — den ligger i 30 dager og kan gjenopprettes før den slettes permanent.
          </DialogDescription>
        </DialogHeader>
        <label className="flex items-start gap-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3 cursor-pointer">
          <Checkbox checked={ack} onCheckedChange={(v) => setAck(!!v)} className="mt-0.5" />
          <span className="text-sm text-muted-foreground leading-snug">
            Jeg forstår at kampanjen flyttes til papirkurv i 30 dager før permanent sletting. For å forhindre misbruk kan den ikke slettes umiddelbart.
          </span>
        </label>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Avbryt</Button>
          <Button variant="destructive" className="gap-1.5" disabled={!ack} onClick={submit}>
            <Trash2 className="w-4 h-4" /> Flytt til papirkurv
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}