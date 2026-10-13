import React, { useEffect } from 'react';
import { Volume2, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import useSceneAudio from '@/components/audio/useSceneAudio';
import SoundVolume from '@/components/audio/SoundVolume';
import { soundscapePresets } from '@/components/audio/soundscapePresets';
export default function SemiAudio({ cell, onChange }) {
  const scene = cell.soundscape || 'quiet';
  const audio = useSceneAudio(scene);
  useEffect(() => { window.speechSynthesis?.cancel(); return () => window.speechSynthesis?.cancel(); }, [cell.narrative]);
  const speak = () => { window.speechSynthesis.cancel(); const speech = new SpeechSynthesisUtterance(cell.narrative); speech.lang = 'nb-NO'; window.speechSynthesis.speak(speech); };
  return <section className="rounded-xl border bg-card p-4 space-y-4">
    <div className="flex items-center justify-between"><h2 className="text-xl">Scene-lyd</h2><Volume2 className="w-4 h-4 text-primary" /></div>
    <label className="block text-sm">Lydbilde<select className="mt-2 w-full border rounded-md bg-background p-2" value={scene} onChange={e => onChange({ soundscape: e.target.value })}>{Object.entries(soundscapePresets).map(([key, preset]) => <option key={key} value={key}>{preset.label}</option>)}</select></label>
    <Button className="w-full" variant="secondary" disabled={audio.busy} onClick={audio.toggle}>{audio.playing ? <Square /> : <Volume2 />}{audio.busy ? 'Venter…' : audio.playing ? 'Stopp lydbildet' : 'Start lydbildet'}</Button>
    <SoundVolume label="Musikk" value={audio.music} onChange={audio.setMusic} /><SoundVolume label="Atmosfære" value={audio.ambience} onChange={audio.setAmbience} />
    <p className="text-xs text-muted-foreground">Syntetisk lyd. AI foreslår; du godkjenner. Valgt rute styrer lyden når avspilling er på.</p>
    {audio.error && <p role="alert" className="text-destructive text-sm">{audio.error}</p>}
    {'speechSynthesis' in window && <div className="flex gap-2"><Button variant="outline" disabled={!cell.narrative} onClick={speak}>Les scenen</Button><Button variant="ghost" onClick={() => window.speechSynthesis.cancel()}>Stopp tale</Button></div>}
    <p className="text-xs text-muted-foreground">Opplesning bruker nettleserens tilgjengelige stemmer.</p>
  </section>;
}