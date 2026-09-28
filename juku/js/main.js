// ── FAQ accordion ────────────────────────────────────────────
function toggleFaq(btn) {
  const item = btn.closest('.faq-item');
  const isOpen = item.classList.contains('open');
  document.querySelectorAll('.faq-item.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}

// ── Page navigation ──────────────────────────────────────────
function show(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('button.nav-btn')[page === 'home' ? 0 : 1].classList.add('active');
  window.scrollTo(0, 0);
  // Remember the current page in the URL hash so a refresh restores it.
  if (location.hash !== '#' + page) history.replaceState(null, '', '#' + page);
}

// Restore the page from the URL hash on load (defaults to home).
show(location.hash === '#form' ? 'form' : 'home');

// ── Form submit ───────────────────────────────────────────────
async function submitForm() {
  const fname = document.getElementById('fname').value.trim();
  const lname = document.getElementById('lname').value.trim();
  const company = document.getElementById('company').value.trim();
  const email = document.getElementById('email').value.trim();
  const clientVolume = document.getElementById('client-volume').value;
  const fcaStatus = document.getElementById('fca-status').value;
  const loanFocus = document.getElementById('loan-focus').value;
  const message = document.querySelector('textarea').value.trim();

  if (!fname || !email) {
    alert('Please fill in your name and email address.');
    return;
  }

  const btn = document.querySelector('.submit-btn');
  btn.textContent = 'Sending…';
  btn.disabled = true;

  const res = await fetch('https://formspree.io/f/xgoqjjgv', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ fname, lname, company, email, clientVolume, fcaStatus, loanFocus, message })
  });

  if (res.ok) {
    document.getElementById('form-inner').style.display = 'none';
    document.getElementById('success-msg').style.display = 'block';
  } else {
    btn.textContent = 'Submit →';
    btn.disabled = false;
    alert('Something went wrong. Please try again.');
  }
}

// ── Get in touch form ────────────────────────────────────────
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    const status = contactForm.querySelector('.form-status');
    const btn = contactForm.querySelector('.submit-btn');
    const data = Object.fromEntries(new FormData(contactForm));
    const fail = msg => { status.textContent = msg; status.classList.add('is-error'); };
    if (!data.fname.trim() || !/^\S+@\S+\.\S+$/.test(data.email.trim())) {
      fail('Please add your first name and a valid work email.');
      return;
    }
    status.textContent = '';
    status.classList.remove('is-error');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    const res = await fetch('https://formspree.io/f/xgoqjjgv', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data),
    }).catch(() => null);
    if (res && res.ok) {
      contactForm.hidden = true;
      document.getElementById('contact-success').hidden = false;
    } else {
      btn.disabled = false;
      btn.textContent = 'Request an intro call →';
      fail('Something went wrong sending that. Please try again.');
    }
  });
}

// ── Scroll walkthrough ───────────────────────────────────────
// The purple line fills down to a reading line 55% of the way down the
// screen; the last step whose number has crossed it is the current one.
const walk = document.getElementById('walk');
if (walk) {
  const steps = [...walk.querySelectorAll('.walk-step')];
  const rail = walk.querySelector('.walk-rail');
  const fill = walk.querySelector('.walk-fill');
  walk.classList.add('is-live');

  function updateWalk() {
    const top = walk.getBoundingClientRect().top;
    const centres = steps.map(s => {
      const r = s.querySelector('.walk-num').getBoundingClientRect();
      return r.top + r.height / 2 - top;
    });
    const first = centres[0], last = centres[centres.length - 1];
    const line = innerHeight * 0.55 - top;
    rail.style.top = first + 'px';
    rail.style.height = (last - first) + 'px';
    fill.style.height = Math.min(Math.max(line - first, 0), last - first) + 'px';
    const current = centres.filter(c => c <= line).length - 1;
    steps.forEach((s, i) => {
      s.classList.toggle('is-done', i < current);
      s.classList.toggle('is-current', i === current);
    });
  }

  let queued = false;
  const queueWalk = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; updateWalk(); });
  };
  addEventListener('scroll', queueWalk, { passive: true });
  addEventListener('resize', queueWalk);
  new ResizeObserver(queueWalk).observe(walk);   // also catches the home page being shown again
  updateWalk();
}

// ── Done by the book ─────────────────────────────────────────
// The section pins below the menu, and scrolling through it moves through the
// documents: the page's scroll is split into equal slices, one per document.
// Clicking a term scrolls to its slice.
const legit = document.getElementById('legit');
if (legit) {
  const pin = legit.querySelector('.legit-pin');
  const docs = [...legit.querySelectorAll('.doc')];
  const terms = [...legit.querySelectorAll('.term')];
  const navH = () => document.querySelector('nav').offsetHeight;
  let current = -1;
  legit.classList.add('is-live');

  const setDoc = i => {
    docs.forEach((d, k) => { d.dataset.pos = k < i ? 'past' : k - i; });
    terms.forEach((t, k) => {
      t.classList.toggle('is-on', k === i);
      t.setAttribute('aria-pressed', k === i);
    });
    current = i;
  };
  const travel = () => legit.offsetHeight - pin.offsetHeight;   // scroll distance while pinned
  const update = () => {
    document.documentElement.style.setProperty('--nav-h', navH() + 'px');
    const progress = (navH() - legit.getBoundingClientRect().top) / travel();
    const i = Math.min(docs.length - 1, Math.max(0, Math.floor(progress * docs.length)));
    if (i !== current) setDoc(i);
  };

  terms.forEach((t, k) => t.addEventListener('click', () => {
    const top = legit.getBoundingClientRect().top + scrollY - navH() + (k + 0.5) / docs.length * travel();
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    scrollTo({ top, behavior: calm ? 'auto' : 'smooth' });
  }));

  let queued = false;
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  new ResizeObserver(queue).observe(legit);
  update();
}

// ── Works with your tools ────────────────────────────────────
// Six tools circle juku on a slow oval orbit, drawn each frame while the section is
// on screen: tools at the front are larger and pass over juku, those at the back are
// smaller and behind. Every couple of seconds the next tool connects: its line lights,
// an orange deal dot runs in (juku pulses as it lands), a green savings dot runs back
// out, and the tool keeps a tick and a green line. After all six, it resets.
const intg = document.getElementById('intg');
if (intg) {
  const NS = 'http://www.w3.org/2000/svg';
  const stage = intg.querySelector('.intg-stage');
  const svg = intg.querySelector('.intg-lines');
  const nodes = [...intg.querySelectorAll('.intg-node')];
  const hub = intg.querySelector('.intg-hub');
  const count = intg.querySelector('.intg-count');
  const lines = nodes.map(() => svg.appendChild(document.createElementNS(NS, 'line')));
  const dot = cls => {
    const c = svg.appendChild(document.createElementNS(NS, 'circle'));
    c.setAttribute('r', 4.5);
    c.setAttribute('class', cls);
    c.style.display = 'none';
    return c;
  };
  const deal = dot('deal'), saving = dot('saving');
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TURN = 2 * Math.PI / 60;   // one lap a minute
  let w = 0, h = 0, spin = 0, last = 0, raf = 0, inView = false;
  let active = -1, activeAt = 0, next = 0;

  const measure = () => {
    const r = stage.getBoundingClientRect();
    w = r.width; h = r.height;
    svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  };
  const along = (c, x1, y1, x2, y2, t) => {   // put a dot t of the way from (x1,y1) to (x2,y2)
    const show = t >= 0 && t <= 1;
    c.style.display = show ? '' : 'none';
    if (show) { c.setAttribute('cx', x1 + (x2 - x1) * t); c.setAttribute('cy', y1 + (y2 - y1) * t); }
  };
  const draw = now => {
    const cx = w / 2, cy = h / 2, rx = w * 0.37, ry = h * 0.36, hubR = hub.offsetWidth / 2;
    const ends = nodes.map((n, i) => {
      const a = spin + i * Math.PI / 3 - Math.PI / 2;
      const x = cx + rx * Math.cos(a), y = cy + ry * Math.sin(a);
      const depth = (Math.sin(a) + 1) / 2;   // 0 at the back (top), 1 at the front (bottom)
      n.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${0.84 + depth * 0.16})`;
      n.style.zIndex = 1 + Math.round(depth * 10);
      n.style.opacity = 0.7 + depth * 0.3;
      const d = Math.hypot(x - cx, y - cy), ux = (x - cx) / d, uy = (y - cy) / d;
      const s = hubR + 6, e = Math.max(s, d - 24);
      const end = { sx: cx + ux * s, sy: cy + uy * s, ex: cx + ux * e, ey: cy + uy * e };
      lines[i].setAttribute('x1', end.sx); lines[i].setAttribute('y1', end.sy);
      lines[i].setAttribute('x2', end.ex); lines[i].setAttribute('y2', end.ey);
      return end;
    });
    const p = active < 0 || calm ? -1 : (now - activeAt) / 1600, L = ends[active];
    if (L) {
      along(deal, L.ex, L.ey, L.sx, L.sy, p < 0 ? -1 : p / 0.45);
      along(saving, L.sx, L.sy, L.ex, L.ey, p < 0.5 ? -1 : (p - 0.5) / 0.42);
    } else {
      along(deal, 0, 0, 0, 0, -1); along(saving, 0, 0, 0, 0, -1);
    }
  };
  const frame = t => {
    if (last) spin += (t - last) / 1000 * TURN;
    last = t;
    draw(t);
    raf = inView && !calm ? requestAnimationFrame(frame) : 0;
    if (!raf) last = 0;
  };

  const setCount = n => { count.textContent = n + ' of ' + nodes.length + ' connected'; };
  const connect = i => {
    active = i; activeAt = performance.now();
    nodes.forEach((n, k) => n.classList.toggle('is-on', k === i));
    lines.forEach((l, k) => l.classList.toggle('is-on', k === i));
    setTimeout(() => {   // the deal dot reaches juku
      hub.classList.remove('is-hit');
      void hub.offsetWidth;
      hub.classList.add('is-hit');
    }, 720);
    setTimeout(() => {   // the savings dot is back: this tool is connected
      nodes[i].classList.add('is-done');
      lines[i].classList.add('is-done');
      setCount(i + 1);
    }, 1500);
  };
  const tick = () => {
    if (!inView) return;
    if (next < nodes.length) return connect(next++);
    next = 0; active = -1;   // all connected: clear and start again
    nodes.forEach(n => n.classList.remove('is-on', 'is-done'));
    lines.forEach(l => l.classList.remove('is-on', 'is-done'));
    setCount(0);
  };

  measure();
  new ResizeObserver(() => { measure(); draw(performance.now()); }).observe(stage);
  if (calm) {
    nodes.forEach(n => n.classList.add('is-done'));
    lines.forEach(l => l.classList.add('is-done'));
    setCount(nodes.length);
  } else {
    setInterval(tick, 2100);
  }
  new IntersectionObserver(([e]) => {
    inView = e.isIntersecting;
    if (inView && !raf && !calm) raf = requestAnimationFrame(frame);
  }, { threshold: 0.3 }).observe(intg);
  draw(performance.now());
}

// ── Swap diagram ─────────────────────────────────────────────
// Four states across three listed steps: step 2 has a SOFR rises / falls switch.
// Per state: which step it belongs to (li); which lines are lit (they build up step
// by step, and step 3 adds whichever SOFR line was last picked); which lines carry
// moving dots (on); which
// boxes are dimmed or highlighted; and the two lines of status text under your
// client and under the other business.
const SWAP_STATES = [
  { li: 0, lit: ['loanA', 'loanB'], on: ['loanA', 'loanB'], dim: ['juku', 'broker'],
    status: ['borrows floating', 'borrows fixed'], sub: ['', ''] },
  { li: 1, move: 'up', lit: ['loanA', 'loanB', 'payBA'], on: ['payBA'], dim: ['broker'],
    status: ['loan costs more', 'pays the difference'], sub: ['gets the difference', ''] },
  { li: 1, move: 'down', lit: ['loanA', 'loanB', 'payAB'], on: ['payAB'], dim: ['broker'],
    status: ['loan costs less', 'gets the difference'], sub: ['pays the difference', ''] },
  { li: 2, lit: ['loanA', 'loanB', 'commission'], on: ['commission'], hi: ['broker'],
    status: ['pays 7.00% fixed', 'pays SOFR + 1.40%'], sub: ['instead of 7.20%', 'instead of SOFR + 1.60%'], good: true },
];

// Height given to each kind of text line; a box's lines are stacked and centred in it.
const SW_LINE = { 'sw-cap': 18, 'sw-name': 22, 'sw-status': 18, 'sw-sub': 16, 'sw-rate': 18 };

const swap = document.getElementById('swap');
if (swap) {
  const stages = swap.querySelectorAll('.swap-stage');
  const svg = swap.querySelector('svg');

  function centreText() {
    svg.querySelectorAll('.sw-node').forEach(n => {
      const r = n.querySelector('rect');
      const lines = [...n.querySelectorAll('text')].filter(t => t.textContent.trim());
      const heights = lines.map(t => SW_LINE[[...t.classList].find(c => c in SW_LINE)] || 18);
      let y = +r.getAttribute('y') + (+r.getAttribute('height') - heights.reduce((x, h) => x + h, 0)) / 2;
      lines.forEach((t, k) => { t.setAttribute('y', y + heights[k] / 2); y += heights[k]; });
    });
  }

  let sofr = 'up';   // the SOFR option last picked; step 3 keeps its line lit

  function setStage(i) {
    const s = SWAP_STATES[i];
    if (s.move) sofr = s.move;
    const lit = [...s.lit, ...(s.li === 2 ? [sofr === 'up' ? 'payBA' : 'payAB'] : [])];
    const has = (list, key) => (list || []).includes(key);
    stages.forEach((li, k) => {
      li.classList.toggle('is-active', k === s.li);
      li.querySelector('.ss-btn').setAttribute('aria-pressed', k === s.li);
    });
    swap.querySelectorAll('.sofr-btn').forEach(b => b.setAttribute('aria-pressed', b.dataset.move === sofr));
    swap.querySelectorAll('.sofr-text').forEach(t => { t.hidden = t.dataset.move !== sofr; });
    svg.querySelectorAll('.flow').forEach(f => {
      f.classList.toggle('on', has(s.on, f.dataset.flow));
      f.classList.toggle('lit', has(lit, f.dataset.flow));
    });
    svg.querySelectorAll('.sw-node').forEach(n => {
      n.classList.toggle('dim', has(s.dim, n.dataset.node));
      n.classList.toggle('hi', has(s.hi, n.dataset.node));
    });
    svg.querySelectorAll('.sw-status').forEach((t, k) => {
      t.textContent = s.status[k];
      t.classList.toggle('good', !!s.good);
    });
    svg.querySelectorAll('.sw-more').forEach((t, k) => { t.textContent = s.sub[k]; });
    centreText();
  }
  centreText();

  // Step 2 reopens on whichever SOFR option was last picked.
  const firstState = k => [0, sofr === 'up' ? 1 : 2, 3][k];
  stages.forEach((li, k) => li.querySelector('.ss-btn').addEventListener('click', () => setStage(firstState(k))));
  swap.querySelectorAll('.sofr-btn').forEach(b => b.addEventListener('click', () => setStage(b.dataset.move === 'up' ? 1 : 2)));

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Coins that travel along each payment line at an even speed.
    svg.querySelectorAll('.flow path').forEach(path => {
      const len = path.getTotalLength();
      // Each dot stops with its front edge on the back of the arrowhead: the head reaches
      // 4.8 units back from the line's end and the dot's radius is 3.5.
      const stop = Math.max(0, (len - 8.3) / len);
      const dur = Math.max(1.2, len * stop / 60);
      const n = Math.max(2, Math.round(len / 70));
      const coins = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      coins.setAttribute('class', 'coins');
      for (let k = 0; k < n; k++) {
        const begin = -(k * dur / n);
        coins.innerHTML +=
          `<circle r="3.5"><animateMotion path="${path.getAttribute('d')}" keyPoints="0;${stop.toFixed(4)}" keyTimes="0;1" calcMode="linear" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>` +
          `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></circle>`;
      }
      path.after(coins);
    });
  }
}

