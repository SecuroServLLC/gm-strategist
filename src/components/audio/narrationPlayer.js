import { base44 } from '@/api/base44Client';

export default function narrationPlayer(audio, onState) {
  let enabled = false;
  let status = 'off';
  let epoch = 0;
  let current = null;
  let busy = false;
  const queue = [];
  const seen = new Set();
  const publish = (next, error = '') => { status = next; onState({ enabled, status, error }); };
  const pump = async () => {
    if (!enabled || busy) return;
    current ||= queue.shift();
    if (!current) { publish('ready'); return; }
    busy = true;
    const token = epoch;
    publish('generating');
    try {
      const response = await base44.functions.invoke('narrateAiTurn', { turn_id: current.turnId, part: current.part });
      if (token !== epoch) return;
      if (response.data?.error || !response.data?.url) throw new Error(response.data?.error || 'Narration could not be generated.');
      audio.src = response.data.url;
      audio.load();
      await audio.play();
    } catch (error) {
      if (token !== epoch) return;
      if (error.name === 'NotAllowedError') publish('waiting', 'Your browser needs a tap. Press Play below to start narration.');
      else { busy = false; publish('error', error.response?.data?.error || error.message); }
    }
  };
  const onPlay = () => { if (enabled && current) { busy = true; publish('playing'); } };
  const onPause = () => { if (enabled && status === 'playing') publish('paused'); };
  const onEnded = () => { if (enabled) { busy = false; current = null; pump(); } };
  const onError = () => { if (enabled && current) { busy = false; publish('error', 'Audio could not play. Retry narration.'); } };
  audio.addEventListener('play', onPlay); audio.addEventListener('pause', onPause);
  audio.addEventListener('ended', onEnded); audio.addEventListener('error', onError);
  const clear = () => {
    enabled = false; epoch++; busy = false; current = null; queue.length = 0;
    audio.pause(); audio.removeAttribute('src'); audio.load();
  };
  return {
    setEnabled(value) {
      if (!value) { clear(); publish('off'); }
      else { enabled = true; publish('ready'); }
    },
    enqueue(request) {
      if (!enabled || !request) return;
      const key = `${request.turnId}:${request.part}`;
      if (seen.has(key)) return;
      seen.add(key); queue.push(request); pump();
    },
    retry() { if (enabled && status === 'error') pump(); },
    destroy() {
      clear();
      audio.removeEventListener('play', onPlay); audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded); audio.removeEventListener('error', onError);
    },
  };
}