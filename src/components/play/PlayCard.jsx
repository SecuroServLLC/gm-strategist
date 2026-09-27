import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Heart, X, Clock, RotateCcw } from "lucide-react";
import { TOKEN_TYPES } from "@/lib/tokenTypes";

const STATUS_DOT = { active: "bg-emerald-400", absent: "bg-amber-400", dead: "bg-destructive" };

export default function PlayCard({ member, onUpdate }) {
  const [condName, setCondName] = useState("");
  const [condRounds, setCondRounds] = useState("");
  const [resName, setResName] = useState("");
  const [resMax, setResMax] = useState("");

  const cur = member.current_hp ?? 0;
  const max = member.max_hp ?? 0;
  const hpPct = max > 0 ? Math.max(0, Math.min(100, (cur / max) * 100)) : 0;
  const hpColor = hpPct > 50 ? "bg-emerald-500" : hpPct > 20 ? "bg-amber-500" : "bg-red-500";

  const setHp = (d) => onUpdate(member.id, { current_hp: Math.max(0, Math.min(max || 9999, cur + d)) });
  const setMax = (v) => {
    const n = Math.max(0, Number(v) || 0);
    onUpdate(member.id, { max_hp: n, current_hp: Math.min(cur, n) });
  };

  const addCond = () => {
    if (!condName.trim()) return;
    const conditions = [...(member.conditions || []), { name: condName.trim(), rounds: Number(condRounds) || 0 }];
    onUpdate(member.id, { conditions });
    setCondName(""); setCondRounds("");
  };
  const removeCond = (i) => onUpdate(member.id, { conditions: (member.conditions || []).filter((_, j) => j !== i) });
  const tickConds = () => {
    const conditions = (member.conditions || []).flatMap((c) => {
      if (c.rounds > 0) { const n = c.rounds - 1; return n > 0 ? [{ ...c, rounds: n }] : []; }
      return [c];
    });
    onUpdate(member.id, { conditions });
  };

  const addRes = () => {
    if (!resName.trim()) return;
    const m = Number(resMax) || 0;
    onUpdate(member.id, { resources: [...(member.resources || []), { name: resName.trim(), current: m, max: m }] });
    setResName(""); setResMax("");
  };
  const adjRes = (i, d) => {
    const resources = (member.resources || []).map((r, j) =>
      j === i ? { ...r, current: Math.max(0, Math.min(r.max || 9999, (r.current || 0) + d)) } : r);
    onUpdate(member.id, { resources });
  };
  const removeRes = (i) => onUpdate(member.id, { resources: (member.resources || []).filter((_, j) => j !== i) });
  const restAll = () => onUpdate(member.id, { resources: (member.resources || []).map((r) => ({ ...r, current: r.max || 0 })) });

  const tokenDef = member.kind === "token" ? (TOKEN_TYPES[member.token_type] || TOKEN_TYPES.animal) : null;
  const TokenIcon = tokenDef?.Icon;

  return (
    <Card className="glass-card">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          {TokenIcon && <TokenIcon className="w-4 h-4 text-primary/70 shrink-0" />}
          <h3 className="font-heading text-lg leading-tight flex-1 truncate">{member.name}</h3>
          <span className={`w-2.5 h-2.5 rounded-full ${STATUS_DOT[member.status] || "bg-muted-foreground"}`} title={member.status} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Heart className="w-4 h-4 text-red-400 shrink-0" />
            <Button size="icon" variant="outline" className="h-7 w-7 shrink-0" onClick={() => setHp(-1)}><Minus className="w-3.5 h-3.5" /></Button>
            <span className="font-mono text-lg w-10 text-center">{cur}</span>
            <span className="text-muted-foreground">/</span>
            <Input type="number" className="h-7 w-16" value={max || ""} onChange={(e) => setMax(e.target.value)} placeholder="max" />
            <Button size="icon" variant="outline" className="h-7 w-7 shrink-0" onClick={() => setHp(1)}><Plus className="w-3.5 h-3.5" /></Button>
          </div>
          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div className={`h-full transition-all ${hpColor}`} style={{ width: `${hpPct}%` }} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Tilstander</span>
            <Button size="sm" variant="ghost" className="h-6 px-2 gap-1 text-xs" onClick={tickConds} disabled={!(member.conditions || []).some((c) => c.rounds > 0)}>
              <Clock className="w-3 h-3" /> −1 runde
            </Button>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2 min-h-[24px]">
            {(member.conditions || []).map((c, i) => (
              <Badge key={i} variant="outline" className="gap-1 border-amber-500/40 text-amber-300 pr-1">
                {c.name}{c.rounds > 0 && ` (${c.rounds})`}
                <button onClick={() => removeCond(i)} className="ml-0.5 hover:text-foreground"><X className="w-3 h-3" /></button>
              </Badge>
            ))}
            {(member.conditions || []).length === 0 && <span className="text-xs text-muted-foreground">Ingen aktive</span>}
          </div>
          <div className="flex gap-1.5">
            <Input className="h-7" value={condName} onChange={(e) => setCondName(e.target.value)} placeholder="f.eks. Forgiftet" onKeyDown={(e) => e.key === "Enter" && addCond()} />
            <Input className="h-7 w-16" type="number" value={condRounds} onChange={(e) => setCondRounds(e.target.value)} placeholder="rund" onKeyDown={(e) => e.key === "Enter" && addCond()} />
            <Button size="icon" variant="outline" className="h-7 w-7 shrink-0" onClick={addCond}><Plus className="w-3.5 h-3.5" /></Button>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Ressursar (per kvile)</span>
            <Button size="sm" variant="ghost" className="h-6 px-2 gap-1 text-xs" onClick={restAll} disabled={(member.resources || []).length === 0}>
              <RotateCcw className="w-3 h-3" /> Kvile
            </Button>
          </div>
          <div className="space-y-1 mb-2">
            {(member.resources || []).map((r, i) => (
              <div key={i} className="flex items-center gap-1.5 text-sm group">
                <span className="flex-1 truncate">{r.name}</span>
                <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => adjRes(i, -1)}><Minus className="w-3 h-3" /></Button>
                <span className="font-mono w-14 text-center">{r.current}/{r.max}</span>
                <Button size="icon" variant="outline" className="h-6 w-6" onClick={() => adjRes(i, 1)}><Plus className="w-3 h-3" /></Button>
                <button onClick={() => removeRes(i)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            {(member.resources || []).length === 0 && <span className="text-xs text-muted-foreground">Ingen registrert</span>}
          </div>
          <div className="flex gap-1.5">
            <Input className="h-7" value={resName} onChange={(e) => setResName(e.target.value)} placeholder="f.eks. Sinn, Omtale" onKeyDown={(e) => e.key === "Enter" && addRes()} />
            <Input className="h-7 w-16" type="number" value={resMax} onChange={(e) => setResMax(e.target.value)} placeholder="maks" onKeyDown={(e) => e.key === "Enter" && addRes()} />
            <Button size="icon" variant="outline" className="h-7 w-7 shrink-0" onClick={addRes}><Plus className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}