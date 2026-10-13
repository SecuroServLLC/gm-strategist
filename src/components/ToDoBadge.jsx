import React from "react";

export default function ToDoBadge({ children }) {
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30 whitespace-nowrap">
      [To Do]{children ? ` ${children}` : ""}
    </span>
  );
}