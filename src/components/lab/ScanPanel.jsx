import React from "react";
import { Radio, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const TONE = {
  idle: "text-muted-foreground",
  scanning: "text-primary",
  hit: "text-emerald-400",
  miss: "text-amber-400",
  error: "text-destructive",
};

export default function ScanPanel({ supported, scanning, status, statusText, onScan, onCancel }) {
  return (
    <div className="flex flex-col items-center text-center py-6">
      <button
        onClick={scanning ? onCancel : onScan}
        disabled={!supported}
        className={cn(
          "relative w-32 h-32 rounded-full border-2 flex items-center justify-center transition-all",
          scanning
            ? "border-primary bg-primary/10 animate-pulse"
            : "border-primary/40 bg-accent/30 hover:border-primary hover:bg-accent/50",
          !supported && "opacity-40 cursor-not-allowed"
        )}
      >
        {scanning ? (
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        ) : (
          <Radio className="w-12 h-12 text-primary" />
        )}
      </button>
      <p className="mt-5 font-heading text-lg">{scanning ? "Venter på tag…" : "Scan brikke"}</p>
      {!supported && (
        <p className="mt-2 text-sm text-destructive flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4" /> NFC-støtte krever Android Chrome
        </p>
      )}
      <div className={cn("mt-3 text-sm font-medium", TONE[status] || "text-muted-foreground")}>
        {statusText}
      </div>
    </div>
  );
}