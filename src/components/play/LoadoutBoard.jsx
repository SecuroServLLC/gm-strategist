import React from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Badge } from "@/components/ui/badge";

const CAT_LABEL = { weapon: "Våpen", armor: "Rustning", consumable: "Forbruk.", valuable: "Verdi", currency: "Mynt", misc: "Div" };

export default function LoadoutBoard({ members, items, onMoveItem, counts }) {
  const columns = [{ id: "shared", name: "Felleslager" }, ...members.map((m) => ({ id: m.id, name: m.name }))];
  const itemsFor = (colId) => items.filter((i) => (colId === "shared" ? !i.carried_by : i.carried_by === colId));

  const onDragEnd = (res) => {
    if (!res.destination || res.destination.droppableId === res.source.droppableId) return;
    const dest = res.destination.droppableId;
    onMoveItem(res.draggableId, dest === "shared" ? "" : dest);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {columns.map((col) => (
          <Droppable droppableId={col.id} key={col.id}>
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`rounded-lg border p-3 min-h-[140px] flex flex-col ${snapshot.isDraggingOver ? "border-primary/60 bg-accent/30" : "border-border bg-card/40"}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-heading text-sm truncate">{col.name}</h4>
                  <Badge variant="secondary" className="text-[10px] py-0">{counts ? counts.find((row) => col.id === 'shared' ? !row.carried_by : row.carried_by === col.id)?.count || 0 : '—'}</Badge>
                </div>
                <div className="space-y-1.5 flex-1">
                  {itemsFor(col.id).map((it, idx) => (
                    <Draggable draggableId={it.id} index={idx} key={it.id}>
                      {(p, s) => (
                        <div
                          ref={p.innerRef}
                          {...p.draggableProps}
                          {...p.dragHandleProps}
                          className={`rounded-md border px-2.5 py-1.5 text-sm flex items-center justify-between gap-2 ${s.isDragging ? "shadow-lg border-primary/50 bg-card" : "border-border bg-background/60"}`}
                        >
                          <span className="truncate">{it.name}{it.quantity > 1 && ` ×${it.quantity}`}</span>
                          <Badge variant="outline" className="text-[9px] py-0 shrink-0">{CAT_LABEL[it.category] || it.category}</Badge>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {itemsFor(col.id).length === 0 && <p className="text-xs text-muted-foreground py-3 text-center">Tom</p>}
                </div>
              </div>
            )}
          </Droppable>
        ))}
      </div>
    </DragDropContext>
  );
}