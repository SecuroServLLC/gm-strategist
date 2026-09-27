import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCampaign } from "@/hooks/useCampaign";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Printer, FileDown } from "lucide-react";
import NpcCard from "@/components/print/NpcCard";
import TokenCard from "@/components/print/TokenCard";

export default function Utskrift() {
  const { campaign, loading } = useCampaign();
  const [npcs, setNpcs] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!campaign) return;
    let active = true;
    (async () => {
      try {
        const [chars, members] = await Promise.all([
          base44.entities.Character.filter({ campaign_id: campaign.id }),
          base44.entities.PartyMember.filter({ campaign_id: campaign.id, kind: "token" }),
        ]);
        if (!active) return;
        const npcList = chars.filter((c) => c.role !== "protagonist");
        setNpcs(npcList);
        setTokens(members);
        setSelected(new Set([...npcList.map((c) => c.id), ...members.map((m) => m.id)]));
      } catch (e) {}
    })();
    return () => { active = false; };
  }, [campaign?.id]);

  const toggle = (id) => setSelected((s) => {
    const n = new Set(s);
    if (n.has(id)) n.delete(id); else n.add(id);
    return n;
  });

  const cards = [];
  npcs.forEach((c) => { if (selected.has(c.id)) cards.push({ key: "c" + c.id, el: <NpcCard character={c} /> }); });
  tokens.forEach((m) => { if (selected.has(m.id)) cards.push({ key: "m" + m.id, el: <TokenCard member={m} /> }); });

  const pages = [];
  for (let i = 0; i < cards.length; i += 4) pages.push(cards.slice(i, i + 4));

  const print = () => window.print();

  const downloadPdf = async () => {
    if (pages.length === 0) return;
    setBusy(true);
    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const nodes = document.querySelectorAll(".a4-page");
      for (let i = 0; i < nodes.length; i++) {
        const canvas = await html2canvas(nodes[i], { scale: 2, useCORS: true, backgroundColor: "#ffffff" });
        const img = canvas.toDataURL("image/jpeg", 0.92);
        if (i > 0) pdf.addPage();
        pdf.addImage(img, "JPEG", 0, 0, 210, 297);
      }
      pdf.save("utskrift.pdf");
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  }
  if (!campaign) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Printer className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="mb-4">Du trenger en kampanje først.</p>
          <Link to="/kampanje"><Button variant="outline">Opprett rød tråd</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="print-root h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="no-print flex items-center gap-3 mb-2">
          <Printer className="w-6 h-6 text-primary" />
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Utskrift</span>
        </div>
        <h1 className="no-print font-heading text-4xl mb-1">A6-ark &amp; brikkekort</h1>
        <p className="no-print text-muted-foreground text-lg mb-6">Fire A6-ark per A4-side. Klikk navn for å ta arkt bort/tilbake.</p>

        <div className="no-print flex flex-wrap gap-3 mb-8">
          <Button className="gap-2" onClick={print} disabled={cards.length === 0}><Printer className="w-4 h-4" /> Skriv ut</Button>
          <Button variant="outline" className="gap-2" onClick={downloadPdf} disabled={cards.length === 0 || busy}><FileDown className="w-4 h-4" /> {busy ? "Lager PDF…" : "Last ned PDF"}</Button>
        </div>

        <div className="no-print mb-8">
          <p className="text-xs uppercase tracking-widest text-muted-foreground mb-2">NPC-er ({npcs.length})</p>
          <div className="flex flex-wrap gap-2">
            {npcs.length === 0 && <span className="text-sm text-muted-foreground">Ingen NPC-er enda.</span>}
            {npcs.map((c) => (
              <button key={c.id} onClick={() => toggle(c.id)} className={cn("px-3 py-1.5 rounded-full text-xs border transition-colors", selected.has(c.id) ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground")}>
                {c.name}
              </button>
            ))}
          </div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground mt-4 mb-2">Brikker ({tokens.length})</p>
          <div className="flex flex-wrap gap-2">
            {tokens.length === 0 && <span className="text-sm text-muted-foreground">Ingen brikker enda.</span>}
            {tokens.map((m) => (
              <button key={m.id} onClick={() => toggle(m.id)} className={cn("px-3 py-1.5 rounded-full text-xs border transition-colors", selected.has(m.id) ? "border-primary bg-primary/15 text-primary" : "border-border text-muted-foreground")}>
                {m.name}{m.quantity > 1 ? ` ×${m.quantity}` : ""}
              </button>
            ))}
          </div>
        </div>

        {cards.length === 0 ? (
          <p className="no-print text-sm text-muted-foreground text-center py-10">Ingen arkt valgt. Opprett NPC-er og brikker, eller velg arkt over.</p>
        ) : (
          <div className="print-doc space-y-4">
            {pages.map((page, pi) => (
              <div key={pi} className="a4-page">
                {page.map((card) => <React.Fragment key={card.key}>{card.el}</React.Fragment>)}
                {Array.from({ length: 4 - page.length }).map((_, i) => <div key={"e" + i} />)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}