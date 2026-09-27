import React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function DiceConfigForm({ value, onChange }) {
  const v = value || {};
  const set = (k, val) => onChange({ ...v, [k]: val });

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <div><Label className="mb-1.5 block">Kjerneterning</Label><Input placeholder="f.eks. 1d20, 3d6, 2d10" value={v.core_dice || ""} onChange={(e) => set("core_dice", e.target.value)} /></div>
      <div><Label className="mb-1.5 block">Standard vanske (DC)</Label><Input type="number" value={v.difficulty_default ?? ""} onChange={(e) => set("difficulty_default", Number(e.target.value) || 0)} /></div>
      <div className="sm:col-span-2"><Label className="mb-1.5 block">Suksess-terskel / reglar</Label><Textarea rows={2} placeholder="f.eks. 'Slå DC eller høgare = suksess; 1 = fiasco; maks = perfeksjon'" value={v.success_threshold || ""} onChange={(e) => set("success_threshold", e.target.value)} /></div>
      <div className="sm:col-span-2"><Label className="mb-1.5 block">Fordel / ulempe-regel</Label><Textarea rows={2} placeholder="f.eks. 'Fordel: rull to, ta høgste. Ulempe: rull to, ta lågaste.'" value={v.advantage_rule || ""} onChange={(e) => set("advantage_rule", e.target.value)} /></div>
    </div>
  );
}