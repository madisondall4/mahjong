/**
 * Synthesized game audio + haptics. No audio assets — everything is Web
 * Audio oscillators/noise, so it works offline and adds zero bundle weight.
 * The AudioContext is created lazily on first play (autoplay policy) and
 * every call is a no-op when muted or unsupported.
 */

const KEY = 'mahjong_sound_off';
let ctx = null;

export function isSoundOn() {
  try { return localStorage.getItem(KEY) !== '1'; } catch { return true; }
}

export function setSoundOn(on) {
  try {
    if (on) localStorage.removeItem(KEY);
    else localStorage.setItem(KEY, '1');
  } catch { /* best effort */ }
}

function getCtx() {
  if (!isSoundOn()) return null;
  try {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  } catch {
    return null;
  }
}

function tone(c, { freq = 440, time = 0, dur = 0.12, type = 'sine', gain = 0.15, slideTo = null }) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + time);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, c.currentTime + time + dur);
  g.gain.setValueAtTime(0, c.currentTime + time);
  g.gain.linearRampToValueAtTime(gain, c.currentTime + time + 0.008);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + time + dur);
  osc.connect(g).connect(c.destination);
  osc.start(c.currentTime + time);
  osc.stop(c.currentTime + time + dur + 0.02);
}

function noise(c, { time = 0, dur = 0.05, gain = 0.2, freq = 2600 }) {
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
  const src = c.createBufferSource();
  src.buffer = buf;
  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = freq;
  filter.Q.value = 1.2;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(filter).connect(g).connect(c.destination);
  src.start(c.currentTime + time);
}

function buzz(pattern) {
  try { navigator.vibrate?.(pattern); } catch { /* unsupported */ }
}

/** Tile hits the table. */
export function playClack() {
  const c = getCtx();
  if (c) {
    noise(c, { dur: 0.045, gain: 0.28, freq: 2400 });
    tone(c, { freq: 190, dur: 0.06, type: 'triangle', gain: 0.1 });
  }
  buzz(8);
}

/** Drawing a tile from the wall. */
export function playDraw() {
  const c = getCtx();
  if (c) noise(c, { dur: 0.035, gain: 0.12, freq: 3600 });
}

/** Call window opened — someone can claim the discard. */
export function playCallAlert() {
  const c = getCtx();
  if (c) {
    tone(c, { freq: 660, dur: 0.1, type: 'triangle', gain: 0.16 });
    tone(c, { freq: 880, time: 0.11, dur: 0.14, type: 'triangle', gain: 0.16 });
  }
  buzz([25, 40, 25]);
}

/** Charleston tiles arrive / handoff. */
export function playSwoosh() {
  const c = getCtx();
  if (c) tone(c, { freq: 300, dur: 0.18, type: 'sine', gain: 0.08, slideTo: 620 });
}

/** Mahjong! */
export function playFanfare() {
  const c = getCtx();
  if (c) {
    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5 E5 G5 C6
    notes.forEach((f, i) => tone(c, { freq: f, time: i * 0.11, dur: 0.28, type: 'triangle', gain: 0.16 }));
    tone(c, { freq: 1318.5, time: 0.46, dur: 0.5, type: 'sine', gain: 0.1 });
  }
  buzz([30, 50, 30, 50, 80]);
}
