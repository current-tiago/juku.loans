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

// ── Swap example options (draft) ─────────────────────────────
// Option A: flip between borrowing directly and swapping.
const exa = document.getElementById('exa');
if (exa) {
  let touched = false;
  const setMode = mode => {
    exa.dataset.mode = mode;
    exa.querySelectorAll('.seg-btn').forEach(b => b.setAttribute('aria-pressed', b.dataset.mode === mode));
  };
  exa.querySelectorAll('.seg-btn').forEach(b => b.addEventListener('click', () => {
    touched = true;
    setMode(b.dataset.mode);
  }));
  // The first time it scrolls into view, flip to the swap once to show what changes.
  const seen = new IntersectionObserver(([e]) => {
    if (!e.isIntersecting) return;
    seen.disconnect();
    setTimeout(() => { if (!touched) setMode('swap'); }, 1400);
  }, { threshold: 0.6 });
  seen.observe(exa);
}

// Option B: your client's saving for a chosen loan size and term.
const exb = document.getElementById('exb');
if (exb) {
  const SAVING = 0.002;   // the example's 0.20% a year
  const usd = n => '$' + Math.round(n).toLocaleString('en-US');
  const slider = exb.querySelector('input[type=range]');
  let term = 5;
  const render = () => {
    const size = +slider.value;
    exb.querySelectorAll('[data-out="size"]').forEach(el => { el.textContent = usd(size); });
    exb.querySelector('[data-out="year"]').textContent = usd(size * SAVING);
    exb.querySelector('[data-out="total"]').textContent = usd(size * SAVING * term);
    exb.querySelector('[data-out="term"]').textContent = term + ' years';
    exb.querySelectorAll('.seg-btn').forEach(b => b.setAttribute('aria-pressed', +b.dataset.term === term));
  };
  slider.addEventListener('input', render);
  exb.querySelectorAll('.seg-btn').forEach(b => b.addEventListener('click', () => {
    term = +b.dataset.term;
    render();
  }));
  render();
}

// Option C: three steps that play on their own until one is clicked.
const exc = document.getElementById('exc');
if (exc) {
  const tabs = exc.querySelectorAll('.exc-tab');
  const go = i => {
    exc.dataset.step = i;
    tabs.forEach((t, k) => t.setAttribute('aria-pressed', k === i));
  };
  let inView = false;
  const timer = setInterval(() => { if (inView) go((+exc.dataset.step + 1) % tabs.length); }, 4500);
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) clearInterval(timer);
  tabs.forEach((t, k) => t.addEventListener('click', () => {
    clearInterval(timer);
    go(k);
  }));
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; }, { threshold: 0.5 }).observe(exc);
}

// ── Swap diagram ─────────────────────────────────────────────
// Per stage: which payment lines are live (on), faded context (ctx) or
// offsetting each other (cancel); which boxes are dimmed or highlighted;
// and the status line under Business A and Business B.
const SWAP_STAGES = [
  { on: ['loanA', 'loanB'], dim: ['bank', 'broker'],
    status: ['borrows floating', 'borrows fixed'] },
  { on: ['swapAfix', 'swapAflt', 'swapBflt', 'swapBfix'], ctx: ['loanA', 'loanB'], dim: ['broker'],
    status: ['swaps into fixed', 'swaps into floating'] },
  { on: ['swapAfix', 'swapBflt'], cancel: ['loanA', 'swapAflt', 'loanB', 'swapBfix'], dim: ['broker'],
    status: ['now on fixed', 'now on floating'] },
  { on: ['commission'], ctx: ['loanA', 'loanB', 'swapAfix', 'swapAflt', 'swapBflt', 'swapBfix'], hi: ['broker'],
    status: ['pays less interest', 'pays less interest'], good: true },
];

const swap = document.getElementById('swap');
if (swap) {
  const stages = swap.querySelectorAll('.swap-stage');
  const svg = swap.querySelector('svg');
  let current = 0;

  function setStage(i) {
    const s = SWAP_STAGES[i];
    const has = (list, key) => (list || []).includes(key);
    stages.forEach((li, k) => {
      li.classList.toggle('is-active', k === i);
      li.querySelector('.ss-btn').setAttribute('aria-pressed', k === i);
    });
    svg.querySelectorAll('.flow').forEach(f => {
      f.classList.toggle('on', has(s.on, f.dataset.flow));
      f.classList.toggle('ctx', has(s.ctx, f.dataset.flow));
      f.classList.toggle('cancel', has(s.cancel, f.dataset.flow));
    });
    svg.querySelectorAll('.sw-node').forEach(n => {
      n.classList.toggle('dim', has(s.dim, n.dataset.node));
      n.classList.toggle('hi', has(s.hi, n.dataset.node));
    });
    svg.querySelectorAll('.sw-status').forEach((t, k) => {
      t.textContent = s.status[k];
      t.classList.toggle('good', !!s.good);
    });
    current = i;
  }

  // Clicking a stage takes over from the autoplay for good.
  stages.forEach((li, k) => li.querySelector('.ss-btn').addEventListener('click', () => {
    swap.classList.remove('autoplay');
    setStage(k);
  }));

  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Coins that travel along each payment line at an even speed.
    svg.querySelectorAll('.flow path').forEach(path => {
      const len = path.getTotalLength();
      const dur = len / 60;
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

    // Autoplay: the active stage's progress bar fills (CSS), then we move on.
    // CSS pauses it on hover and while the diagram is off screen.
    swap.classList.add('autoplay');
    swap.addEventListener('animationend', e => {
      if (e.target.classList.contains('ss-bar') && swap.classList.contains('autoplay')) {
        setStage((current + 1) % SWAP_STAGES.length);
      }
    });
    new IntersectionObserver(([entry]) => swap.classList.toggle('in-view', entry.isIntersecting), { threshold: 0.4 })
      .observe(swap);
  }
}

