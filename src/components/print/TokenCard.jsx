import React from "react";
import { TOKEN_TYPES } from "@/lib/tokenTypes";

export default function TokenCard({ member }) {
  const t = TOKEN_TYPES[member.token_type] || TOKEN_TYPES.animal;
  const Icon = t.Icon;
  return (
    <div className="a6-card items-center text-center justify-center">
      <div className="w-28 h-28 rounded-full border-4 border-stone-500 flex items-center justify-center mb-6">
        <Icon className="w-16 h-16 text-stone-700" strokeWidth={1.4} />
      </div>
      <h3 className="font-heading text-5xl text-stone-900 leading-tight">{member.name}</h3>
      <p className="text-base uppercase tracking-[0.2em] text-stone-500 mt-2">{t.label}</p>
      {member.quantity > 1 && <p className="font-heading text-3xl text-stone-700 mt-2">×{member.quantity}</p>}
      {member.description && <p className="text-base text-stone-600 mt-4 leading-relaxed max-w-md">{member.description}</p>}
    </div>
  );
}