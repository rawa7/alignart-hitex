(() => {
  "use strict";

  // Default odds: 30% "Good luck"; the remaining 70% split 50/30/10/5/5 across 1/3/4/6/12 months.
  const PRIZES = [
    { id: "luck", months: 0, weight: 30, label: "Good luck" },
    { id: "m1", months: 1, weight: 35, label: "1 month" },
    { id: "m3", months: 3, weight: 21, label: "3 months" },
    { id: "m4", months: 4, weight: 7, label: "4 months" },
    { id: "m6", months: 6, weight: 3.5, label: "6 months", grand: true },
    { id: "m12", months: 12, weight: 3.5, label: "12 months", grand: true },
  ];
  const PRIZE_BY_ID = Object.fromEntries(PRIZES.map((p) => [p.id, p]));
  const DEFAULT_ODDS = Object.fromEntries(PRIZES.map((p) => [p.id, p.weight]));

  const KEYS = { lang: "hitex.lang", sound: "hitex.sound", odds: "hitex.odds.v1", history: "hitex.history.v1" };
  const MAX_HISTORY = 5000;
  const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const I18N = {
    en: {
      dir: "ltr",
      eyebrow: "HITEX Lucky Bag",
      title: "Pull a paper, win <em>AlignArt&nbsp;Premium</em>",
      subtitle: "Tap the bag and pull your paper — up to 12 months free inside.",
      draw: "Draw my paper",
      drawing: "Mixing the papers…",
      tapHint: "Tap the bag",
      prizesLabel: "Inside the bag",
      unit: (n) => (n === 1 ? "month" : "months"),
      grand: "Grand prize",
      congrats: "Congratulations!",
      youWon: "You won",
      plan: "AlignArt Premium — free",
      code: "Prize code",
      showTeam: "Show this paper to our team to activate your prize.",
      luckTitle: "Good luck!",
      luckSub: "Not this time — thanks for visiting AlignArt.",
      luckBody: "Scan to get the AlignArt app and create your digital card for free.",
      qrAlt: "QR code to download the AlignArt app",
      next: "Next customer",
      staffNote: "Customer phone or AlignArt username (staff only)",
      save: "Save",
      saved: "Saved",
    },
    ckb: {
      dir: "rtl",
      eyebrow: "کیسەی بەخت · HITEX",
      title: "کاغەزێک دەربهێنە و <em>AlignArt Premium</em> ببەرەوە",
      subtitle: "دەست لە کیسەکە بدە و کاغەزەکەت دەربهێنە — تا ١٢ مانگ بەخۆڕایی.",
      draw: "کاغەزەکەم دەربهێنە",
      drawing: "کاغەزەکان تێکەڵ دەکەین…",
      tapHint: "دەست لە کیسەکە بدە",
      prizesLabel: "خەڵاتەکانی ناو کیسەکە",
      unit: () => "مانگ",
      grand: "خەڵاتی گەورە",
      congrats: "پیرۆزە!",
      youWon: "تۆ بردتەوە",
      plan: "AlignArt Premium بەخۆڕایی",
      code: "کۆدی خەڵات",
      showTeam: "ئەم کاغەزە نیشانی تیمەکەمان بدە بۆ چالاککردنی خەڵاتەکەت.",
      luckTitle: "بەختت باش بێت!",
      luckSub: "ئەمجارە نەبوو — سوپاس بۆ سەردانەکەت.",
      luckBody: "سکان بکە، ئەپی AlignArt دابگرە و کارتی دیجیتاڵی خۆت بەخۆڕایی دروست بکە.",
      qrAlt: "کۆدی QR بۆ داگرتنی ئەپی AlignArt",
      next: "کەسی دواتر",
      staffNote: "ژمارەی مۆبایل یان ناوی بەکارهێنەری کڕیار (تەنها بۆ ستاف)",
      save: "پاشەکەوت",
      saved: "پاشەکەوت کرا",
    },
    ar: {
      dir: "rtl",
      eyebrow: "كيس الحظ · HITEX",
      title: "اسحب ورقة واربح <em>AlignArt Premium</em>",
      subtitle: "اضغط على الكيس واسحب ورقتك — حتى ١٢ شهراً مجاناً.",
      draw: "اسحب ورقتي",
      drawing: "نخلط الأوراق…",
      tapHint: "اضغط على الكيس",
      prizesLabel: "الجوائز داخل الكيس",
      unit: (n) => (n === 1 ? "شهر" : n <= 10 ? "أشهر" : "شهراً"),
      grand: "الجائزة الكبرى",
      congrats: "مبروك!",
      youWon: "لقد ربحت",
      plan: "AlignArt Premium مجاناً",
      code: "رمز الجائزة",
      showTeam: "أظهر هذه الورقة لفريقنا لتفعيل جائزتك.",
      luckTitle: "حظاً أوفر!",
      luckSub: "ليس هذه المرة — شكراً لزيارتك.",
      luckBody: "امسح الرمز لتحميل تطبيق AlignArt وأنشئ بطاقتك الرقمية مجاناً.",
      qrAlt: "رمز QR لتحميل تطبيق AlignArt",
      next: "الشخص التالي",
      staffNote: "رقم هاتف العميل أو اسم المستخدم (للموظفين فقط)",
      save: "حفظ",
      saved: "تم الحفظ",
    },
  };

  const ICONS = {
    star: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2 3 6.5 7 .9-5.1 4.8 1.3 7L12 17.8 5.8 21.2l1.3-7L2 9.4l7-.9L12 2Z"/></svg>',
    arrow: '<svg class="t-arrow" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14"/><path d="m6 13 6 6 6-6"/></svg>',
    clover:
      '<svg class="t-clover" viewBox="0 0 64 64" aria-hidden="true"><g transform="translate(32 30)" fill="#22A355">' +
      ['45', '135', '225', '315']
        .map((a) => `<path transform="rotate(${a})" d="M0 0C-3-4-11-7-11-15A6 6 0 0 1 0-18A6 6 0 0 1 11-15C11-7 3-4 0 0Z"/>`)
        .join("") +
      '</g><path d="M33 33c3 9 8 15 15 21" fill="none" stroke="#15803D" stroke-width="4" stroke-linecap="round"/><circle cx="32" cy="30" r="4" fill="#86EFAC"/></svg>',
  };

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        /* storage full or blocked: the draw still works, it just isn't logged */
      }
    },
  };

  const params = new URLSearchParams(location.search);
  const queryLang = params.get("lang");

  const state = {
    lang: I18N[queryLang] ? queryLang : I18N[store.get(KEYS.lang)] ? store.get(KEYS.lang) : "en",
    sound: store.get(KEYS.sound, true) !== false,
    odds: sanitizeOdds(store.get(KEYS.odds, null)),
    history: Array.isArray(store.get(KEYS.history, [])) ? store.get(KEYS.history, []) : [],
  };

  const els = {
    brand: $("#brand"),
    bag: $("#bag"),
    slip: $("#slip"),
    drawBtn: $("#drawBtn"),
    drawLabel: $("#drawBtn .cta-label"),
    strip: $("#prizeStrip"),
    soundBtn: $("#soundBtn"),
    fullscreenBtn: $("#fullscreenBtn"),
    reveal: $("#reveal"),
    backdrop: $(".reveal-backdrop"),
    content: $(".reveal-content"),
    wrap: $("#ticketWrap"),
    ticket: $("#ticket"),
    ticketTop: $("#ticketTop"),
    slotTop: $("#slotTop"),
    slotBottom: $("#slotBottom"),
    shade: $("#foldShade"),
    actions: $("#revealActions"),
    staffForm: $("#staffNote"),
    staffInput: $("#staffInput"),
    staffSave: $("#staffNote button"),
    nextBtn: $("#nextBtn"),
    admin: $("#admin"),
    adminClose: $("#adminClose"),
    adminTotal: $("#adminTotal"),
    adminStats: $("#adminStats tbody"),
    oddsGrid: $("#oddsGrid"),
    oddsSum: $("#oddsSum"),
    oddsReset: $("#oddsReset"),
    history: $("#history"),
    historySearch: $("#historySearch"),
    exportCsv: $("#exportCsv"),
    clearHistory: $("#clearHistory"),
  };

  function sanitizeOdds(raw) {
    const odds = { ...DEFAULT_ODDS };
    if (raw && typeof raw === "object") {
      for (const p of PRIZES) {
        const v = Number(raw[p.id]);
        if (Number.isFinite(v) && v >= 0) odds[p.id] = v;
      }
    }
    return odds;
  }

  const oddsTotal = () => PRIZES.reduce((sum, p) => sum + state.odds[p.id], 0);

  /* ---------- i18n ---------- */

  function t(key, ...args) {
    const value = I18N[state.lang][key] ?? I18N.en[key];
    return typeof value === "function" ? value(...args) : value;
  }

  function fmt(n) {
    return state.lang === "en" ? String(n) : new Intl.NumberFormat("ar-u-nu-arab").format(n);
  }

  function applyLang() {
    const root = document.documentElement;
    root.lang = state.lang;
    root.dir = I18N[state.lang].dir;
    $$("[data-i18n]").forEach((el) => {
      el.innerHTML = t(el.dataset.i18n);
    });
    $$("[data-i18n-aria]").forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
    $$(".lang button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === state.lang)));
    renderStrip();
    if (current) fillTicket(current);
  }

  function setLang(lang) {
    if (!I18N[lang]) return;
    state.lang = lang;
    store.set(KEYS.lang, lang);
    applyLang();
  }

  function setDrawLabel(key) {
    els.drawLabel.dataset.i18n = key;
    els.drawLabel.innerHTML = t(key);
  }

  function renderStrip() {
    els.strip.innerHTML = PRIZES.filter((p) => p.months && state.odds[p.id] > 0)
      .map(
        (p) =>
          `<li class="${p.grand ? "grand" : ""}">${p.grand ? ICONS.star : ""}<b>${fmt(p.months)}</b><span>${t("unit", p.months)}</span></li>`,
      )
      .join("");
  }

  /* ---------- Draw logic ---------- */

  function randomUnit() {
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    return buf[0] / 2 ** 32;
  }

  function pickPrize() {
    const total = oddsTotal();
    if (total <= 0) return PRIZE_BY_ID.luck;
    let r = randomUnit() * total;
    for (const p of PRIZES) {
      const w = state.odds[p.id];
      if (r < w) return p;
      r -= w;
    }
    return PRIZES.filter((p) => state.odds[p.id] > 0).pop();
  }

  function makeCode(months) {
    const used = new Set(state.history.map((h) => h.code));
    let code;
    do {
      const bytes = crypto.getRandomValues(new Uint8Array(4));
      code = `HX${months}-${Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("")}`;
    } while (used.has(code));
    return code;
  }

  function recordDraw(prize) {
    const rec = {
      id: `${Date.now().toString(36)}${Math.floor(randomUnit() * 1e6).toString(36)}`,
      at: new Date().toISOString(),
      prize: prize.id,
      code: prize.months ? makeCode(prize.months) : "",
      note: "",
    };
    state.history.unshift(rec);
    if (state.history.length > MAX_HISTORY) state.history.length = MAX_HISTORY;
    store.set(KEYS.history, state.history);
    return rec;
  }

  function saveNote(rec, note) {
    const target = state.history.find((h) => h.id === rec.id);
    if (!target) return;
    target.note = note.trim();
    rec.note = target.note;
    store.set(KEYS.history, state.history);
  }

  /* ---------- Sound (synthesized, no files) ---------- */

  const Sound = {
    ctx: null,
    master: null,
    noiseBuf: null,

    init() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
        this.master = this.ctx.createGain();
        this.master.gain.value = 0.7;
        this.master.connect(this.ctx.destination);
      }
      if (this.ctx.state === "suspended") this.ctx.resume();
      return this.ctx;
    },

    tone(freq, at, dur, { type = "triangle", gain = 0.2, slideTo } = {}) {
      const ctx = this.ctx;
      const t0 = ctx.currentTime + at;
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(g).connect(this.master);
      osc.start(t0);
      osc.stop(t0 + dur + 0.05);
    },

    noise(at, dur, { freq = 2000, q = 0.8, gain = 0.25 } = {}) {
      const ctx = this.ctx;
      const t0 = ctx.currentTime + at;
      if (!this.noiseBuf) {
        const buf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
        this.noiseBuf = buf;
      }
      const src = ctx.createBufferSource();
      src.buffer = this.noiseBuf;
      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.value = freq;
      filter.Q.value = q;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      src.connect(filter).connect(g).connect(this.master);
      src.start(t0, Math.random() * 0.5);
      src.stop(t0 + dur + 0.05);
    },

    play(name) {
      if (!state.sound || !this.init()) return;
      const fx = this.effects[name];
      if (fx) fx.call(this);
    },

    effects: {
      rustle() {
        for (let i = 0; i < 8; i++) {
          this.noise(i * 0.11 + Math.random() * 0.03, 0.09 + Math.random() * 0.06, {
            freq: 1400 + Math.random() * 2600,
            q: 0.7,
            gain: 0.16 + Math.random() * 0.12,
          });
        }
      },
      pop() {
        this.tone(300, 0, 0.18, { type: "sine", gain: 0.22, slideTo: 980 });
        this.noise(0, 0.07, { freq: 4200, gain: 0.08 });
      },
      unfold() {
        this.noise(0, 0.32, { freq: 2600, q: 0.5, gain: 0.12 });
        this.noise(0.14, 0.22, { freq: 3800, q: 0.6, gain: 0.08 });
      },
      win() {
        [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, i * 0.09, 0.55, { gain: 0.18 }));
        [523.25, 783.99, 1046.5].forEach((f) => this.tone(f, 0.38, 0.9, { type: "sine", gain: 0.08 }));
      },
      grand() {
        [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568].forEach((f, i) => this.tone(f, i * 0.08, 0.5, { gain: 0.17 }));
        [1046.5, 1318.5, 1568].forEach((f) => this.tone(f, 0.52, 1.4, { type: "sine", gain: 0.08 }));
        for (let i = 0; i < 10; i++) this.tone(2000 + Math.random() * 1600, 0.6 + i * 0.09, 0.14, { type: "sine", gain: 0.05 });
      },
      luck() {
        this.tone(392, 0, 0.4, { type: "sine", gain: 0.14 });
        this.tone(523.25, 0.18, 0.6, { type: "sine", gain: 0.12 });
      },
    },
  };

  const vibrate = (pattern) => {
    if (navigator.vibrate) navigator.vibrate(pattern);
  };

  /* ---------- Confetti ---------- */

  const Confetti = (() => {
    const canvas = $("#confetti");
    const ctx = canvas.getContext("2d");
    let parts = [];
    let raf = 0;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(innerWidth * dpr);
      canvas.height = Math.round(innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function burst({ x, y, count = 100, angle = -90, spread = 120, power = 14, colors }) {
      const scale = Math.sqrt(innerHeight / 900);
      for (let i = 0; i < count; i++) {
        const a = ((angle + (Math.random() - 0.5) * spread) * Math.PI) / 180;
        const v = power * scale * (0.45 + Math.random() * 0.75);
        parts.push({
          x,
          y,
          vx: Math.cos(a) * v,
          vy: Math.sin(a) * v,
          w: 6 + Math.random() * 7,
          h: 8 + Math.random() * 10,
          rot: Math.random() * Math.PI * 2,
          vr: (Math.random() - 0.5) * 0.3,
          tilt: Math.random() * Math.PI * 2,
          vt: 0.06 + Math.random() * 0.12,
          color: colors[i % colors.length],
          round: Math.random() < 0.28,
          life: 0,
          ttl: 200 + Math.random() * 140,
        });
      }
      if (!raf) raf = requestAnimationFrame(tick);
    }

    function tick() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      parts = parts.filter((p) => p.life < p.ttl && p.y < innerHeight + 40);
      for (const p of parts) {
        p.life++;
        p.vx *= 0.985;
        p.vy = p.vy * 0.985 + 0.24;
        p.x += p.vx + Math.sin(p.tilt) * 0.6;
        p.y += p.vy;
        p.rot += p.vr;
        p.tilt += p.vt;
        const flip = Math.abs(Math.cos(p.tilt));
        ctx.save();
        ctx.globalAlpha = Math.min(1, (p.ttl - p.life) / 40);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        if (p.round) {
          ctx.beginPath();
          ctx.ellipse(0, 0, p.w * 0.45, p.w * 0.45 * flip + 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.fillRect(-p.w / 2, (-p.h / 2) * flip, p.w, p.h * flip + 0.5);
        }
        ctx.restore();
      }
      raf = parts.length ? requestAnimationFrame(tick) : 0;
    }

    function clear() {
      parts = [];
      ctx.clearRect(0, 0, innerWidth, innerHeight);
    }

    return { resize, burst, clear };
  })();

  const PALETTE = {
    brand: ["#FC5A2C", "#FF7A4D", "#FFB089", "#FFF1EC", "#FFFFFF", "#FBBF24"],
    gold: ["#FBBF24", "#FDE68A", "#F59E0B", "#FC5A2C", "#FFFFFF", "#FF7A4D"],
    luck: ["#4ADE80", "#22A355", "#FFFFFF", "#FFF8EE"],
  };

  function celebrate(prize) {
    const r = els.ticket.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const top = r.top + r.height * 0.22;
    const calm = reducedMotion.matches;

    if (!prize.months) {
      Sound.play("luck");
      if (!calm) Confetti.burst({ x: cx, y: top, count: 40, spread: 110, power: 9, colors: PALETTE.luck });
      return;
    }

    if (prize.grand) {
      Sound.play("grand");
      vibrate([60, 40, 60, 40, 140]);
      if (calm) return Confetti.burst({ x: cx, y: top, count: 60, spread: 90, power: 8, colors: PALETTE.gold });
      Confetti.burst({ x: cx, y: top, count: 160, spread: 160, power: 16, colors: PALETTE.gold });
      for (let i = 0; i < 4; i++) {
        setTimeout(() => {
          if (els.reveal.hidden) return;
          Confetti.burst({ x: 0, y: innerHeight * 0.92, count: 80, angle: -62, spread: 34, power: 24, colors: PALETTE.gold });
          Confetti.burst({ x: innerWidth, y: innerHeight * 0.92, count: 80, angle: -118, spread: 34, power: 24, colors: PALETTE.gold });
        }, i * 360);
      }
      return;
    }

    Sound.play("win");
    vibrate([40, 30, 80]);
    if (calm) return Confetti.burst({ x: cx, y: top, count: 50, spread: 90, power: 8, colors: PALETTE.brand });
    const big = prize.months >= 3;
    Confetti.burst({ x: cx, y: top, count: big ? 160 : 120, spread: 140, power: big ? 15 : 13, colors: PALETTE.brand });
    if (big) {
      setTimeout(() => {
        Confetti.burst({ x: 0, y: innerHeight * 0.9, count: 60, angle: -60, spread: 30, power: 20, colors: PALETTE.brand });
        Confetti.burst({ x: innerWidth, y: innerHeight * 0.9, count: 60, angle: -120, spread: 30, power: 20, colors: PALETTE.brand });
      }, 250);
    }
  }

  /* ---------- Ticket ---------- */

  let busy = false;
  let closing = false;
  let current = null;

  function fillTicket(rec) {
    const prize = PRIZE_BY_ID[rec.prize];
    const isLuck = !prize.months;
    els.ticket.classList.toggle("luck", isLuck);
    els.ticket.classList.toggle("grand", !!prize.grand);
    els.wrap.classList.toggle("grand", !!prize.grand);
    els.content.classList.toggle("luck-mode", isLuck);

    const head =
      '<div class="t-head"><span class="t-brand"><img src="assets/logo-mark.svg" alt="">AlignArt</span><span class="t-event">HITEX 2026</span></div>';

    if (isLuck) {
      els.slotTop.innerHTML = `${head}<div class="t-hero">${ICONS.clover}<h2 class="t-title" id="ticketTitle">${t("luckTitle")}</h2><p class="t-sub">${t("luckSub")}</p></div>`;
      els.slotBottom.innerHTML = `<div class="t-luck"><img class="t-qr" src="assets/alignart-app-qr.svg" alt="${t("qrAlt")}" width="120" height="120"><p>${t("luckBody")}</p></div>`;
      return;
    }

    els.slotTop.innerHTML =
      head +
      (prize.grand ? `<span class="t-ribbon">${t("grand")}</span>` : "") +
      `<div class="t-hero"><div class="t-burst" aria-hidden="true"></div><h2 class="t-title" id="ticketTitle">${t("congrats")}</h2><p class="t-sub">${t("youWon")}</p>${ICONS.arrow}</div>`;
    els.slotBottom.innerHTML =
      `<div class="t-prize"><span class="t-num">${fmt(prize.months)}</span><span class="t-unit">${t("unit", prize.months)}</span></div>` +
      `<p class="t-plan">${t("plan")}</p>` +
      `<div class="t-code"><span>${t("code")}</span><b dir="ltr">${rec.code}</b></div>` +
      `<p class="t-foot">${t("showTeam")}</p>`;
  }

  function resetTicket() {
    [els.wrap, els.ticketTop, els.shade, els.backdrop, els.slip].forEach((el) => el.getAnimations().forEach((a) => a.cancel()));
    els.ticketTop.style.transform = "";
    els.slip.style.opacity = "0";
  }

  async function riseSlip() {
    const lift = els.bag.offsetHeight * 0.38;
    els.slip.style.opacity = "1";
    Sound.play("pop");
    await els.slip.animate(
      [{ transform: "translateY(0) rotate(-6deg)" }, { transform: `translateY(${-lift}px) rotate(4deg)` }],
      { duration: 640, easing: "cubic-bezier(.18,1.25,.4,1)", fill: "forwards" },
    ).finished;
    await wait(140);
    return els.slip.getBoundingClientRect();
  }

  async function openTicket(rec, from) {
    fillTicket(rec);
    els.ticketTop.getAnimations().forEach((a) => a.cancel());
    els.ticketTop.style.transform = "";
    els.actions.classList.remove("show");
    els.staffInput.value = rec.note || "";
    els.staffSave.classList.remove("saved");
    setSaveLabel("save");
    els.reveal.hidden = false;
    Confetti.resize();

    const rect = els.wrap.getBoundingClientRect();
    const W = rect.width;
    const H = rect.height;
    const cx = rect.left + W / 2;
    const cy = rect.top + H / 2;
    const lifted = `translate(0px, ${-H / 4}px) scale(1) rotate(0deg)`;
    const settled = "translate(0px, 0px) scale(1) rotate(0deg)";

    els.backdrop.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 380, easing: "ease-out", fill: "forwards" });

    if (from) {
      const s = from.width / W;
      const tx = from.left + from.width / 2 - cx;
      const ty = from.top + from.height / 2 - cy - (s * H) / 4;
      els.slip.getAnimations().forEach((a) => a.cancel());
      els.slip.style.opacity = "0";

      await els.wrap.animate(
        [
          { transform: `translate(${tx}px, ${ty}px) scale(${s}) rotate(4deg)` },
          { transform: `translate(0px, ${-H / 4 - 26}px) scale(1.05) rotate(-3deg)`, offset: 0.72 },
          { transform: lifted },
        ],
        { duration: 820, easing: "cubic-bezier(.25,.8,.3,1)", fill: "forwards" },
      ).finished;
      await wait(220);

      Sound.play("unfold");
      const unfold = { duration: 860, easing: "cubic-bezier(.5,0,.2,1)", fill: "forwards" };
      els.ticketTop.animate(
        [{ transform: "translateZ(1px) rotateX(-180deg)" }, { transform: "translateZ(1px) rotateX(0deg)" }],
        unfold,
      );
      els.shade.animate([{ opacity: 0.55 }, { opacity: 0 }], unfold);
      await els.wrap.animate([{ transform: lifted }, { transform: settled }], unfold).finished;
    } else {
      els.ticketTop.style.transform = "translateZ(1px) rotateX(0deg)";
      await els.wrap.animate([{ opacity: 0, transform: "scale(.96)" }, { opacity: 1, transform: settled }], {
        duration: 240,
        easing: "ease-out",
        fill: "forwards",
      }).finished;
    }

    celebrate(PRIZE_BY_ID[rec.prize]);
    els.actions.classList.add("show");
    els.nextBtn.focus({ preventScroll: true });
  }

  async function draw() {
    if (busy) return;
    busy = true;
    Sound.init();
    keepAwake();
    document.body.classList.add("drawing");
    els.drawBtn.disabled = true;
    els.bag.disabled = true;
    setDrawLabel("drawing");

    current = recordDraw(pickPrize());
    if (!els.admin.hidden) renderAdmin();

    try {
      if (reducedMotion.matches) {
        await openTicket(current, null);
      } else {
        els.bag.classList.add("shaking");
        Sound.play("rustle");
        vibrate([25, 50, 25, 50, 25]);
        await wait(950);
        els.bag.classList.remove("shaking");
        const from = await riseSlip();
        await openTicket(current, from);
      }
    } catch (err) {
      console.error(err);
      els.ticketTop.style.transform = "translateZ(1px) rotateX(0deg)";
      els.reveal.hidden = false;
      els.actions.classList.add("show");
    }
  }

  async function nextCustomer() {
    if (!current || closing) return;
    closing = true;
    if (els.staffInput.value.trim() !== (current.note || "")) saveNote(current, els.staffInput.value);

    els.actions.classList.remove("show");
    const out = { duration: 220, easing: "ease-in", fill: "forwards" };
    els.backdrop.animate([{ opacity: 1 }, { opacity: 0 }], out);
    await els.wrap.animate(
      [{ opacity: 1, transform: "translate(0px, 0px) scale(1)" }, { opacity: 0, transform: "translate(0px, 24px) scale(.96)" }],
      out,
    ).finished;

    Confetti.clear();
    els.reveal.hidden = true;
    resetTicket();
    current = null;
    busy = false;
    closing = false;
    document.body.classList.remove("drawing");
    els.drawBtn.disabled = false;
    els.bag.disabled = false;
    setDrawLabel("draw");
    if (!els.admin.hidden) renderAdmin();
    els.drawBtn.focus({ preventScroll: true });
  }

  function setSaveLabel(key) {
    els.staffSave.dataset.i18n = key;
    els.staffSave.innerHTML = t(key);
  }

  /* ---------- Device helpers ---------- */

  let wakeLock = null;
  let wantAwake = false;
  async function keepAwake() {
    wantAwake = true;
    if (!("wakeLock" in navigator) || wakeLock || document.visibilityState !== "visible") return;
    try {
      wakeLock = await navigator.wakeLock.request("screen");
      wakeLock.addEventListener("release", () => {
        wakeLock = null;
      });
    } catch {
      wakeLock = null;
    }
  }

  const canFullscreen = document.fullscreenEnabled || document.webkitFullscreenEnabled;
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement || document.webkitFullscreenElement) {
        await (document.exitFullscreen ? document.exitFullscreen() : document.webkitExitFullscreen());
      } else {
        const el = document.documentElement;
        await (el.requestFullscreen ? el.requestFullscreen() : el.webkitRequestFullscreen());
      }
    } catch {
      /* user agent refused; nothing to do */
    }
    keepAwake();
  }

  function applySound() {
    els.soundBtn.setAttribute("aria-pressed", String(state.sound));
    els.soundBtn.setAttribute("aria-label", state.sound ? "Sound on" : "Sound off");
  }

  /* ---------- Staff panel ---------- */

  const pct = (v, total) => (total > 0 ? `${((v / total) * 100).toFixed(1).replace(/\.0$/, "")}%` : "0%");
  const fmtTime = (iso) =>
    new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

  function buildOddsGrid() {
    els.oddsGrid.innerHTML = PRIZES.map(
      (p) =>
        `<label for="odds-${p.id}">${p.label}</label>` +
        `<input id="odds-${p.id}" data-id="${p.id}" type="number" min="0" step="0.5" inputmode="decimal">` +
        `<output id="out-${p.id}" for="odds-${p.id}"></output>`,
    ).join("");
  }

  function renderOdds() {
    const total = oddsTotal();
    for (const p of PRIZES) {
      const input = $(`#odds-${p.id}`);
      if (document.activeElement !== input) input.value = String(state.odds[p.id]);
      $(`#out-${p.id}`).textContent = pct(state.odds[p.id], total);
    }
    els.oddsSum.textContent =
      total > 0 ? `Total weight: ${Number(total.toFixed(2))}` : "All odds are zero, so every paper will be Good luck.";
    els.oddsSum.classList.toggle("warn", total <= 0);
  }

  function renderAdmin() {
    const counts = Object.fromEntries(PRIZES.map((p) => [p.id, 0]));
    state.history.forEach((h) => {
      if (h.prize in counts) counts[h.prize]++;
    });
    const total = state.history.length;
    const totalOdds = oddsTotal();
    els.adminTotal.textContent = total
      ? `${total} papers drawn, ${total - counts.luck} prizes given.`
      : "No papers drawn on this device yet.";
    els.adminStats.innerHTML = PRIZES.map(
      (p) =>
        `<tr><td>${p.label}</td><td>${pct(state.odds[p.id], totalOdds)}</td><td>${counts[p.id]}</td><td>${total ? pct(counts[p.id], total) : "—"}</td></tr>`,
    ).join("");
    renderOdds();
    renderHistory();
  }

  function renderHistory() {
    const q = els.historySearch.value.trim().toLowerCase();
    const rows = state.history.filter((h) => {
      if (!q) return true;
      const p = PRIZE_BY_ID[h.prize];
      return [h.code, h.note, p && p.label].some((v) => v && v.toLowerCase().includes(q));
    });
    if (!rows.length) {
      els.history.innerHTML = `<li><span class="empty">${q ? "No draw with this code or note on this device." : "Nothing yet."}</span></li>`;
      return;
    }
    els.history.innerHTML = rows
      .slice(0, 200)
      .map((h) => {
        const p = PRIZE_BY_ID[h.prize] || { label: h.prize };
        return (
          `<li class="${p.grand ? "grand-row" : ""}"><time datetime="${h.at}">${fmtTime(h.at)}</time><b>${p.label}</b>` +
          `<code>${h.code || "—"}</code>${h.note ? `<span class="note">${escapeHtml(h.note)}</span>` : ""}</li>`
        );
      })
      .join("");
  }

  function openAdmin() {
    renderAdmin();
    els.admin.hidden = false;
    els.adminClose.focus();
  }

  function closeAdmin() {
    els.admin.hidden = true;
    if (location.hash === "#staff") history.replaceState(null, "", location.pathname + location.search);
  }

  function exportCsv() {
    const rows = [["time", "paper", "months", "code", "note"]];
    state.history
      .slice()
      .reverse()
      .forEach((h) => {
        const p = PRIZE_BY_ID[h.prize] || { label: h.prize, months: "" };
        rows.push([h.at, p.label, p.months, h.code, h.note]);
      });
    const csv = rows.map((r) => r.map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")).join("\r\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `hitex-draws-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  /* ---------- Events ---------- */

  els.bag.addEventListener("click", draw);
  els.drawBtn.addEventListener("click", draw);
  els.nextBtn.addEventListener("click", nextCustomer);
  els.bag.addEventListener("contextmenu", (e) => e.preventDefault());

  $$(".lang button").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

  els.soundBtn.addEventListener("click", () => {
    state.sound = !state.sound;
    store.set(KEYS.sound, state.sound);
    applySound();
    if (state.sound) Sound.play("pop");
  });

  if (canFullscreen) els.fullscreenBtn.addEventListener("click", toggleFullscreen);
  else els.fullscreenBtn.hidden = true;

  els.staffForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!current) return;
    saveNote(current, els.staffInput.value);
    els.staffSave.classList.add("saved");
    setSaveLabel("saved");
    if (!els.admin.hidden) renderAdmin();
  });
  els.staffInput.addEventListener("input", () => {
    els.staffSave.classList.remove("saved");
    setSaveLabel("save");
  });

  let brandTaps = [];
  els.brand.addEventListener("click", () => {
    const now = Date.now();
    brandTaps = brandTaps.filter((ts) => now - ts < 2500).concat(now);
    if (brandTaps.length >= 5) {
      brandTaps = [];
      openAdmin();
    }
  });

  els.adminClose.addEventListener("click", closeAdmin);
  els.admin.addEventListener("click", (e) => {
    if (e.target === els.admin) closeAdmin();
  });

  els.oddsGrid.addEventListener("input", (e) => {
    const id = e.target.dataset.id;
    if (!id) return;
    const v = parseFloat(e.target.value);
    state.odds[id] = Number.isFinite(v) && v >= 0 ? v : 0;
    store.set(KEYS.odds, state.odds);
    renderAdmin();
    renderStrip();
  });

  els.oddsReset.addEventListener("click", () => {
    state.odds = { ...DEFAULT_ODDS };
    store.set(KEYS.odds, state.odds);
    renderAdmin();
    renderStrip();
  });

  els.historySearch.addEventListener("input", renderHistory);
  els.exportCsv.addEventListener("click", exportCsv);
  els.clearHistory.addEventListener("click", () => {
    const n = state.history.length;
    if (!n) return;
    if (!confirm(`Delete all ${n} draws saved on this device? Export a CSV first if you need them.`)) return;
    state.history = [];
    store.set(KEYS.history, state.history);
    renderAdmin();
  });

  document.addEventListener("keydown", (e) => {
    const typing = e.target instanceof HTMLInputElement;
    if (e.key === "Escape") {
      if (!els.admin.hidden) return closeAdmin();
      if (!els.reveal.hidden && els.actions.classList.contains("show")) return nextCustomer();
    }
    if (typing) return;
    if (e.shiftKey && e.key.toLowerCase() === "s") {
      e.preventDefault();
      return els.admin.hidden ? openAdmin() : closeAdmin();
    }
    if ((e.key === " " || e.key === "Enter") && e.target === document.body && !busy && els.admin.hidden) {
      e.preventDefault();
      draw();
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible" && wantAwake) keepAwake();
  });
  window.addEventListener("resize", () => {
    if (!els.reveal.hidden) Confetti.resize();
  });

  /* ---------- Boot ---------- */

  buildOddsGrid();
  applyLang();
  applySound();
  if (location.hash === "#staff") openAdmin();

  if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
  }
})();
