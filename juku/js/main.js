// ── Calculator ──────────────────────────────────────────────
function calc() {
  // Guard: only the rewritten juku.loans calculator has a #saving-rate slider.
  if (!document.getElementById('saving-rate')) return;

  const notional = parseFloat(document.getElementById('notional').value) * 1000;
  const term = parseFloat(document.getElementById('term').value);
  const loanRate = parseFloat(document.getElementById('loan-rate').value);
  const rate = parseFloat(document.getElementById('saving-rate').value);

  const fmtNotional = n => {
    if (n >= 1000000) return '£' + (n / 1000000 % 1 === 0 ? (n / 1000000).toFixed(0) : (n / 1000000).toFixed(1)) + 'm';
    return '£' + (n / 1000).toFixed(0) + 'k';
  };
  document.getElementById('notional-out').textContent = fmtNotional(notional);
  document.getElementById('term-out').textContent = term + (term === 1 ? ' yr' : ' yrs');
  document.getElementById('loan-rate-out').textContent = loanRate.toFixed(1) + '%';
  document.getElementById('saving-rate-out').textContent = rate.toFixed(2) + '%';

  const newRate = Math.max(0, loanRate - rate);

  // Amortising monthly payment: P · i(1+i)^n / ((1+i)^n − 1)
  const monthly = (P, annualPct) => {
    const i = annualPct / 100 / 12;
    const n = term * 12;
    if (i === 0) return P / n;
    const g = Math.pow(1 + i, n);
    return P * i * g / (g - 1);
  };

  // Total interest saved over the life of the loan = (old payment − new payment) × months.
  const totalSaved = Math.round((monthly(notional, loanRate) - monthly(notional, newRate)) * term * 12);
  const brokerCut = Math.round(totalSaved * 0.15);    // broker commission 15%
  const fmt = n => '£' + n.toLocaleString('en-GB');

  document.getElementById('total-saved').textContent = fmt(totalSaved);
  document.getElementById('total-saved-sub').textContent = 'over the ' + term + '-year loan';
  document.getElementById('net-val').textContent = fmt(brokerCut);
}

// Initialise the calculator with correct figures on page load.
calc();

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
}

// ── Form submit ───────────────────────────────────────────────
async function submitForm() {
  const fname = document.getElementById('fname').value.trim();
  const lname = document.getElementById('lname').value.trim();
  const company = document.getElementById('company').value.trim();
  const email = document.getElementById('email').value.trim();
  const role = document.getElementById('role') ? document.getElementById('role').value : '';
  const loanType = document.getElementById('loan-type').value;
  const loanSize = document.getElementById('loan-size').value;
  const loanTerm = document.getElementById('loan-term').value;
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
    body: JSON.stringify({ fname, lname, company, email, role, loanType, loanSize, loanTerm, message })
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

