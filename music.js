/* =========================================================
   Música: caja musical sintetizada con Web Audio.
   - Toca "Happy Birthday" (dominio público) y luego una
     canción de cuna original, en bucle.
   - Si subes un archivo llamado "cancion.mp3" junto a
     index.html, se reproducirá ese archivo en su lugar.
   ========================================================= */
const Music = (() => {
  const SONG_FILE = 'cancion.mp3';
  const BPM = 92;
  const BEAT = 60 / BPM;

  let ctx = null, master = null, dry = null, wet = null;
  let mode = null;            // 'file' | 'synth'
  let audioEl = null;
  let playing = false;
  let nextTime = 0, segIndex = 0, timer = null;

  // ---------- notas ----------
  const SEMI = { C: -9, D: -7, E: -5, F: -4, G: -2, A: 0, B: 2 };
  function freq(name) {
    const m = /^([A-G])(#|b)?(\d)$/.exec(name);
    let n = SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0) + (parseInt(m[3], 10) - 4) * 12;
    return 440 * Math.pow(2, n / 12);
  }

  // Acordes (raíz, quinta, tercera alta) para el arpegio de caja musical
  const CH = {
    C: ['C3', 'G3', 'E4', 'C4'],
    G: ['G2', 'D3', 'B3', 'G3'],
    F: ['F2', 'C3', 'A3', 'F3'],
    Am: ['A2', 'E3', 'C4', 'A3'],
    Dm: ['D3', 'A3', 'F4', 'D4'],
  };

  // Happy Birthday — melodía [nota, tiempos]. Comienza con anacrusa de 1 tiempo.
  const HB_MELODY = [
    ['G4', .75], ['G4', .25],
    ['A4', 1], ['G4', 1], ['C5', 1],
    ['B4', 2], ['G4', .75], ['G4', .25],
    ['A4', 1], ['G4', 1], ['D5', 1],
    ['C5', 2], ['G4', .75], ['G4', .25],
    ['G5', 1], ['E5', 1], ['C5', 1],
    ['B4', 1], ['A4', 1], ['F5', .75], ['F5', .25],
    ['E5', 1], ['C5', 1], ['D5', 1],
    ['C5', 3],
  ];
  const HB_CHORDS = ['C', 'G', 'G', 'C', 'C', 'F', 'C', 'C']; // un acorde por compás (3/4)

  // Canción de cuna original (3/4), 16 compases
  const LULLABY_MELODY = [
    ['E5', 1.5], ['D5', .5], ['E5', 1],
    ['C5', 2], ['A4', 1],
    ['A4', 1], ['C5', 1], ['F5', 1],
    ['E5', 2], ['D5', 1],
    ['E5', 1.5], ['D5', .5], ['E5', 1],
    ['G5', 2], ['E5', 1],
    ['F5', 1], ['E5', 1], ['D5', 1],
    ['D5', 3],
    ['E5', 1.5], ['D5', .5], ['E5', 1],
    ['C5', 2], ['A4', 1],
    ['A4', 1], ['C5', 1], ['F5', 1],
    ['E5', 2], ['G5', 1],
    ['A5', 1.5], ['G5', .5], ['F5', 1],
    ['E5', 2], ['C5', 1],
    ['D5', 1], ['E5', 1], ['D5', 1],
    ['C5', 3],
  ];
  const LULLABY_CHORDS = ['C', 'Am', 'F', 'G', 'C', 'Am', 'Dm', 'G', 'C', 'Am', 'F', 'G', 'F', 'C', 'G', 'C'];

  const SEGMENTS = [
    { melody: HB_MELODY, chords: HB_CHORDS, pickup: 1, tail: 3 },
    { melody: LULLABY_MELODY, chords: LULLABY_CHORDS, pickup: 0, tail: 0 },
    { melody: LULLABY_MELODY, chords: LULLABY_CHORDS, pickup: 0, tail: 3 },
  ];

  // ---------- timbre de caja musical ----------
  function tine(t, f, vel, len) {
    const out = ctx.createGain();
    out.gain.value = vel;
    out.connect(dry); out.connect(wet);
    // parciales: [multiplicador, amplitud, duración]
    const partials = [[1, 1, len], [2, .32, len * .55], [3.01, .1, len * .3], [5.4, .04, .18]];
    for (const [m, a, d] of partials) {
      const o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = f * m;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(a, t + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g); g.connect(out);
      o.start(t); o.stop(t + d + 0.05);
    }
  }

  function renderSegment(seg, t0) {
    // melodía
    let t = t0;
    for (const [n, beats] of seg.melody) {
      tine(t, freq(n), 0.2, Math.max(1.4, beats * BEAT * 2.2));
      t += beats * BEAT;
    }
    // acompañamiento: arpegio en corcheas (6 por compás de 3/4)
    const barStart = t0 + seg.pickup * BEAT;
    seg.chords.forEach((c, i) => {
      const [r, fifth, third, oct] = CH[c];
      const pattern = [r, fifth, third, fifth, oct, fifth];
      const bt = barStart + i * 3 * BEAT;
      pattern.forEach((n, k) => {
        tine(bt + k * BEAT / 2, freq(n), k === 0 ? 0.11 : 0.05, k === 0 ? 2.2 : 1.1);
      });
    });
    const melodyBeats = seg.melody.reduce((s, [, b]) => s + b, 0);
    return (melodyBeats + seg.tail) * BEAT;
  }

  function scheduler() {
    if (!playing || !ctx) return;
    while (nextTime < ctx.currentTime + 4) {
      const seg = SEGMENTS[segIndex % SEGMENTS.length];
      nextTime += renderSegment(seg, nextTime);
      segIndex++;
    }
  }

  function makeImpulse(seconds, decay) {
    const rate = ctx.sampleRate, len = Math.floor(rate * seconds);
    const buf = ctx.createBuffer(2, len, rate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
    }
    return buf;
  }

  function ensureCtx() {
    if (ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) {}
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 7000;
    const comp = ctx.createDynamicsCompressor(); // evita saturación cuando se superponen notas
    comp.threshold.value = -12; comp.ratio.value = 4;
    master.connect(lp); lp.connect(comp); comp.connect(ctx.destination);
    dry = ctx.createGain(); dry.gain.value = 0.8; dry.connect(master);
    const rev = ctx.createConvolver();
    rev.buffer = makeImpulse(2.8, 2.6);
    wet = ctx.createGain(); wet.gain.value = 0.45;
    wet.connect(rev); rev.connect(master);
  }

  function fadeTo(v, sec) {
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(master.gain.value, now);
    master.gain.linearRampToValueAtTime(v, now + sec);
  }

  function startSynth() {
    mode = 'synth';
    if (!ctx) return;
    ctx.resume();
    nextTime = ctx.currentTime + 0.15;
    segIndex = 0;
    fadeTo(0.55, 1.2);
    clearInterval(timer);
    timer = setInterval(scheduler, 250);
    scheduler();
  }

  // Debe llamarse dentro de un toque/clic del usuario
  function start(onState) {
    playing = true;
    ensureCtx();
    if (ctx && ctx.state === 'suspended') ctx.resume();
    audioEl = new Audio();
    audioEl.src = SONG_FILE;
    audioEl.loop = true;
    audioEl.volume = 0.8;
    audioEl.play()
      .then(() => { mode = 'file'; if (onState) onState(true); })
      .catch(() => { audioEl = null; startSynth(); if (onState) onState(true); });
  }

  function pause() {
    playing = false;
    if (mode === 'file' && audioEl) { audioEl.pause(); return; }
    if (ctx) {
      fadeTo(0, 0.4);
      setTimeout(() => { if (!playing && ctx) ctx.suspend(); }, 450);
    }
  }

  function resume() {
    playing = true;
    if (mode === 'file' && audioEl) { audioEl.play(); return; }
    if (ctx) {
      ctx.resume().then(() => {
        if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.1;
        fadeTo(0.55, 0.8);
        scheduler();
      });
    }
  }

  return {
    start, pause, resume,
    get playing() { return playing; },
    get started() { return mode !== null || audioEl !== null; },
  };
})();
