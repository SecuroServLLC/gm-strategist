import { noiseBuffer, tone } from '@/components/audio/audioVoices';

export default function sceneAmbience(layer, preset, scene) {
  const { context, output } = layer;
  const buffer = noiseBuffer(context);
  const air = layer.track(context.createBufferSource());
  const highpass = layer.track(context.createBiquadFilter());
  const filter = layer.track(context.createBiquadFilter());
  const gust = layer.track(context.createGain());
  const lfo = layer.track(context.createOscillator());
  const depth = layer.track(context.createGain());
  air.buffer = buffer; air.loop = true;
  highpass.type = 'highpass'; highpass.frequency.value = 60;
  filter.type = scene === 'tavern' ? 'bandpass' : 'lowpass';
  filter.frequency.value = preset.wind; filter.Q.value = 0.6;
  gust.gain.value = scene === 'quiet' ? 0.05 : 0.35;
  depth.gain.value = scene === 'windy_hill' || scene === 'storm' ? 0.25 : 0.035;
  lfo.frequency.value = scene === 'storm' ? 0.14 : 0.075;
  air.connect(highpass); highpass.connect(filter); filter.connect(gust); gust.connect(output);
  lfo.connect(depth); depth.connect(gust.gain); air.start(); lfo.start();
  if (scene === 'cave') {
    const delay = layer.track(context.createDelay(1));
    const feedback = layer.track(context.createGain());
    delay.delayTime.value = 0.38; feedback.gain.value = 0.28;
    delay.connect(feedback); feedback.connect(delay); delay.connect(output);
    layer.every(() => {
      const frequency = 900 + Math.random() * 900;
      tone(layer, output, frequency, 0.18, 0.13, 'sine', frequency * 0.45);
      tone(layer, delay, frequency, 0.18, 0.13, 'sine', frequency * 0.45);
    }, 3.7);
  }
  if (scene === 'forest') layer.every(() => {
    const pitch = 1600 + Math.random() * 1100;
    tone(layer, output, pitch, 0.24, 0.09, 'sine', pitch * 1.35);
    tone(layer, output, pitch * 1.15, 0.5, 0.04, 'sine', pitch * 0.85);
  }, 6.1);
  if (scene === 'tavern') layer.every(() => filter.frequency.setTargetAtTime(350 + Math.random() * 650, context.currentTime, 0.3), 1.3);
  if (scene === 'storm') layer.every(() => {
    const thunder = layer.track(context.createBufferSource());
    const rumble = layer.track(context.createBiquadFilter());
    const envelope = layer.track(context.createGain());
    const now = context.currentTime;
    thunder.buffer = buffer; rumble.type = 'lowpass'; rumble.frequency.value = 100;
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(0.8, now + 0.8);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);
    thunder.connect(rumble); rumble.connect(envelope); envelope.connect(output);
    thunder.onended = () => { layer.release(thunder); layer.release(rumble); layer.release(envelope); };
    thunder.start();
  }, 17);
}