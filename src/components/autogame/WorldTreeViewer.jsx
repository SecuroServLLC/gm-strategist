import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { ChevronRight, ChevronDown, Globe, Map, Building, MapPin, Home, Layers, DoorOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const LEVEL_ICONS = { world: Globe, region: Map, city: Building, location: MapPin, building: Home, floor: Layers, room: DoorOpen };
const LEVEL_LABELS = { world: "Verden", region: "Region", city: "By", location: "Område", building: "Bygning", floor: "Etasje", room: "Rom" };
const LEVEL_COLORS = { world: "text-amber-400", region: "text-sky-400", city: "text-emerald-400", location: "text-violet-400", building: "text-rose-400", floor: "text-orange-400", room: "text-slate-300" };

function NodeRow({ node, childrenMap, depth, onSelect, selectedId }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const children = childrenMap[node.id] || [];
  const hasChildren = children.length > 0;
  const Icon = LEVEL_ICONS[node.level] || MapPin;
  return (
    <div>
      <div
        className={`flex items-center gap-2 py-1.5 px-2 rounded-md cursor-pointer transition-colors ${selectedId === node.id ? "bg-primary/15" : "hover:bg-accent/40"}`}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={() => { setExpanded(!expanded); onSelect?.(node); }}
      >
        {hasChildren ? (
          expanded ? <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
        ) : <span className="w-3.5 shrink-0" />}
        <Icon className={`w-4 h-4 shrink-0 ${LEVEL_COLORS[node.level] || ""}`} />
        <span className="font-medium truncate flex-1">{node.name}</span>
        {node.floor_number != null && <span className="text-[10px] text-muted-foreground">E{node.floor_number}</span>}
        <Badge variant="outline" className="text-[10px] shrink-0">{LEVEL_LABELS[node.level] || node.level}</Badge>
      </div>
      {expanded && (
        <div className="ml-8 mb-2 p-3 rounded-lg bg-card/30 border border-border/50 space-y-1.5" style={{ marginLeft: `${depth * 20 + 24}px` }}>
          {node.description && <p className="text-sm text-muted-foreground">{node.description}</p>}
          {node.scale && <p className="text-xs text-primary/70">Skala: {node.scale}</p>}
          {node.contents && <p className="text-xs text-muted-foreground italic">{node.contents}</p>}
          {node.poi_type && <Badge variant="outline" className="text-[10px]">{node.poi_type}</Badge>}
        </div>
      )}
      {expanded && hasChildren && (
        <div>
          {children.map((child) => (
            <NodeRow key={child.id} node={child} childrenMap={childrenMap} depth={depth + 1} onSelect={onSelect} selectedId={selectedId} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function WorldTreeViewer({ worldId, onSelect, selectedId }) {
  const query = useQuery({
    queryKey: ["world-nodes", worldId],
    enabled: !!worldId,
    queryFn: async () => {
      const page = await base44.entities.WorldNode.filter({ world_id: worldId }, { sort: "order", limit: 500 });
      return page.items;
    },
  });

  const tree = useMemo(() => {
    if (!query.data) return { root: null, childrenMap: {} };
    const childrenMap = {};
    let root = null;
    query.data.forEach((node) => {
      if (!node.parent_id) root = node;
      else { if (!childrenMap[node.parent_id]) childrenMap[node.parent_id] = []; childrenMap[node.parent_id].push(node); }
    });
    return { root, childrenMap };
  }, [query.data]);

  if (query.isLoading) return <p className="text-sm text-muted-foreground py-4 text-center">Laster verdensstruktur…</p>;
  if (query.isError) return <p className="text-sm text-destructive py-4 text-center">Kunne ikke laste strukturen.</p>;
  if (!tree.root) return <p className="text-sm text-muted-foreground py-4 text-center">Ingen struktur funnet.</p>;

  return (
    <div className="space-y-0.5">
      <NodeRow node={tree.root} childrenMap={tree.childrenMap} depth={0} onSelect={onSelect} selectedId={selectedId} />
    </div>
  );
}