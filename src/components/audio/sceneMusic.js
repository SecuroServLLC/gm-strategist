import { tone } from '@/components/audio/audioVoices';

export default function sceneMusic(layer, preset, scene) {
  const { context, output } = layer;
  const filter = layer.track(context.createBiquadFilter());
  filter.type = 'lowpass'; filter.frequency.value = scene === 'cave' ? 450 : 1200;
  filter.connect(output);
  preset.chord.forEach((semitones, index) => {
    const oscillator = layer.track(context.createOscillator());
    const gain = layer.track(context.createGain());
    oscillator.type = 'sine';
    oscillator.frequency.value = preset.root * 2 ** (semitones / 12);
    oscillator.detune.value = index % 2 ? 3 : -3;
    gain.gain.value = 0.085;
    oscillator.connect(gain); gain.connect(filter); oscillator.start();
  });
  let note = 0;
  const playNote = () => {
    const semitones = preset.melody[note++ % preset.melody.length];
    tone(layer, filter, preset.root * 2 ** (semitones / 12), preset.beat * 1.7, 0.16, scene === 'tavern' ? 'triangle' : 'sine');
  };
  playNote(); layer.every(playNote, preset.beat);
}