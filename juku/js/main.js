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
// A stack of five documents, one per point in the list. Every few seconds (while
// the section is on screen and not hovered) the top one flips away to reveal the
// next. Clicking a point shows its document; clicking the stack flips to the next.
// Either click stops the automatic flipping.
const legit = document.getElementById('legit');
if (legit) {
  const docs = [...legit.querySelectorAll('.doc')];
  const items = [...legit.querySelectorAll('.legit-list li')];
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let order = docs.map((_, i) => i);   // order[0] is the document on top
  let auto = !calm, inView = false, hovered = false;

  const layout = () => {
    order.forEach((d, pos) => {
      docs[d].dataset.pos = pos;
      docs[d].classList.toggle('is-top', pos === 0);
    });
    items.forEach((li, i) => li.classList.toggle('is-on', i === order[0]));
  };
  const show = i => {
    if (order[0] === i) return;
    const old = docs[order[0]];
    old.classList.add('leaving');
    const done = e => {   // ignore animations finishing inside the document
      if (e.target !== old) return;
      old.classList.remove('leaving');
      old.removeEventListener('animationend', done);
    };
    old.addEventListener('animationend', done);
    order = [i, ...order.filter(d => d !== i && d !== order[0]), order[0]];
    layout();
  };
  const takeOver = () => { auto = false; };

  items.forEach((li, i) => li.addEventListener('click', () => { takeOver(); show(i); }));
  legit.querySelector('.docs').addEventListener('click', () => { takeOver(); show(order[1]); });
  legit.addEventListener('mouseenter', () => { hovered = true; });
  legit.addEventListener('mouseleave', () => { hovered = false; });
  layout();

  if (!calm) {
    legit.classList.add('is-live');
    new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      if (inView) legit.classList.add('play');   // the first document plays when first seen
    }, { threshold: 0.4 }).observe(legit);
    setInterval(() => { if (auto && inView && !hovered) show(order[1]); }, 4500);
  }
}

// ── Swap diagram ─────────────────────────────────────────────
// Four states across three listed steps: step 2 has a SOFR rises / falls switch.
// Per state: which step it belongs to (li), which payment lines are live (on)
// or faded context (ctx), which boxes are dimmed or highlighted, and the two
// lines of status text under your client and under the other business.
const SWAP_STATES = [
  { li: 0, on: ['loanA', 'loanB'], dim: ['juku', 'broker'],
    status: ['borrows floating', 'borrows fixed'], sub: ['', ''] },
  { li: 1, move: 'up', on: ['payBA'], ctx: ['loanA', 'loanB'], dim: ['broker'],
    status: ['loan costs more', 'pays the difference'], sub: ['gets the difference', ''] },
  { li: 1, move: 'down', on: ['payAB'], ctx: ['loanA', 'loanB'], dim: ['broker'],
    status: ['loan costs less', 'gets the difference'], sub: ['pays the difference', ''] },
  { li: 2, on: ['commission'], ctx: ['loanA', 'loanB'], hi: ['broker'],
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

  function setStage(i) {
    const s = SWAP_STATES[i];
    const has = (list, key) => (list || []).includes(key);
    stages.forEach((li, k) => {
      li.classList.toggle('is-active', k === s.li);
      li.querySelector('.ss-btn').setAttribute('aria-pressed', k === s.li);
    });
    const move = s.move || 'up';
    swap.querySelectorAll('.sofr-btn').forEach(b => b.setAttribute('aria-pressed', b.dataset.move === move));
    swap.querySelectorAll('.sofr-text').forEach(t => { t.hidden = t.dataset.move !== move; });
    svg.querySelectorAll('.flow').forEach(f => {
      f.classList.toggle('on', has(s.on, f.dataset.flow));
      f.classList.toggle('ctx', has(s.ctx, f.dataset.flow));
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

  const FIRST_STATE = [0, 1, 3];   // the state each listed step opens on
  stages.forEach((li, k) => li.querySelector('.ss-btn').addEventListener('click', () => setStage(FIRST_STATE[k])));
  swap.querySelectorAll('.sofr-btn').forEach(b => b.addEventListener('click', () => setStage(b.dataset.move === 'up' ? 1 : 2)));

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Coins that travel along each payment line at an even speed.
    svg.querySelectorAll('.flow path').forEach(path => {
      const len = path.getTotalLength();
      const dur = Math.max(1.2, len / 60);
      const n = Math.max(2, Math.round(len / 70));
      const coins = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      coins.setAttribute('class', 'coins');
      for (let k = 0; k < n; k++) {
        const begin = -(k * dur / n);
        coins.innerHTML +=
          `<circle r="3.5"><animateMotion path="${path.getAttribute('d')}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>` +
          `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.15;0.85;1" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/></circle>`;
      }
      path.after(coins);
    });
  }
}

