/* =========================================================
   Maligayang Kaarawan, Schanel — interacciones
   ========================================================= */

/* ---------------------------------------------------------
   CONTENIDO EDITABLE
   (traducción al español en el comentario de cada línea)
   --------------------------------------------------------- */
const TREASURES = [
  { src: 'fotos/tesoro-1.jpg', w: 788, h: 1400, title: 'Ang Reyna', msg: 'Ang reyna ng puso ko. 👑' },                       // La Reina — "La reina de mi corazón."
  { src: 'fotos/tesoro-2.jpg', w: 1050, h: 1400, title: 'Ang Pinaka-cute', msg: 'Kahit nakanguso ka, ang cute mo pa rin. 😚' }, // La más linda — "Aunque hagas pucherito, sigues siendo lindísima."
  { src: 'fotos/tesoro-3.jpg', w: 1400, h: 788, title: 'Elegante', msg: 'Elegante, matapang, at napakaganda. ✨' },          // Elegante — "Elegante, valiente y hermosísima."
  { src: 'fotos/tesoro-4.jpg', w: 1400, h: 788, title: 'Kakulitan', msg: 'Ikaw ang paborito kong kakulitan. ✌️' },          // Travesura — "Eres mi travesura favorita."
  { src: 'fotos/tesoro-5.jpg', w: 1400, h: 788, title: 'Obra Maestra', msg: 'Isang obra maestra na gusto kong titigan habambuhay. 🖼️' }, // Obra maestra — "Una obra maestra que quiero mirar toda la vida."
];

// Mensajes secretos de los corazones flotantes
const MESSAGES = [
  'Ikaw ang pinakamagandang regalo sa buhay ko. 🎁',      // Eres el regalo más bonito de mi vida.
  'Bawat ngiti mo ay isang kayamanan. 💎',                 // Cada sonrisa tuya es un tesoro.
  'Ang swerte ko sa\'yo, mahal. 🍀',                        // Qué suerte tengo de tenerte, amor.
  'Ikaw ang paborito kong tao. 🥰',                         // Eres mi persona favorita.
  'Kahit malayo ka, lagi kang nasa puso ko. 💞',            // Aunque estés lejos, siempre estás en mi corazón.
  'Mas lalo kang gumaganda bawat taon. 🌸',                 // Cada año eres más hermosa.
  'Proud na proud ako sa\'yo. 🌟',                          // Estoy muy orgulloso de ti.
  'Hindi na ako makapaghintay na mayakap ka. 🤗',           // No puedo esperar para abrazarte.
  'Salamat sa pagiging ikaw. 💐',                           // Gracias por ser tú.
  'Ikaw ang tahanan ng puso ko. 🏡',                        // Eres el hogar de mi corazón.
  'Araw-araw, ikaw ang pinipili ko. 💍',                    // Cada día, te elijo a ti.
  'Ang ganda mo, alam mo ba \'yon? 😍',                     // Eres hermosa, ¿lo sabías?
  'Sana lagi kang masaya, mahal ko. ☀️',                    // Ojalá siempre seas feliz, mi amor.
  'Ikaw ang aking mundo. 🌍',                               // Eres mi mundo.
  'Mahal na mahal kita, Schanel. 💖',                       // Te amo muchísimo, Schanel.
];

/* --------------------------------------------------------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* =========================================================
   CIELO ESTRELLADO
   ========================================================= */
(() => {
  const c = $('#sky'), g = c.getContext('2d');
  let W, H, stars = [], shoot = null, nextShoot = performance.now() + 4000;
  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(220, Math.floor((W * H) / 5500));
    stars = Array.from({ length: n }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() < .12 ? rand(1.2, 1.9) : rand(.3, 1.1),
      a: rand(.35, .95), s: rand(.6, 2.2), p: rand(0, Math.PI * 2),
      hue: Math.random() < .2 ? '255,200,225' : Math.random() < .3 ? '255,236,190' : '255,255,255',
    }));
  }
  function frame(t) {
    g.clearRect(0, 0, W, H);
    const time = t / 1000;
    for (const s of stars) {
      const al = s.a * (reduceMotion ? 1 : (.55 + .45 * Math.sin(time * s.s + s.p)));
      g.fillStyle = `rgba(${s.hue},${al})`;
      g.beginPath(); g.arc(s.x, s.y, s.r, 0, Math.PI * 2); g.fill();
      if (s.r > 1.2) {
        g.fillStyle = `rgba(${s.hue},${al * .25})`;
        g.beginPath(); g.arc(s.x, s.y, s.r * 3.2, 0, Math.PI * 2); g.fill();
      }
    }
    // estrella fugaz
    if (!reduceMotion) {
      if (!shoot && t > nextShoot) {
        shoot = { x: rand(W * .1, W * .9), y: rand(0, H * .35), vx: rand(7, 11) * (Math.random() < .5 ? -1 : 1), vy: rand(3, 5), life: 0 };
      }
      if (shoot) {
        shoot.x += shoot.vx; shoot.y += shoot.vy; shoot.life++;
        const tail = 14;
        const grad = g.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx * tail, shoot.y - shoot.vy * tail);
        const fade = Math.max(0, 1 - shoot.life / 70);
        grad.addColorStop(0, `rgba(255,245,220,${fade})`);
        grad.addColorStop(1, 'rgba(255,245,220,0)');
        g.strokeStyle = grad; g.lineWidth = 2; g.lineCap = 'round';
        g.beginPath(); g.moveTo(shoot.x, shoot.y); g.lineTo(shoot.x - shoot.vx * tail, shoot.y - shoot.vy * tail); g.stroke();
        if (shoot.life > 70) { shoot = null; nextShoot = t + rand(5000, 11000); }
      }
    }
    requestAnimationFrame(frame);
  }
  resize();
  window.addEventListener('resize', resize);
  requestAnimationFrame(frame);
})();

/* =========================================================
   EFECTOS: confeti, corazones y chispas
   ========================================================= */
const fx = (() => {
  const c = $('#fx'), g = c.getContext('2d');
  const COLORS = ['#ff7eb6', '#ffd1e5', '#f3cf75', '#fff1b8', '#c9a7ff', '#ff5c9e', '#ffffff'];
  const HEART_COLORS = ['#ff7eb6', '#ff5c9e', '#ff9fc8', '#ffd1e5', '#f3cf75'];
  let W, H, parts = [], running = false;

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth; H = window.innerHeight;
    c.width = W * dpr; c.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  function heartPath(s) {
    g.beginPath();
    g.moveTo(0, s * .9);
    g.bezierCurveTo(-s * 1.25, -s * .05, -s * .6, -s * 1.05, 0, -s * .35);
    g.bezierCurveTo(s * .6, -s * 1.05, s * 1.25, -s * .05, 0, s * .9);
    g.closePath();
  }

  function make(kind, x, y, vx, vy, opt = {}) {
    return {
      kind, x, y, vx, vy,
      g: opt.gravity ?? (kind === 'heart' ? .06 : .16),
      drag: opt.drag ?? .985,
      rot: rand(0, Math.PI * 2), vr: rand(-.15, .15),
      flip: rand(0, Math.PI * 2), vf: rand(.05, .2),
      size: kind === 'heart' ? rand(6, 12) : kind === 'spark' ? rand(1.5, 3.5) : rand(5, 10),
      color: kind === 'heart' ? pick(HEART_COLORS) : pick(COLORS),
      life: opt.life ?? rand(90, 150),
      max: 0,
    };
  }

  function add(p) {
    p.max = p.life;
    parts.push(p);
    if (!running) { running = true; requestAnimationFrame(loop); }
  }

  function burst(x, y, opt = {}) {
    const count = Math.round((opt.count ?? 40) * (reduceMotion ? .3 : 1));
    const kinds = opt.kinds ?? ['confetti', 'heart', 'spark'];
    const speed = opt.speed ?? 7;
    for (let i = 0; i < count; i++) {
      const a = rand(0, Math.PI * 2), v = rand(speed * .35, speed);
      add(make(pick(kinds), x, y, Math.cos(a) * v, Math.sin(a) * v - (opt.lift ?? 2), opt));
    }
  }

  function rain(opt = {}) {
    const count = Math.round((opt.count ?? 160) * (reduceMotion ? .25 : 1));
    const kinds = opt.kinds ?? ['confetti', 'confetti', 'heart'];
    for (let i = 0; i < count; i++) {
      const k = pick(kinds);
      add(make(k, rand(0, W), rand(-H * .6, -10), rand(-1, 1), rand(1.5, 4), {
        gravity: k === 'heart' ? .02 : .05, drag: .995, life: rand(220, 340), ...opt,
      }));
    }
  }

  function loop() {
    g.clearRect(0, 0, W, H);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.vy += p.g; p.vx *= p.drag; p.vy *= p.drag;
      p.x += p.vx + (p.kind === 'heart' ? Math.sin(p.flip) * .4 : 0);
      p.y += p.vy;
      p.rot += p.vr; p.flip += p.vf; p.life--;
      if (p.life <= 0 || p.y > H + 40) { parts.splice(i, 1); continue; }
      const alpha = Math.min(1, p.life / 40);
      g.save();
      g.globalAlpha = alpha;
      g.translate(p.x, p.y);
      if (p.kind === 'confetti') {
        g.rotate(p.rot);
        g.scale(1, Math.cos(p.flip));
        g.fillStyle = p.color;
        g.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else if (p.kind === 'heart') {
        g.rotate(Math.sin(p.flip) * .3);
        g.fillStyle = p.color;
        heartPath(p.size);
        g.fill();
      } else {
        g.fillStyle = p.color;
        g.shadowColor = p.color; g.shadowBlur = 8;
        g.beginPath(); g.arc(0, 0, p.size, 0, Math.PI * 2); g.fill();
      }
      g.restore();
    }
    if (parts.length) requestAnimationFrame(loop);
    else { running = false; g.clearRect(0, 0, W, H); }
  }

  return { burst, rain };
})();

function centerOf(el) {
  const r = el.getBoundingClientRect();
  return [r.left + r.width / 2, r.top + r.height / 2];
}

/* =========================================================
   TOAST (mensajes bonitos)
   ========================================================= */
const toastEl = $('#toast');
let toastTimer = null;
function toast(text, label, ms = 4300) {
  toastEl.replaceChildren();
  if (label) {
    const s = document.createElement('small');
    s.textContent = label;
    toastEl.appendChild(s);
  }
  toastEl.appendChild(document.createTextNode(text));
  toastEl.classList.remove('show');
  void toastEl.offsetWidth;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), ms);
}

/* =========================================================
   MÚSICA (botón)
   ========================================================= */
const musicBtn = $('#musicBtn');
function setMusicUI(on) { musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false'); }
musicBtn.addEventListener('click', () => {
  if (Music.playing) { Music.pause(); setMusicUI(false); }
  else if (!Music.started) { Music.start(); setMusicUI(true); }
  else { Music.resume(); setMusicUI(true); }
});
let resumeOnShow = false;
document.addEventListener('visibilitychange', () => {
  if (document.hidden && Music.playing) { Music.pause(); resumeOnShow = true; }
  else if (!document.hidden && resumeOnShow) { Music.resume(); resumeOnShow = false; }
});

/* =========================================================
   NOMBRE ANIMADO
   ========================================================= */
(() => {
  const el = $('#heroName');
  const name = el.textContent.trim();
  el.textContent = '';
  [...name].forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.style.setProperty('--i', i);
    s.setAttribute('aria-hidden', 'true');
    s.textContent = ch;
    el.appendChild(s);
  });
})();

/* =========================================================
   INTRO: abrir el regalo
   ========================================================= */
let started = false;
$('#giftBtn').addEventListener('click', function () {
  if (started) return;
  started = true;
  Music.start();
  setMusicUI(true);
  this.classList.add('open');
  const [x, y] = centerOf(this);
  setTimeout(() => fx.burst(x, y, { count: 130, speed: 12, lift: 4 }), 250);
  setTimeout(() => {
    $('#intro').classList.add('gone');
    document.body.classList.remove('locked');
    document.body.classList.add('started');
    fx.rain({ count: 150 });
    startFloaters();
  }, 950);
  setTimeout(() => $('#intro').remove(), 2400);
  setTimeout(() => toast('Maligayang kaarawan, mahal ko! 🎂💖', 'Para sa iyo'), 3800);
});

/* =========================================================
   CORAZONES FLOTANTES CON MENSAJES SECRETOS
   ========================================================= */
const floaters = $('#floaters');
const found = new Set();
let msgCursor = 0, allFoundShown = false;
$('#totalCount').textContent = MESSAGES.length;

// gradientes compartidos para los corazones SVG
document.body.insertAdjacentHTML('afterbegin', `
  <svg width="0" height="0" style="position:absolute" aria-hidden="true">
    <defs>
      <linearGradient id="hgPink" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffc2dc"/><stop offset=".5" stop-color="#ff7eb6"/><stop offset="1" stop-color="#e2468f"/></linearGradient>
      <linearGradient id="hgGold" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff1b8"/><stop offset=".5" stop-color="#f3cf75"/><stop offset="1" stop-color="#b8862b"/></linearGradient>
    </defs>
  </svg>`);
const heartSVG = (grad) => `<svg viewBox="0 0 32 29" aria-hidden="true"><path d="M16 28.5S1 19 1 9.2C1 4.6 4.6 1 9 1c3 0 5.6 1.7 7 4.1C17.4 2.7 20 1 23 1c4.4 0 8 3.6 8 8.2C31 19 16 28.5 16 28.5z" fill="url(#${grad})" stroke="rgba(255,255,255,.7)" stroke-width="1"/><ellipse cx="9.5" cy="8" rx="3" ry="2" fill="rgba(255,255,255,.55)" transform="rotate(-30 9.5 8)"/></svg>`;

// Mientras ella lee la carta, no salen corazones nuevos (para no distraer)
let readingLetter = false;
new IntersectionObserver(([en]) => { readingLetter = en.isIntersecting; }, { threshold: .25 })
  .observe($('#letterPaper'));

function spawnFloater() {
  if (document.hidden || readingLetter || floaters.childElementCount >= 5) return;
  const b = document.createElement('button');
  b.className = 'floater';
  b.setAttribute('aria-label', 'Lihim na mensahe');
  const size = rand(40, 58), dur = rand(11, 16);
  b.style.setProperty('--s', size + 'px');
  b.style.setProperty('--d', dur + 's');
  b.style.setProperty('--sw', rand(2.4, 3.8) + 's');
  b.style.left = `calc(${rand(3, 94)}% - ${size / 2}px)`;
  b.innerHTML = `<span class="heart">${heartSVG(Math.random() < .25 ? 'hgGold' : 'hgPink')}</span>`;
  b.addEventListener('click', (e) => { e.stopPropagation(); popFloater(b); });
  floaters.appendChild(b);
  setTimeout(() => b.remove(), dur * 1000 + 300);
}

function popFloater(b) {
  if (b.classList.contains('pop')) return;
  const [x, y] = centerOf(b);
  b.style.transform = getComputedStyle(b).transform;
  b.classList.add('pop');
  setTimeout(() => b.remove(), 500);
  fx.burst(x, y, { count: 28, kinds: ['heart', 'spark', 'heart'], speed: 5.5 });

  const idx = msgCursor % MESSAGES.length;
  msgCursor++;
  const isNew = !found.has(idx);
  found.add(idx);
  toast(MESSAGES[idx], `Lihim na mensahe #${idx + 1}`);
  if (isNew) {
    $('#foundCount').textContent = found.size;
    const counter = $('#counter');
    counter.classList.remove('bump'); void counter.offsetWidth; counter.classList.add('bump');
  }
  if (found.size === MESSAGES.length && !allFoundShown) {
    allFoundShown = true;
    setTimeout(() => {
      fx.rain({ count: 220, kinds: ['heart', 'confetti', 'heart'] });
      toast('Nahanap mo na lahat ng lihim na mensahe! Pero ang pinakamahalaga: mahal na mahal kita. 💖', 'Wow, mahal ko!', 6500);
    }, 4400);
  }
}

function startFloaters() {
  setTimeout(spawnFloater, 1200);
  setTimeout(spawnFloater, 2600);
  setInterval(spawnFloater, 2700);
}

/* corazoncitos al tocar cualquier parte */
document.addEventListener('pointerdown', (e) => {
  if (!started || e.target.closest('button, a, .lightbox, .letter')) return;
  fx.burst(e.clientX, e.clientY, { count: 9, kinds: ['heart', 'spark'], speed: 3.2, gravity: -.03, lift: 1.5, life: 70 });
});

/* =========================================================
   PASTEL: soplar las velas
   ========================================================= */
(() => {
  const candles = $$('.candle');
  const cake = $('#cakeEl'), msg = $('#cakeMsg'), relight = $('#relightBtn');
  candles.forEach((c) => c.addEventListener('click', () => {
    if (c.classList.contains('out')) return;
    c.classList.add('out');
    c.setAttribute('aria-label', 'Nahipan na');
    const flame = c.querySelector('.flame');
    const [x, y] = centerOf(flame);
    fx.burst(x, y, { count: 12, kinds: ['spark'], speed: 2.5, gravity: -.02, life: 60 });
    if (candles.every((k) => k.classList.contains('out'))) {
      setTimeout(() => {
        cake.classList.add('all-out');
        const [cx, cy] = centerOf(cake);
        fx.burst(cx, cy - 60, { count: 120, speed: 11, lift: 4 });
        fx.rain({ count: 140 });
        msg.innerHTML = 'Sana matupad lahat ng hiling mo, mahal ko! ✨<small>(sana kasama ako sa hiling mo 🙈)</small>';
        msg.classList.remove('show'); void msg.offsetWidth; msg.classList.add('show');
        relight.hidden = false;
      }, 450);
    }
  }));
  relight.addEventListener('click', () => {
    candles.forEach((c, i) => { c.classList.remove('out'); c.setAttribute('aria-label', `Hipan ang kandila ${i + 1}`); });
    cake.classList.remove('all-out');
    msg.textContent = '';
    msg.classList.remove('show');
    relight.hidden = true;
    toast('Mag-wish ka ulit! 🌠', 'Isa pa');
  });
})();

/* =========================================================
   TESOROS
   ========================================================= */
const gallery = $('#gallery');
let openedCount = 0;

TREASURES.forEach((t, i) => {
  const fig = document.createElement('figure');
  fig.className = 'treasure';
  fig.style.setProperty('--ar', `${t.w} / ${t.h}`);
  fig.style.setProperty('--i', i);
  const sparkles = Array.from({ length: 6 }, () => {
    const side = Math.random();
    const pos = side < .25 ? `top:-12px;left:${rand(5, 90)}%`
      : side < .5 ? `bottom:-12px;left:${rand(5, 90)}%`
      : side < .75 ? `left:-12px;top:${rand(5, 90)}%`
      : `right:-12px;top:${rand(5, 90)}%`;
    return `<span class="sparkle" style="${pos};--fs:${rand(11, 20).toFixed(0)}px;--dl:${rand(0, 2.6).toFixed(2)}s">✦</span>`;
  }).join('');
  fig.innerHTML = `
    <button class="frame" aria-label="Buksan ang kayamanan ${i + 1}">
      <span class="frame-inner">
        <img src="${t.src}" width="${t.w}" height="${t.h}" alt="Larawan ni Schanel — ${t.title}" loading="lazy" decoding="async">
        <span class="veil">
          <span class="curtain l"></span><span class="curtain r"></span>
          <span class="medal">
            <span class="gem">💎</span>
            <span class="m-title">Kayamanan #${i + 1}</span>
            <span class="m-hint">Pindutin para buksan</span>
          </span>
        </span>
      </span>
      <span class="corner tl"></span><span class="corner tr"></span><span class="corner bl"></span><span class="corner br"></span>
      ${sparkles}
    </button>
    <figcaption class="plaque"><span class="p-no">Kayamanan Blg. ${i + 1}</span><span class="p-title">Nakatagong kayamanan</span></figcaption>`;
  const frame = fig.querySelector('.frame');
  frame.addEventListener('click', () => {
    if (!fig.classList.contains('open')) openTreasure(fig, i);
    else openLightbox(i);
  });
  gallery.appendChild(fig);
});

function openTreasure(fig, i) {
  const t = TREASURES[i];
  fig.classList.add('open');
  fig.querySelector('.p-title').textContent = t.title;
  fig.querySelector('.frame').setAttribute('aria-label', `Tingnan ang ${t.title}`);
  const [x, y] = centerOf(fig.querySelector('.frame'));
  setTimeout(() => fx.burst(x, y, { count: 70, speed: 9, lift: 3 }), 350);
  toast(t.msg, `Kayamanan Blg. ${i + 1} · ${t.title}`);
  openedCount++;
  if (openedCount === TREASURES.length) {
    setTimeout(() => {
      fx.rain({ count: 160, kinds: ['confetti', 'heart', 'heart'] });
      toast('Nabuksan mo na lahat ng kayamanan... pero ikaw pa rin ang pinakamahalaga sa lahat. 💛', 'Ang pinakamalaking kayamanan', 6000);
    }, 4600);
  }
}

/* ---------- visor ---------- */
const lb = $('#lightbox'), lbImg = $('#lbImg'), lbCap = $('#lbCaption');
let lbList = [], lbPos = 0;
function openedIndexes() { return $$('.treasure').map((f, i) => (f.classList.contains('open') ? i : -1)).filter((i) => i >= 0); }
function showLb() {
  const t = TREASURES[lbList[lbPos]];
  lbImg.src = t.src;
  lbImg.alt = `Larawan ni Schanel — ${t.title}`;
  lbCap.textContent = t.msg;
  const frame = $('.lb-frame');
  frame.style.animation = 'none'; void frame.offsetWidth; frame.style.animation = '';
  const multi = lbList.length > 1;
  $('#lbPrev').hidden = !multi; $('#lbNext').hidden = !multi;
}
function openLightbox(i) {
  lbList = openedIndexes();
  lbPos = Math.max(0, lbList.indexOf(i));
  showLb();
  lb.hidden = false;
  document.body.style.overflow = 'hidden';
  $('#lbClose').focus({ preventScroll: true });
}
function closeLightbox() { lb.hidden = true; document.body.style.overflow = ''; }
function stepLb(d) { lbPos = (lbPos + d + lbList.length) % lbList.length; showLb(); }
$('#lbClose').addEventListener('click', closeLightbox);
$('#lbPrev').addEventListener('click', (e) => { e.stopPropagation(); stepLb(-1); });
$('#lbNext').addEventListener('click', (e) => { e.stopPropagation(); stepLb(1); });
lb.addEventListener('click', (e) => { if (e.target === lb) closeLightbox(); });
document.addEventListener('keydown', (e) => {
  if (lb.hidden) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') stepLb(-1);
  if (e.key === 'ArrowRight') stepLb(1);
});
let touchX = null;
lb.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', (e) => {
  if (touchX === null || lbList.length < 2) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 50) stepLb(dx < 0 ? 1 : -1);
  touchX = null;
});

/* =========================================================
   CARTA
   ========================================================= */
(() => {
  const env = $('#envelope'), paper = $('#letterPaper'), hint = $('#letterHint');
  let opened = false;
  env.addEventListener('click', () => {
    if (opened) return;
    opened = true;
    env.classList.add('open');
    env.setAttribute('aria-label', 'Nabuksan na ang sulat');
    const [x, y] = centerOf(env);
    fx.burst(x, y, { count: 50, kinds: ['heart', 'heart', 'spark'], speed: 7, lift: 3 });
    setTimeout(() => {
      env.classList.add('done');
      hint.textContent = 'Para sa iyo, mahal ko 💗';
      paper.hidden = false;
      const lines = $$('.l', paper);
      lines.forEach((l, i) => { l.style.transitionDelay = `${(reduceMotion ? 0 : .6 + i * .85).toFixed(2)}s`; });
      requestAnimationFrame(() => requestAnimationFrame(() => paper.classList.add('show')));
      setTimeout(() => paper.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }), 150);
      // al terminar de aparecer la carta: lluvia suave de corazones (sin toast, para no tapar el texto)
      const total = reduceMotion ? 500 : (600 + lines.length * 850 + 600);
      setTimeout(() => fx.rain({ count: 40, kinds: ['heart'] }), total);
    }, 1500);
  });
})();

/* =========================================================
   FINAL + REVEAL AL HACER SCROLL
   ========================================================= */
$('#confettiBtn').addEventListener('click', function () {
  const [x, y] = centerOf(this);
  fx.burst(x, y, { count: 90, speed: 11, lift: 5 });
  fx.rain({ count: 180 });
  toast(pick(MESSAGES), 'Isa pa! 🎉');
});

const io = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in-view'); io.unobserve(en.target); }
  });
}, { threshold: .12 });
$$('.reveal').forEach((el) => io.observe(el));
