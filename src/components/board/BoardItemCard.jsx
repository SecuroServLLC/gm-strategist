import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ICON_MAP } from "@/lib/boardIcons";
import { COLOR_CLASSES } from "@/lib/boardLibrary";

export default function BoardItemCard({ item, selected, cellSize, onSelect, onMove, onResize, onCommit, onDelete }) {
  const cc = COLOR_CLASSES[item.color] || COLOR_CLASSES.slate;
  const Icon = ICON_MAP[item.icon] || ICON_MAP.MapPin;

  const startMove = (e) => {
    e.stopPropagation();
    onSelect(item.id);
    const sx = e.clientX, sy = e.clientY, ox = item.x, oy = item.y;
    const move = (ev) => {
      const nx = Math.max(0, ox + Math.round((ev.clientX - sx) / cellSize));
      const ny = Math.max(0, oy + Math.round((ev.clientY - sy) / cellSize));
      onMove(item.id, nx, ny);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      onCommit(item.id);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  const startResize = (e) => {
    e.stopPropagation();
    onSelect(item.id);
    const sx = e.clientX, sy = e.clientY, ow = item.w, oh = item.h;
    const move = (ev) => {
      const nw = Math.max(1, ow + Math.round((ev.clientX - sx) / cellSize));
      const nh = Math.max(1, oh + Math.round((ev.clientY - sy) / cellSize));
      onResize(item.id, nw, nh);
    };
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
      onCommit(item.id);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  };

  return (
    <div
      onPointerDown={startMove}
      onClick={(e) => { e.stopPropagation(); onSelect(item.id); }}
      style={{
        left: item.x * cellSize, top: item.y * cellSize,
        width: item.w * cellSize, height: item.h * cellSize,
        touchAction: "none",
      }}
      className={cn(
        "absolute rounded-lg border flex flex-col items-center justify-center gap-1 p-1 cursor-move select-none transition-shadow",
        cc.chip,
        selected && "ring-2 " + cc.ring
      )}
    >
      <Icon className="w-5 h-5 shrink-0" />
      <span className="text-[10px] leading-tight text-center truncate w-full px-0.5">{item.label}</span>
      <button
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
        className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-destructive/80 text-destructive-foreground flex items-center justify-center hover:bg-destructive"
      >
        <X className="w-2.5 h-2.5" />
      </button>
      <button
        onPointerDown={startResize}
        className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-foreground/25 hover:bg-foreground/40 rounded-tl cursor-nwse-resize"
        style={{ touchAction: "none" }}
      />
    </div>
  );
}