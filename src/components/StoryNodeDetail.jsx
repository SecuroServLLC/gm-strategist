import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Trash2, X, Dices, Lightbulb, GitBranch } from "lucide-react";

const TYPES = [
  { value: "scene", label: "Scene" },
  { value: "choice", label: "Valg" },
  { value: "dice_challenge", label: "Terningkast" },
  { value: "event", label: "Hendelse" },
  { value: "climax", label: "Klimaks" },
  { value: "ending", label: "Slutt" },
];

export default function StoryNodeDetail({ node, onChange, onDelete, onClose }) {
  if (!node) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center px-6">
        <GitBranch className="w-10 h-10 text-primary/30 mb-3" />
        <p className="text-muted-foreground text-sm">Velg en node for å redigere detaljer, eller legg til en ny scene.</p>
      </div>
    );
  }

  const set = (k, v) => onChange(node.id, { [k]: v });

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          <h3 className="font-heading text-lg">Nodedetaljer</h3>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin px-5 py-5 space-y-5">
        <div>
          <Label className="text-xs">Tittel</Label>
          <Input value={node.title} onChange={(e) => set("title", e.target.value)} className="mt-1.5" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Type</Label>
            <Select value={node.node_type} onValueChange={(v) => set("node_type", v)}>
              <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
              <SelectContent>
                {TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Gren-etikett</Label>
            <Input value={node.branch_label || ""} onChange={(e) => set("branch_label", e.target.value)} placeholder="f.eks. 'Snu vestover'" className="mt-1.5" />
          </div>
        </div>

        <div>
          <Label className="text-xs">Oppsummering (på kartet)</Label>
          <Textarea value={node.summary || ""} onChange={(e) => set("summary", e.target.value)} rows={2} className="mt-1.5" />
        </div>

        <div>
          <Label className="text-xs">Detaljert scenebeskrivelse</Label>
          <Textarea value={node.description || ""} onChange={(e) => set("description", e.target.value)} rows={5} className="mt-1.5" />
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-rose-300">
            <Dices className="w-3.5 h-3.5" />
            <Label className="text-xs">Terningkast-forslag</Label>
          </div>
          <Input value={node.dice_suggestion || ""} onChange={(e) => set("dice_suggestion", e.target.value)} placeholder="f.eks. Smidighet DC 14" />
          <div className="grid grid-cols-1 gap-2 mt-1">
            <div>
              <Label className="text-[11px] text-muted-foreground">Suksess-utfall</Label>
              <Textarea value={node.success_outcome || ""} onChange={(e) => set("success_outcome", e.target.value)} rows={2} />
            </div>
            <div>
              <Label className="text-[11px] text-muted-foreground">Svikt-utfall</Label>
              <Textarea value={node.failure_outcome || ""} onChange={(e) => set("failure_outcome", e.target.value)} rows={2} />
            </div>
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-amber-300">
            <Lightbulb className="w-3.5 h-3.5" />
            <Label className="text-xs">Hint (én per linje)</Label>
          </div>
          <Textarea
            value={(node.hints || []).join("\n")}
            onChange={(e) => set("hints", e.target.value.split("\n").map((s) => s.trim()).filter(Boolean))}
            rows={3}
            placeholder="Hint GM kan slippe her..."
          />
        </div>
      </div>

      <div className="px-5 py-3.5 border-t border-border">
        <Button variant="ghost" className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 w-full gap-2" onClick={() => onDelete(node)}>
          <Trash2 className="w-4 h-4" /> Slett node
        </Button>
      </div>
    </div>
  );
}