import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCampaign } from "@/hooks/useCampaign";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Backpack } from "lucide-react";
import PartyMemberCard from "@/components/PartyMemberCard";
import PartyMemberDialog from "@/components/PartyMemberDialog";
import InventoryRow from "@/components/InventoryRow";
import InventoryDialog from "@/components/InventoryDialog";

export default function Gruppe() {
  const { campaign, loading } = useCampaign();
  const [members, setMembers] = useState([]);
  const [items, setItems] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [memberDialog, setMemberDialog] = useState({ open: false, member: null });
  const [itemDialog, setItemDialog] = useState({ open: false, item: null });

  useEffect(() => {
    if (!campaign) return;
    let active = true;
    (async () => {
      try {
        const [m, i, c] = await Promise.all([
          base44.entities.PartyMember.filter({ campaign_id: campaign.id }),
          base44.entities.InventoryItem.filter({ campaign_id: campaign.id }),
          base44.entities.Character.filter({ campaign_id: campaign.id }),
        ]);
        if (!active) return;
        setMembers(m);
        setItems(i);
        setCharacters(c);
      } catch (e) {}
    })();
    return () => { active = false; };
  }, [campaign?.id]);

  const saveMember = async (payload) => {
    if (payload.id) {
      const updated = await base44.entities.PartyMember.update(payload.id, {
        kind: payload.kind, name: payload.name, character_id: payload.character_id || null,
        status: payload.status, quantity: payload.quantity, token_type: payload.token_type || "animal", description: payload.description,
      });
      setMembers((p) => p.map((m) => (m.id === payload.id ? updated : m)));
    } else {
      const created = await base44.entities.PartyMember.create({ ...payload, campaign_id: campaign.id });
      setMembers((p) => [...p, created]);
    }
    setMemberDialog({ open: false, member: null });
  };
  const deleteMember = async (id) => { await base44.entities.PartyMember.delete(id); setMembers((p) => p.filter((m) => m.id !== id)); };

  const saveItem = async (payload) => {
    if (payload.id) {
      const updated = await base44.entities.InventoryItem.update(payload.id, {
        name: payload.name, category: payload.category, quantity: payload.quantity,
        unit: payload.unit, value: payload.value, carried_by: payload.carried_by, description: payload.description,
      });
      setItems((p) => p.map((i) => (i.id === payload.id ? updated : i)));
    } else {
      const created = await base44.entities.InventoryItem.create({ ...payload, campaign_id: campaign.id });
      setItems((p) => [...p, created]);
    }
    setItemDialog({ open: false, item: null });
  };
  const deleteItem = async (id) => { await base44.entities.InventoryItem.delete(id); setItems((p) => p.filter((i) => i.id !== id)); };
  const changeQty = async (id, qty) => {
    const updated = await base44.entities.InventoryItem.update(id, { quantity: qty });
    setItems((p) => p.map((i) => (i.id === id ? updated : i)));
  };

  const wealth = items
    .filter((i) => i.category === "currency" && i.value > 0)
    .reduce((s, i) => s + (i.quantity || 0) * (i.value || 0), 0);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Backpack className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="mb-4">Du trenger en kampanje først.</p>
          <Link to="/kampanje"><Button variant="outline">Opprett rød tråd</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-5xl mx-auto px-8 py-10">
        <div className="flex items-center gap-3 mb-2">
          <Backpack className="w-6 h-6 text-primary" />
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Gruppen</span>
        </div>
        <h1 className="font-heading text-4xl mb-1">Følget &amp; Inventar</h1>
        <p className="text-muted-foreground text-lg mb-8">Hvem som reiser med deg, og hva gruppa bærer på seg.</p>

        <Tabs defaultValue="party">
          <TabsList className="mb-6">
            <TabsTrigger value="party">Følgesvenner ({members.length})</TabsTrigger>
            <TabsTrigger value="inventory">Inventar ({items.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="party" className="space-y-4">
            <div className="flex justify-end">
              <Button className="gap-1.5" onClick={() => setMemberDialog({ open: true, member: null })}><Plus className="w-4 h-4" /> Legg til følgesvenn</Button>
            </div>
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">Ingen i følget enda. Legg til karakterer eller brikker som følger med gruppa.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map((m) => (
                  <PartyMemberCard key={m.id} member={m} onEdit={(mem) => setMemberDialog({ open: true, member: mem })} onDelete={deleteMember} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="inventory" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {wealth > 0 && <span className="text-primary font-medium">Samlet formue: {wealth} mynter</span>}
              </div>
              <Button className="gap-1.5" onClick={() => setItemDialog({ open: true, item: null })}><Plus className="w-4 h-4" /> Legg til gjenstand</Button>
            </div>
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">Inventaret er tomt. Legg til våpen, forbruksvarer, gull og annet gruppa samler.</p>
            ) : (
              <div className="space-y-2">
                {items.map((i) => (
                  <InventoryRow key={i.id} item={i} onQty={changeQty} onEdit={(it) => setItemDialog({ open: true, item: it })} onDelete={deleteItem} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <PartyMemberDialog open={memberDialog.open} member={memberDialog.member} characters={characters} onOpenChange={(o) => setMemberDialog({ open: o, member: null })} onSave={saveMember} />
        <InventoryDialog open={itemDialog.open} item={itemDialog.item} onOpenChange={(o) => setItemDialog({ open: o, item: null })} onSave={saveItem} />
      </div>
    </div>
  );
}