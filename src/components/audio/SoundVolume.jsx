import React, { useId } from 'react';

export default function SoundVolume({ label, value, onChange }) {
  const id = useId();
  return <div className="space-y-2 min-w-0">
    <div className="flex items-center justify-between gap-3 text-xs">
      <label htmlFor={id} className="text-muted-foreground">{label}</label>
      <output htmlFor={id}>{value}%</output>
    </div>
    <input id={id} type="range" min="0" max="100" step="1" value={value} onChange={(event) => onChange(Number(event.target.value))} className="w-full h-6 cursor-pointer accent-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded" />
  </div>;
}