import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Volume2, Square } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import SoundVolume from '@/components/audio/SoundVolume';
import useSceneAudio from '@/components/audio/useSceneAudio';
import { soundscapePresets } from '@/components/audio/soundscapePresets';

export default function SceneSoundscape({ campaignId, sessionId }) {
  const latest = useQuery({
    queryKey: ['scene-soundscape', campaignId, sessionId],
    queryFn: async () => {
      const page = await base44.entities.AiGmTurn.filter({ campaign_id: campaignId, session_id: sessionId }, { sort: '-created_date', limit: 1, fields: ['soundscape'] });
      return page.items[0]?.soundscape || 'quiet';
    },
  });
  const scene = soundscapePresets[latest.data] ? latest.data : 'quiet';
  const audio = useSceneAudio(scene);
  const preset = soundscapePresets[scene];
  return <section aria-label="Scene sound" className="rounded-xl border border-border bg-card p-4 mb-6 space-y-3">
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Scene Sound · AI Controlled</p><p role="status" aria-live="polite" className="text-sm font-medium mt-1">{latest.isLoading ? 'Loading scene…' : preset.label}{audio.playing ? ' · Playing' : ' · Sound off'}</p></div>
      <Button variant={audio.playing ? 'outline' : 'secondary'} size="sm" onClick={audio.toggle} disabled={audio.busy || (!audio.playing && (latest.isLoading || latest.isError))}>{audio.playing ? <Square /> : <Volume2 />}{audio.busy ? 'Please wait…' : audio.playing ? 'Stop Sound' : 'Start Sound'}</Button>
    </div>
    <p className="text-xs text-muted-foreground">{preset.detail}. Synthesized audio; click Start Sound once and the AI will blend between scenes as you play.</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><SoundVolume label="Music" value={audio.music} onChange={audio.setMusic} /><SoundVolume label="Ambience" value={audio.ambience} onChange={audio.setAmbience} /></div>
    {latest.isError && <p role="alert" className="text-xs text-destructive">Could not load scene audio. <button className="underline" onClick={() => latest.refetch()}>Retry</button></p>}
    {audio.error && <p role="alert" className="text-xs text-destructive">{audio.error}</p>}
  </section>;
}