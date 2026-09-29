import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

export function Splash() {
  return (
    <div className="h-screen flex items-center justify-center bg-background">
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
    </div>
  );
}

export function Unknown({ note }) {
  return (
    <div className="h-screen flex flex-col items-center justify-center px-6 text-center bg-background text-foreground">
      <AlertTriangle className="w-10 h-10 text-amber-400 mb-3" />
      <h1 className="font-heading text-2xl">Ukjent enhet</h1>
      <p className="text-sm text-muted-foreground mt-1">{note || "Denne ID-en er ikke registrert."}</p>
    </div>
  );
}