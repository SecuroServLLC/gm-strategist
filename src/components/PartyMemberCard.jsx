import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { TOKEN_TYPES } from "@/lib/tokenTypes";

const KIND_LABEL = { character: "Karakter", token: "Brikke" };
const STATUS_STYLE = {
  active: "border-emerald-500/40 text-emerald-300",
  absent: "border-amber-500/40 text-amber-300",
  dead: "border-destructive/40 text-destructive",
};
const STATUS_LABEL = { active: "Aktiv", absent: "Fraværende", dead: "Død" };

export default function PartyMemberCard({ member, onEdit, onDelete }) {
  const tokenDef = member.kind === "token" ? (TOKEN_TYPES[member.token_type] || TOKEN_TYPES.animal) : null;
  const TokenIcon = tokenDef?.Icon;
  return (
    <Card className="glass-card hover:border-primary/40 transition-colors group">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-primary/30 text-primary/90">{KIND_LABEL[member.kind]}</Badge>
            <Badge variant="secondary" className={`border ${STATUS_STYLE[member.status] || ""}`}>{STATUS_LABEL[member.status]}</Badge>
            {member.kind === "token" && member.quantity > 1 && (
              <Badge variant="secondary">×{member.quantity}</Badge>
            )}
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(member)}><Pencil className="w-3.5 h-3.5" /></Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => onDelete(member.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
          </div>
        </div>
        <h3 className="font-heading text-lg leading-tight mb-1 flex items-center gap-1.5">{TokenIcon && <TokenIcon className="w-4 h-4 text-primary/70" />}{member.name}</h3>
        {member.description && <p className="text-sm text-muted-foreground line-clamp-3">{member.description}</p>}
      </CardContent>
    </Card>
  );
}