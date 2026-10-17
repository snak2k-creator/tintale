let context: AudioContext | null = null;
let musicTimer: ReturnType<typeof setInterval> | null = null;

function audioContext(): AudioContext | null {
  try {
    context ??= new AudioContext();
    if (context.state === 'suspended') void context.resume();
    return context;
  } catch {
    return null;
  }
}

function toneAt(ctx: AudioContext, frequency: number, duration: number, volume: number, startAt = ctx.currentTime, type: OscillatorType = 'sine', endFrequency = frequency) {
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  const attack = Math.min(.035, duration / 3);
  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, startAt);
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(1, endFrequency), startAt + duration);
  gain.gain.setValueAtTime(.0001, startAt);
  gain.gain.linearRampToValueAtTime(volume, startAt + attack);
  gain.gain.exponentialRampToValueAtTime(.0001, startAt + duration);
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start(startAt);
  oscillator.stop(startAt + duration + .01);
}

export const chime = (success = false) => {
  const ctx = audioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  toneAt(ctx, success ? 659.25 : 587.33, .24, .035, now, 'sine');
  if (success) {
    toneAt(ctx, 783.99, .32, .026, now + .12, 'sine');
    toneAt(ctx, 987.77, .48, .02, now + .25, 'sine');
  }
};

export function pourSound(amount = 1) {
  const ctx = audioContext();
  if (!ctx) return;
  const now = ctx.currentTime;
  const drops = Math.max(1, Math.min(4, amount));
  toneAt(ctx, 740, .24 + drops * .025, .025, now, 'sine', 430);
  for (let i = 0; i < drops; i++) {
    const at = now + .04 + i * .045;
    toneAt(ctx, 930 - i * 48, .13, .012, at, 'triangle', 610 - i * 24);
  }

  // A quiet, filtered water shimmer keeps the pour from sounding like another UI click.
  try {
    const frames = Math.floor(ctx.sampleRate * .2);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let i = 0; i < frames; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / frames);
    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();
    source.buffer = buffer;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1500, now);
    filter.frequency.exponentialRampToValueAtTime(650, now + .2);
    gain.gain.setValueAtTime(.0001, now);
    gain.gain.linearRampToValueAtTime(.018, now + .025);
    gain.gain.exponentialRampToValueAtTime(.0001, now + .2);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);
    source.start(now);
    source.stop(now + .21);
  } catch {
    // The tonal pour remains available if a browser blocks noise buffers.
  }
}

export function music(on: boolean) {
  if (musicTimer) clearInterval(musicTimer);
  musicTimer = null;
  if (!on) return;

  const notes = [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 392, 440, 523.25, 587.33, 698.46, 587.33, 523.25, 440, 392];
  let step = 0;
  const playStep = () => {
    const ctx = audioContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    toneAt(ctx, notes[step % notes.length], .39, .012, now, 'sine');
    if (step % 4 === 0) {
      const roots = [261.63, 196, 293.66, 349.23];
      const root = roots[Math.floor(step / 4) % roots.length];
      toneAt(ctx, root, .9, .0035, now, 'triangle');
      toneAt(ctx, root * 1.5, .72, .0025, now + .025, 'sine');
    }
    step++;
  };
  playStep();
  musicTimer = setInterval(playStep, 480);
}
