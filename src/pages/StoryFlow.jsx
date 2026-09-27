import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCampaign } from "@/hooks/useCampaign";
import StoryCanvas from "@/components/StoryCanvas";
import StoryNodeDetail from "@/components/StoryNodeDetail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Workflow, Plus, Sparkles, Loader2, X, Check, ScrollText, ChevronRight, Dices } from "lucide-react";

export default function StoryFlow() {
  const { campaign, loading: loadingCampaign } = useCampaign();
  const [nodes, setNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);

  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [suggestions, setSuggestions] = useState(null);
  const [suggestParent, setSuggestParent] = useState(null);
  const [direction, setDirection] = useState("");

  const loadNodes = useCallback(async () => {
    if (!campaign) return;
    setLoading(true);
    try {
      const list = await base44.entities.StoryNode.filter({ campaign_id: campaign.id });
      setNodes(list);
      if (!selectedId && list.length) setSelectedId(list[0].id);
    } finally {
      setLoading(false);
    }
  }, [campaign]);

  useEffect(() => { loadNodes(); }, [loadNodes]);

  const selected = nodes.find((n) => n.id === selectedId) || null;

  const updatePosition = async (id, x, y) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, position_x: x, position_y: y } : n)));
    try { await base44.entities.StoryNode.update(id, { position_x: x, position_y: y }); } catch (e) {}
  };

  const updateNode = async (id, data) => {
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, ...data } : n)));
    try { await base44.entities.StoryNode.update(id, data); } catch (e) {}
  };

  const deleteNode = async (node) => {
    // slett også barna for å unngå løse tråder
    const children = nodes.filter((n) => n.parent_id === node.id);
    try {
      await base44.entities.StoryNode.delete(node.id);
      for (const c of children) { await base44.entities.StoryNode.delete(c.id); }
      setNodes((prev) => prev.filter((n) => n.id !== node.id && n.parent_id !== node.id));
      if (selectedId === node.id) setSelectedId(null);
    } catch (e) {}
  };

  const addRoot = async () => {
    const created = await base44.entities.StoryNode.create({
      campaign_id: campaign.id,
      parent_id: null,
      title: "Startscene",
      summary: "Der alt begynner.",
      node_type: "scene",
      description: "",
      position_x: 80,
      position_y: 80,
    });
    setNodes((prev) => [...prev, created]);
    setSelectedId(created.id);
  };

  const addChild = async (parent) => {
    const childCount = nodes.filter((n) => n.parent_id === parent.id).length;
    const created = await base44.entities.StoryNode.create({
      campaign_id: campaign.id,
      parent_id: parent.id,
      title: "Ny scene",
      summary: "",
      node_type: "scene",
      description: "",
      position_x: (parent.position_x || 0) - 120 + childCount * 280,
      position_y: (parent.position_y || 0) + 200,
    });
    setNodes((prev) => [...prev, created]);
    setSelectedId(created.id);
  };

  const openSuggest = (node) => {
    setSuggestParent(node);
    setSuggestions(null);
    setDirection("");
    setSuggestOpen(true);
  };

  const runSuggest = async () => {
    setSuggesting(true);
    try {
      const res = await base44.functions.invoke("suggestStoryExpansion", {
        parentNode: suggestParent ? { title: suggestParent.title, summary: suggestParent.summary, description: suggestParent.description } : null,
        campaign: campaign ? { premise: campaign.premise, hints: campaign.hints, constraints: campaign.constraints } : null,
        direction,
      });
      setSuggestions(res.data);
    } catch (e) {
      setSuggestions({ error: e.message });
    } finally {
      setSuggesting(false);
    }
  };

  const acceptSuggestion = async (s) => {
    const childCount = nodes.filter((n) => n.parent_id === suggestParent.id).length;
    const created = await base44.entities.StoryNode.create({
      campaign_id: campaign.id,
      parent_id: suggestParent.id,
      title: s.title,
      summary: s.summary,
      node_type: s.node_type || "scene",
      description: s.description || "",
      dice_suggestion: s.dice_suggestion || "",
      success_outcome: s.success_outcome || "",
      failure_outcome: s.failure_outcome || "",
      branch_label: s.branch_label || "",
      hints: s.hints || [],
      position_x: (suggestParent.position_x || 0) - 160 + childCount * 300,
      position_y: (suggestParent.position_y || 0) + 200,
    });
    setNodes((prev) => [...prev, created]);
    setSelectedId(created.id);
    // fjern akseptert fra listen
    if (suggestions?.suggested_nodes) {
      setSuggestions({ ...suggestions, suggested_nodes: suggestions.suggested_nodes.filter((x) => x !== s) });
    }
  };

  if (loadingCampaign) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="glass-card max-w-md">
          <CardContent className="p-8 text-center">
            <ScrollText className="w-10 h-10 text-primary mx-auto mb-4" />
            <h2 className="font-heading text-2xl mb-2">Ingen kampanje</h2>
            <p className="text-muted-foreground mb-5">Du må opprette den røde tråden før du kan bygge historie-flyten.</p>
            <Link to="/kampanje"><Button className="gap-2"><ScrollText className="w-4 h-4" /> Opprett rød tråd</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-8 py-5 border-b border-border flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <Workflow className="w-4 h-4 text-primary" />
            <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Historie-flyt</span>
          </div>
          <h1 className="font-heading text-2xl">{campaign.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          {!nodes.length && (
            <Button onClick={addRoot} className="gap-2">
              <Plus className="w-4 h-4" /> Startscene
            </Button>
          )}
          <Button variant="outline" onClick={() => openSuggest(null)} disabled={loading} className="gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> Foreslå fra start
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex">
        <div className="flex-1 min-w-0 p-4">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : (
            <StoryCanvas
              nodes={nodes}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onUpdatePosition={updatePosition}
              onAddChild={addChild}
              onSuggest={openSuggest}
              loadingSuggest={suggesting}
            />
          )}
        </div>

        <aside className="w-80 shrink-0 border-l border-border bg-card/40">
          <StoryNodeDetail
            node={selected}
            onChange={updateNode}
            onDelete={deleteNode}
            onClose={() => setSelectedId(null)}
          />
        </aside>
      </div>

      {/* Suggest dialog */}
      <Dialog open={suggestOpen} onOpenChange={setSuggestOpen}>
        <DialogContent className="max-w-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              {suggestParent ? `Utvid "${suggestParent.title}"` : "Foreslå startscener"}
            </DialogTitle>
          </DialogHeader>

          {!suggestions ? (
            <div className="space-y-4 py-2">
              <div>
                <Label className="text-sm">Ønsket retning (valgfritt)</Label>
                <Input
                  value={direction}
                  onChange={(e) => setDirection(e.target.value)}
                  placeholder="f.eks. 'La spillerne møte en mistenkelig kjøpmann'"
                  className="mt-1.5"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                AIen foreslår 2–3 naturlige utvidelser med terningkast-forslag og utfall, basert på den røde tråden.
              </p>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setSuggestOpen(false)}>Avbryt</Button>
                <Button onClick={runSuggest} disabled={suggesting} className="gap-2">
                  {suggesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  {suggesting ? "Tenker..." : "Foreslå utvidelse"}
                </Button>
              </DialogFooter>
            </div>
          ) : suggestions.error ? (
            <div className="py-4 text-rose-400 text-sm">Noe gikk galt: {suggestions.error}</div>
          ) : (
            <div className="space-y-4">
              {suggestions.narrative_note && (
                <p className="text-sm text-muted-foreground italic font-heading border-l-2 border-primary/40 pl-3">
                  {suggestions.narrative_note}
                </p>
              )}
              <ScrollArea className="max-h-[50vh]">
                <div className="space-y-3 pr-2">
                  {(suggestions.suggested_nodes || []).map((s, i) => (
                    <Card key={i} className="glass-card">
                      <CardContent className="p-4 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="font-heading text-base">{s.title}</h4>
                            <p className="text-xs text-muted-foreground capitalize">{s.node_type?.replace("_", " ")}</p>
                          </div>
                          <Button size="sm" onClick={() => acceptSuggestion(s)} className="gap-1.5 shrink-0">
                            <Check className="w-3.5 h-3.5" /> Legg til
                          </Button>
                        </div>
                        <p className="text-sm text-foreground/80">{s.summary}</p>
                        {s.dice_suggestion && (
                          <div className="flex items-center gap-1.5 text-xs text-rose-300">
                            <Dices className="w-3.5 h-3.5" /> {s.dice_suggestion}
                          </div>
                        )}
                        {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
                        {s.hints?.length > 0 && (
                          <div className="flex flex-wrap gap-1 pt-1">
                            {s.hints.map((h, j) => (
                              <span key={j} className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">{h}</span>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                  {!suggestions.suggested_nodes?.length && (
                    <p className="text-sm text-muted-foreground text-center py-4">Ingen forslag. Prøv en annen retning.</p>
                  )}
                </div>
              </ScrollArea>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setSuggestOpen(false)}>Lukk</Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}