import { createLayer } from '@/components/audio/audioVoices';
import sceneMusic from '@/components/audio/sceneMusic';
import sceneAmbience from '@/components/audio/sceneAmbience';
import { soundscapePresets } from '@/components/audio/soundscapePresets';

export default function sceneAudioEngine() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) throw new Error('Audio is not supported by this browser.');
  const context = new AudioContext();
  const music = context.createGain();
  const ambience = context.createGain();
  const compressor = context.createDynamicsCompressor();
  const master = context.createGain();
  compressor.threshold.value = -18; compressor.ratio.value = 4;
  master.gain.value = 0.65;
  music.gain.value = 0.15; ambience.gain.value = 0.4;
  music.connect(compressor); ambience.connect(compressor);
  compressor.connect(master); master.connect(context.destination);
  const layers = new Set();
  const cleanups = new Set();
  let current = null;
  let scene = null;
  let closed = false;
  const fade = (layer, value) => {
    const now = context.currentTime;
    const held = layer.output.gain.value;
    layer.output.gain.cancelScheduledValues(now);
    layer.output.gain.setValueAtTime(held, now);
    layer.output.gain.linearRampToValueAtTime(value, now + 2);
  };
  return {
    async start() {
      await context.resume();
      if (context.state !== 'running') throw new Error('Sound was blocked. Click Start Sound again to enable it.');
    },
    setLevels(musicVolume, ambienceVolume) {
      if (closed) return;
      music.gain.setTargetAtTime(Math.min(100, Math.max(0, musicVolume)) / 100 * 0.6, context.currentTime, 0.15);
      ambience.gain.setTargetAtTime(Math.min(100, Math.max(0, ambienceVolume)) / 100, context.currentTime, 0.15);
    },
    setScene(value) {
      if (closed) return;
      const nextScene = soundscapePresets[value] ? value : 'quiet';
      if (nextScene === scene) return;
      const previous = current;
      const next = [createLayer(context, music), createLayer(context, ambience)];
      next.forEach((layer) => layers.add(layer));
      sceneMusic(next[0], soundscapePresets[nextScene], nextScene);
      sceneAmbience(next[1], soundscapePresets[nextScene], nextScene);
      next.forEach((layer) => fade(layer, 1));
      previous?.forEach((layer) => fade(layer, 0));
      if (previous) {
        const timer = window.setTimeout(() => {
          previous.forEach((layer) => { layer.dispose(); layers.delete(layer); });
          cleanups.delete(timer);
        }, 2200);
        cleanups.add(timer);
      }
      current = next; scene = nextScene;
    },
    async destroy() {
      if (closed) return;
      closed = true;
      cleanups.forEach((timer) => window.clearTimeout(timer));
      layers.forEach((layer) => layer.dispose());
      layers.clear(); cleanups.clear();
      music.disconnect(); ambience.disconnect(); compressor.disconnect(); master.disconnect();
      if (context.state !== 'closed') await context.close();
    },
  };
}