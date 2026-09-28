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

