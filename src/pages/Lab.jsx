import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { useCampaign } from "@/hooks/useCampaign";
import { useNfcScan } from "@/hooks/useNfcScan";
import ScanPanel from "@/components/lab/ScanPanel";
import TagResult from "@/components/lab/TagResult";
import LinkTargetSheet from "@/components/lab/LinkTargetSheet";
import CreateCharacterSheet from "@/components/lab/CreateCharacterSheet";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FlaskConical, Users, Backpack, ScrollText, Pencil, Trash2, Tag as TagIcon } from "lucide-react";

export default function Lab() {
  const { campaign, loading } = useCampaign();
  const { supported, scanning, error, scan, cancel } = useNfcScan();

  const [tags, setTags] = useState([]);
  const [characters, setCharacters] = useState([]);
  const [partyMembers, setPartyMembers] = useState([]);
  const [result, setResult] = useState(null); // { status, tagId, targetType, targetName, tagRecord }
  const [linkOpen, setLinkOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    if (!campaign) return;
    const [t, c, m] = await Promise.all([
      base44.entities.NfcTag.filter({ campaign_id: campaign.id }),
      base44.entities.Character.filter({ campaign_id: campaign.id }),
      base44.entities.PartyMember.filter({ campaign_id: campaign.id }),
    ]);
    setTags(t);
    setCharacters(c);
    setPartyMembers(m);
  }, [campaign]);

  useEffect(() => { load(); }, [load]);

  const resolveName = (tag) => {
    if (!tag) return null;
    if (tag.target_type === "character") {
      const c = characters.find((x) => x.id === tag.target_id);
      return c?.name || "(slettet karakter)";
    }
    const m = partyMembers.find((x) => x.id === tag.target_id);
    return m?.name || "(slettet følgesvenn)";
  };

  const applyTagId = (id) => {
    const tag = tags.find((t) => t.tag_id === id);
    if (tag) {
      setResult({
        status: "hit",
        tagId: id,
        targetType: tag.target_type,
        targetName: resolveName(tag),
        tagRecord: tag,
      });
    } else {
      setResult({ status: "miss", tagId: id, targetType: null, targetName: null, tagRecord: null });
    }
  };

  const handleScan = async () => {
    try {
      const id = await scan();
      applyTagId(id);
    } catch (e) {
      setResult({ status: "error", tagId: null, targetType: null, targetName: null, tagRecord: null });
    }
  };

  const statusText = (() => {
    if (!result) return "Klar";
    if (result.status === "scanning") return "Leser…";
    if (result.status === "hit") return `Treff: ${result.targetName || "ukjent"}`;
    if (result.status === "miss") return "Ukjent tag";
    if (result.status === "error") return error || "Feil";
    return "Klar";
  })();

  const statusForResult = result?.status === "error" ? "error" : result?.status || "idle";

  const onLink = async (targetType, targetId) => {
    const name =
      targetType === "character"
        ? characters.find((c) => c.id === targetId)?.name
        : partyMembers.find((m) => m.id === targetId)?.name;
    try {
      if (result?.tagRecord) {
        await base44.entities.NfcTag.update(result.tagRecord.id, {
          target_type: targetType,
          target_id: targetId,
        });
      } else {
        const created = await base44.entities.NfcTag.create({
          campaign_id: campaign.id,
          tag_id: result.tagId,
          target_type: targetType,
          target_id: targetId,
        });
        setResult({ status: "hit", tagId: result.tagId, targetType, targetName: name, tagRecord: created });
      }
      await load();
      setResult((r) => ({ ...r, targetType, targetName: name, status: "hit" }));
      setLinkOpen(false);
    } catch (e) {
      alert("Lagring feilet: " + e.message);
    }
  };

  const onDelete = async () => {
    if (!result?.tagRecord) return;
    if (!confirm("Slette koblingen for denne tagen?")) return;
    try {
      await base44.entities.NfcTag.delete(result.tagRecord.id);
      await load();
      setResult({ status: "miss", tagId: result.tagId, targetType: null, targetName: null, tagRecord: null });
    } catch (e) {
      alert("Sletting feilet: " + e.message);
    }
  };

  const onCreated = async () => {
    await load();
    // after creating character + tag, re-resolve current tagId
    applyTagId(result?.tagId);
  };

  if (loading) {
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
            <p className="text-muted-foreground mb-5">Opprett en kampanje før du tester NFC-laben.</p>
            <Link to="/"><Button className="gap-2"><ScrollText className="w-4 h-4" /> Til kampanjer</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-2 mb-1">
          <FlaskConical className="w-4 h-4 text-primary" />
          <span className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Lab · testområde</span>
        </div>
        <h1 className="font-heading text-4xl mb-1">NFC Lab</h1>
        <p className="text-muted-foreground text-sm mb-6">
          Testområde for fysiske NFC-stickers. Skann en tag for å se om den er koblet til en karakter eller følgesvenn.
        </p>

        <Card className="glass-card mb-6">
          <CardContent className="p-4">
            <ScanPanel
              supported={supported}
              scanning={scanning}
              status={scanning ? "scanning" : statusForResult}
              statusText={scanning ? "Leser…" : statusText}
              onScan={handleScan}
              onCancel={cancel}
            />
          </CardContent>
        </Card>

        <div className="mb-8">
          <TagResult
            result={result}
            onEdit={() => setLinkOpen(true)}
            onDelete={onDelete}
            onLink={() => setLinkOpen(true)}
            onCreateCharacter={() => setCreateOpen(true)}
          />
        </div>

        <div>
          <h2 className="font-heading text-xl mb-3 flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-primary" /> Registrerte tagger
            <span className="text-sm text-muted-foreground">({tags.length})</span>
          </h2>
          {tags.length === 0 ? (
            <p className="text-sm text-muted-foreground italic">Ingen tagger registrert enda.</p>
          ) : (
            <div className="space-y-2">
              {tags.map((t) => {
                const Icon = t.target_type === "character" ? Users : Backpack;
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-border bg-card/50"
                  >
                    <Icon className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{resolveName(t)}</p>
                      <p className="text-xs text-muted-foreground font-mono break-all">{t.tag_id}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setResult({
                          status: "hit",
                          tagId: t.tag_id,
                          targetType: t.target_type,
                          targetName: resolveName(t),
                          tagRecord: t,
                        });
                      }}
                    >
                      Vis
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <LinkTargetSheet
        open={linkOpen}
        onOpenChange={setLinkOpen}
        characters={characters}
        partyMembers={partyMembers}
        onLink={onLink}
      />
      <CreateCharacterSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        campaignId={campaign.id}
        setting={campaign.setting}
        tagId={result?.tagId}
        onCreated={onCreated}
      />
    </div>
  );
}