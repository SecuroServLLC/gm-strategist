import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { base44 } from "@/api/base44Client";
import { Sparkles, Loader2 } from "lucide-react";

export default function CreateCharacterSheet({
  open,
  onOpenChange,
  campaignId,
  setting,
  tagId,
  onCreated,
}) {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!prompt.trim() || !tagId) return;
    setBusy(true);
    try {
      const res = await base44.functions.invoke("generateCharacter", {
        prompt,
        setting,
        withPortrait: true,
      });
      const character = res.data?.character;
      if (!character) throw new Error("Ingen karakter returnert");
      const created = await base44.entities.Character.create({
        ...character,
        campaign_id: campaignId,
        role: character.role || "npc",
      });
      await base44.entities.NfcTag.create({
        campaign_id: campaignId,
        tag_id: tagId,
        target_type: "character",
        target_id: created.id,
      });
      onCreated(created);
      setPrompt("");
      onOpenChange(false);
    } catch (e) {
      alert("Feil: " + e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
        <SheetHeader>
          <SheetTitle>Lag ny karakter</SheetTitle>
          <SheetDescription>Koble ny karakter til tag {tagId}.</SheetDescription>
        </SheetHeader>
        <div className="flex-1 overflow-y-auto scrollbar-thin mt-4 pr-1">
          <Label className="text-xs">Beskrivelse</Label>
          <Textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="mt-1"
            placeholder="f.eks. 'En aldende tjuv fra havnebyen med en protese og et hemmelig hjerte'"
          />
        </div>
        <SheetFooter className="mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Avbryt
          </Button>
          <Button onClick={run} disabled={busy || !prompt.trim()} className="gap-2">
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {busy ? "Genererer…" : "Generer & koble"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}