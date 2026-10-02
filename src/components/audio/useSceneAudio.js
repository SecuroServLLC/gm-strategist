import { useEffect, useRef, useState } from 'react';
import sceneAudioEngine from '@/components/audio/sceneAudioEngine';

export default function useSceneAudio(scene) {
  const engine = useRef(null);
  const mounted = useRef(false);
  const lock = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [music, setMusic] = useState(25);
  const [ambience, setAmbience] = useState(40);
  const settings = useRef({ scene, music, ambience });
  settings.current = { scene, music, ambience };
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; engine.current?.destroy(); engine.current = null; };
  }, []);
  useEffect(() => { engine.current?.setScene(scene); }, [scene]);
  useEffect(() => { engine.current?.setLevels(music, ambience); }, [music, ambience]);
  const toggle = async () => {
    if (lock.current) return;
    lock.current = true; setBusy(true); setError('');
    try {
      if (engine.current) {
        await engine.current.destroy(); engine.current = null;
        if (mounted.current) setPlaying(false);
      } else {
        const player = sceneAudioEngine();
        engine.current = player;
        await player.start();
        if (!mounted.current) { await player.destroy(); return; }
        player.setLevels(settings.current.music, settings.current.ambience); player.setScene(settings.current.scene); setPlaying(true);
      }
    } catch (e) {
      await engine.current?.destroy(); engine.current = null;
      if (mounted.current) { setPlaying(false); setError(e.message); }
    } finally {
      lock.current = false;
      if (mounted.current) setBusy(false);
    }
  };
  return { playing, busy, error, music, ambience, setMusic, setAmbience, toggle };
}