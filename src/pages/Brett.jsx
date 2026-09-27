import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCampaign } from "@/hooks/useCampaign";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MapPin, Plus, Library } from "lucide-react";
import { COLOR_CLASSES, COLOR_LEGEND } from "@/lib/boardLibrary";
import BoardSidebar from "@/components/board/BoardSidebar";
import BoardItemCard from "@/components/board/BoardItemCard";
import StyleSelector from "@/components/board/StyleSelector";
import FlowOverlay from "@/components/board/FlowOverlay";
import FlowPanel from "@/components/board/FlowPanel";
import KeyLockPanel from "@/components/board/KeyLockPanel";
import KeyLockOverlay from "@/components/board/KeyLockOverlay";
import RoguelikePanel from "@/components/board/RoguelikePanel";

const CELL = 28;
const COLS = 60;
const ROWS = 40;

export default function Brett() {
  const { campaign, loading } = useCampaign();
  const [items, setItems] = useState([]);
  const [boards, setBoards] = useState(["Hovedbrett"]);
  const [activeBoard, setActiveBoard] = useState("Hovedbrett");
  const [selectedId, setSelectedId] = useState(null);
  const [newBoard, setNewBoard] = useState("");
  const [style, setStyle] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [keyLock, setKeyLock] = useState(null);
  const [keyLockLoading, setKeyLockLoading] = useState(false);
  const [nodesResult, setNodesResult] = useState(null);
  const [nodesLoading, setNodesLoading] = useState(false);
  const [visited, setVisited] = useState([]);
  const canvasRef = useRef(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;

  useEffect(() => {
    if (!campaign) return;
    let active = true;
    (async () => {
      try {
        const its = await base44.entities.BoardItem.filter({ campaign_id: campaign.id });
        if (!active) return;
        setItems(its);
        const names = [...new Set(its.map((i) => i.board))];
        setBoards((prev) => Array.from(new Set([...prev, ...names])));
      } catch (e) {}
    })();
    return () => { active = false; };
  }, [campaign?.id]);

  const boardItems = items.filter((i) => i.board === activeBoard);
  const selected = boardItems.find((i) => i.id === selectedId) || null;
  const rolesMap = (analysis?.roles || []).reduce((m, r) => { m[r.room_id] = r.role; return m; }, {});
  const badgesMap = { ...rolesMap };
  (keyLock?.keyPlacements || []).forEach((p) => {
    if (p.door_id) badgesMap[p.door_id] = "lock";
    if (p.key_room_id) badgesMap[p.key_room_id] = "key";
  });
  const nodesMap = (nodesResult?.nodes || []).reduce((m, n) => { m[n.room_id] = n; return m; }, {});
  const branches = nodesResult?.branches || [];
  const entrance = nodesResult?.entrance_id;
  const visitedSet = new Set(visited);
  const reachable = (() => {
    const r = new Set(entrance ? [entrance] : []);
    let changed = true;
    while (changed) {
      changed = false;
      branches.forEach((b) => { if (r.has(b.from) && !r.has(b.to)) { r.add(b.to); changed = true; } });
    }
    return r;
  })();
  const available = visited.length === 0
    ? (entrance ? [entrance] : [])
    : Array.from(new Set(branches.filter((b) => visitedSet.has(b.from) && !visitedSet.has(b.to)).map((b) => b.to)));
  const availableSet = new Set(available);
  const pathStateOf = (id) => {
    if (!nodesResult) return null;
    if (visitedSet.has(id)) return "visited";
    if (availableSet.has(id)) return "available";
    if (!reachable.has(id)) return "locked";
    return null;
  };

  const chooseStyle = (s) => { setStyle(s); setAnalysis(null); setKeyLock(null); setNodesResult(null); setVisited([]); };

  const handleAnalyze = async () => {
    if (!style || boardItems.length < 2) return;
    setAnalyzing(true);
    try {
      const res = await base44.functions.invoke("analyzeDungeonFlow", {
        campaign_id: campaign.id, style,
        rooms: boardItems.map((r) => ({ id: r.id, label: r.label, category: r.category, color: r.color, tags: r.tags, x: r.x, y: r.y, w: r.w, h: r.h })),
      });
      setAnalysis(res.data);
    } catch (e) {
      setAnalysis({ suggestions: ["Kunne ikke analysere flyt. Prøv igjen."] });
    } finally {
      setAnalyzing(false);
    }
  };

  const handleKeyLock = async () => {
    if (boardItems.length < 2) return;
    setKeyLockLoading(true);
    try {
      const res = await base44.functions.invoke("keyLockAnalysis", {
        rooms: boardItems.map((r) => ({ id: r.id, label: r.label, element_key: r.element_key, category: r.category, color: r.color, tags: r.tags, x: r.x, y: r.y, w: r.w, h: r.h })),
      });
      setKeyLock(res.data);
    } catch (e) {
      setKeyLock({ keyPlacements: [], skipWarnings: ["Kunne ikke analysere nøkkel-lås. Prøv igjen."], notes: [] });
    } finally {
      setKeyLockLoading(false);
    }
  };

  const handleNodes = async () => {
    if (boardItems.length < 2) return;
    setNodesLoading(true);
    try {
      const res = await base44.functions.invoke("roguelikeNodes", {
        rooms: boardItems.map((r) => ({ id: r.id, label: r.label, element_key: r.element_key, category: r.category, color: r.color, tags: r.tags, x: r.x, y: r.y, w: r.w, h: r.h })),
      });
      setNodesResult(res.data);
      setVisited([]);
    } catch (e) {
      setNodesResult({ nodes: [], branches: [], entrance_id: null });
    } finally {
      setNodesLoading(false);
    }
  };
  const handleVisit = (id) => setVisited((p) => (p.includes(id) ? p : [...p, id]));
  const handleResetPath = () => setVisited([]);

  const handleDrop = async (e) => {
    e.preventDefault();
    const raw = e.dataTransfer.getData("application/json");
    if (!raw || !canvasRef.current) return;
    const el = JSON.parse(raw);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.floor((e.clientX - rect.left) / CELL));
    const y = Math.max(0, Math.floor((e.clientY - rect.top) / CELL));
    try {
      const created = await base44.entities.BoardItem.create({
        campaign_id: campaign.id, board: activeBoard, category: el.category, element_key: el.key,
        label: el.label, color: el.color, icon: el.icon, tags: el.tags, x, y, w: 2, h: 2,
      });
      setItems((p) => [...p, created]);
      setSelectedId(created.id);
    } catch (err) {}
  };

  const onMove = useCallback((id, x, y) => {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, x, y } : i)));
  }, []);
  const onResize = useCallback((id, w, h) => {
    setItems((p) => p.map((i) => (i.id === id ? { ...i, w, h } : i)));
  }, []);
  const onCommit = useCallback((id) => {
    const it = itemsRef.current.find((i) => i.id === id);
    if (!it) return;
    base44.entities.BoardItem.update(id, { x: it.x, y: it.y, w: it.w, h: it.h }).catch(() => {});
  }, []);
  const onDelete = useCallback((id) => {
    base44.entities.BoardItem.delete(id).catch(() => {});
    setItems((p) => p.filter((i) => i.id !== id));
    setSelectedId((s) => (s === id ? null : s));
  }, []);

  const addBoard = () => {
    const name = newBoard.trim();
    if (!name || boards.includes(name)) return;
    setBoards((p) => [...p, name]);
    setActiveBoard(name);
    setNewBoard("");
    setSelectedId(null);
    setAnalysis(null);
    setKeyLock(null);
    setNodesResult(null);
    setVisited([]);
  };

  if (loading) return <div className="h-full flex items-center justify-center"><div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" /></div>;
  if (!campaign) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="mb-4">Du trenger en kampanje først.</p>
          <Link to="/"><Button variant="outline">Til kampanjene</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2"><Library className="w-5 h-5 text-primary" /><h1 className="font-heading text-xl">Planleggingsbrett</h1></div>
        <div className="text-xs text-muted-foreground hidden md:block">Dra elementer fra sidemenyen → festes i rutenettet. Flytt, endre størrelse, slett. Smart matching viser hva som passer.</div>
      </div>

      <div className="flex-1 flex min-h-0">
        <aside className="w-60 shrink-0 border-r border-border bg-card/40 p-3">
          <BoardSidebar selected={selected} />
        </aside>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border overflow-x-auto scrollbar-thin">
            {boards.map((b) => (
              <button key={b}               onClick={() => { setActiveBoard(b); setSelectedId(null); setAnalysis(null); setKeyLock(null); setNodesResult(null); setVisited([]); }} className={cn("px-3 py-1.5 rounded-md text-sm whitespace-nowrap border transition-colors", b === activeBoard ? "bg-primary/15 border-primary/40 text-primary" : "border-border text-muted-foreground hover:text-foreground")}>{b}</button>
            ))}
            <div className="flex items-center gap-1.5 ml-2">
              <Input value={newBoard} onChange={(e) => setNewBoard(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addBoard()} placeholder="Nytt brett…" className="h-8 w-32" />
              <Button size="icon" variant="outline" className="h-8 w-8" onClick={addBoard}><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="ml-auto flex items-center gap-3 text-[10px] text-muted-foreground">
              {Object.entries(COLOR_LEGEND).map(([k, v]) => (
                <span key={k} className="flex items-center gap-1"><span className={cn("w-2.5 h-2.5 rounded-full", COLOR_CLASSES[k].dot)} /> {v}</span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border flex-wrap">
            <StyleSelector style={style} onSelect={chooseStyle} />
            <FlowPanel style={style} analyzing={analyzing} analysis={analysis} onAnalyze={handleAnalyze} roomCount={boardItems.length} />
            {style === "metroidvania" && (
              <KeyLockPanel keyLock={keyLock} loading={keyLockLoading} onAnalyze={handleKeyLock} roomCount={boardItems.length} hasDoors={boardItems.some((r) => r.element_key === "locked_door")} />
            )}
            {style === "roguelike" && (
              <RoguelikePanel nodesResult={nodesResult} loading={nodesLoading} onAnalyze={handleNodes} roomCount={boardItems.length} visited={visited} onVisit={handleVisit} onReset={handleResetPath} />
            )}
          </div>

          <div className="flex-1 overflow-auto scrollbar-thin bg-background story-canvas-bg" onClick={() => setSelectedId(null)}>
            <div
              ref={canvasRef}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={(e) => { e.stopPropagation(); setSelectedId(null); }}
              className="relative"
              style={{
                width: COLS * CELL, height: ROWS * CELL,
                backgroundImage: "linear-gradient(hsl(35 14% 18% / 0.55) 1px, transparent 1px), linear-gradient(90deg, hsl(35 14% 18% / 0.55) 1px, transparent 1px)",
                backgroundSize: `${CELL}px ${CELL}px`,
              }}
            >
              {boardItems.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/60 text-sm pointer-events-none">Dra elementer hit fra sidemenyen…</div>
              )}
              {boardItems.map((it) => (
                <BoardItemCard key={it.id} item={it} selected={it.id === selectedId} role={badgesMap[it.id]} nodeType={nodesMap[it.id]?.node_type} pathState={pathStateOf(it.id)} cellSize={CELL} onSelect={setSelectedId} onMove={onMove} onResize={onResize} onCommit={onCommit} onDelete={onDelete} />
              ))}
              {analysis?.connections && (
                <FlowOverlay rooms={boardItems} connections={analysis.connections} cellSize={CELL} width={COLS * CELL} height={ROWS * CELL} />
              )}
              {keyLock?.keyPlacements?.length > 0 && (
                <KeyLockOverlay rooms={boardItems} placements={keyLock.keyPlacements} cellSize={CELL} width={COLS * CELL} height={ROWS * CELL} />
              )}
              {nodesResult?.branches?.length > 0 && (
                <FlowOverlay rooms={boardItems} connections={nodesResult.branches.map((b) => ({ from: b.from, to: b.to, kind: "normal" }))} cellSize={CELL} width={COLS * CELL} height={ROWS * CELL} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}