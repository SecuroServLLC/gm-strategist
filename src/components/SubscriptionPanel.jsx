import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { TIERS, FREE_TEST_QUOTA } from "@/lib/subscription";

// Abonnementspanel — foreløpig "Kommer snart". Betaling er deaktivert i testfasen.
export default function SubscriptionPanel({ open, onOpenChange, activeCount }) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onOpenChange(false)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-primary" /> Abonnement & Campaign Credits</DialogTitle>
          <DialogDescription>
            I testfasen er alt gratis — du kan ha inntil {FREE_TEST_QUOTA} aktive kampanjer. Betalingsnivåene under aktiveres snart.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 mb-3">
          <span className="text-sm text-muted-foreground">Din bruk</span>
          <span className="text-sm font-semibold text-primary">{activeCount} / {FREE_TEST_QUOTA} kampanjer</span>
        </div>

        <div className="space-y-2.5">
          {TIERS.map((t) => (
            <div key={t.id} className={`rounded-lg border p-3 ${t.upcoming ? "border-border bg-card/40 opacity-70" : "border-primary/40 bg-primary/5"}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-heading text-lg">{t.name}</span>
                {t.upcoming ? (
                  <Badge variant="secondary" className="text-[10px]">Kommer snart</Badge>
                ) : (
                  <Badge className="text-[10px]">Aktiv (testfase)</Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground leading-snug">{t.blurb}</p>
              <div className="flex items-center gap-1.5 mt-1.5 text-xs text-muted-foreground/80">
                <Check className="w-3.5 h-3.5 text-primary/70" /> Opptil {t.campaigns} aktive kampanjer
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground/70 text-center">
          Betaling og "Campaign Credits" er forberedt i bakgrunnen og vil være tilgjengelig snart.
        </p>
      </DialogContent>
    </Dialog>
  );
}