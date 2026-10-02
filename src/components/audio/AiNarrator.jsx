import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import narrationPlayer from '@/components/audio/narrationPlayer';

const labels = { off: 'Narrator off', ready: 'Ready for the next AI response', generating: 'Generating narrator audio…', playing: 'Narrating…', paused: 'Narration paused', waiting: 'Playback needs permission', error: 'Narration unavailable' };

export default function AiNarrator({ request }) {
  const audio = useRef(null);
  const player = useRef(null);
  const [state, setState] = useState({ enabled: false, status: 'off', error: '' });
  useEffect(() => {
    const controller = narrationPlayer(audio.current, setState);
    player.current = controller;
    return () => { controller.destroy(); player.current = null; };
  }, []);
  useEffect(() => { player.current?.enqueue(request); }, [request]);
  return <section aria-label="AI voice narrator" className="rounded-xl border border-border bg-card p-4 mb-6 space-y-3">
    <div className="flex items-center justify-between gap-4 flex-wrap">
      <div><p className="text-xs uppercase tracking-wide text-muted-foreground">AI Voice Narrator · Automatic</p><p role="status" aria-live="polite" className="text-sm font-medium mt-1">{labels[state.status]}</p></div>
      <Button variant={state.enabled ? 'outline' : 'secondary'} size="sm" aria-pressed={state.enabled} onClick={() => player.current?.setEnabled(!state.enabled)}>{state.enabled ? <MicOff /> : <Mic />}{state.enabled ? 'Disable Narrator' : 'Enable Narrator'}</Button>
    </div>
    <p className="text-xs text-muted-foreground">Enable once to read new AI responses and resolved dice outcomes automatically in the story’s language. River AI voice · generation uses 1 integration credit per 50 characters; existing clips are reused.</p>
    <audio ref={audio} controls preload="none" hidden={!state.enabled} aria-label="AI narrator playback and volume" className="w-full" />
    {state.error && <p role="alert" className="text-xs text-destructive">{state.error}{state.status === 'error' && <button onClick={() => player.current?.retry()} className="underline ml-2">Retry narration</button>}</p>}
  </section>;
}