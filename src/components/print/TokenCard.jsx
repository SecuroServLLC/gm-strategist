import React from "react";
import { TOKEN_TYPES } from "@/lib/tokenTypes";

export default function TokenCard({ member }) {
  const t = TOKEN_TYPES[member.token_type] || TOKEN_TYPES.animal;
  const Icon = t.Icon;
  return (
    <div className="a6-card items-center text-center justify-center">
      <div className="w-16 h-16 rounded-full border-2 border-stone-400 flex items-center justify-center mb-3">
        <Icon className="w-9 h-9 text-stone-700" strokeWidth={1.6} />
      </div>
      <h3 className="font-heading text-2xl text-stone-900 leading-tight">{member.name}</h3>
      <p className="text-xs uppercase tracking-widest text-stone-500 mt-1">{t.label}</p>
      {member.quantity > 1 && <p className="font-heading text-lg text-stone-700 mt-1">×{member.quantity}</p>}
      {member.description && <p className="text-[11px] text-stone-600 mt-2 leading-snug">{member.description}</p>}
    </div>
  );
}