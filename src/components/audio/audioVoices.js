export function createLayer(context, destination) {
  const output = context.createGain();
  output.gain.value = 0;
  output.connect(destination);
  const nodes = new Set([output]);
  const timers = new Set();
  let disposed = false;
  return {
    context, output,
    track(node) { nodes.add(node); return node; },
    release(node) { node.disconnect(); nodes.delete(node); },
    every(callback, seconds) {
      const timer = window.setInterval(() => { if (!disposed && context.state === 'running') callback(); }, seconds * 1000);
      timers.add(timer);
    },
    dispose() {
      if (disposed) return;
      disposed = true;
      timers.forEach((timer) => window.clearInterval(timer));
      for (const node of nodes) {
        if (typeof node.stop === 'function') node.stop();
        node.disconnect();
      }
      nodes.clear(); timers.clear();
    },
  };
}

export function tone(layer, destination, frequency, duration, volume = 0.12, type = 'sine', endFrequency = frequency) {
  const { context } = layer;
  const oscillator = layer.track(context.createOscillator());
  const envelope = layer.track(context.createGain());
  const now = context.currentTime;
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, now);
  oscillator.frequency.exponentialRampToValueAtTime(endFrequency, now + duration);
  envelope.gain.setValueAtTime(0, now);
  envelope.gain.linearRampToValueAtTime(volume, now + Math.min(duration / 4, 0.4));
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  oscillator.connect(envelope); envelope.connect(destination);
  oscillator.onended = () => { layer.release(oscillator); layer.release(envelope); };
  oscillator.start(); oscillator.stop(now + duration + 0.1);
}

export function noiseBuffer(context) {
  const buffer = context.createBuffer(1, context.sampleRate * 4, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}