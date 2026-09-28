import React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Users, Backpack } from "lucide-react";

export default function LinkTargetSheet({ open, onOpenChange, characters, partyMembers, onLink }) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Koble tag til</SheetTitle>
          <SheetDescription>Velg en karakter eller følgesvenn fra kampanjen.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto scrollbar-thin space-y-6 mt-4 pr-1">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Karakterer
            </p>
            <div className="space-y-1">
              {characters.length === 0 && (
                <p className="text-sm text-muted-foreground italic">Ingen karakterer.</p>
              )}
              {characters.map((c) => (
                <button
                  key={c.id}
                  onClick={() => onLink("character", c.id)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent/60 border border-transparent hover:border-primary/30 transition-colors text-sm"
                >
                  {c.name}
                  {c.archetype && (
                    <span className="text-muted-foreground text-xs ml-2">{c.archetype}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1.5">
              <Backpack className="w-3.5 h-3.5" /> Følgesvenner
            </p>
            <div className="space-y-1">
              {partyMembers.length === 0 && (
                <p className="text-sm text-muted-foreground italic">Ingen følgesvenner.</p>
              )}
              {partyMembers.map((m) => (
                <button
                  key={m.id}
                  onClick={() => onLink("party_member", m.id)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-accent/60 border border-transparent hover:border-primary/30 transition-colors text-sm"
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}