// ── Calculator ──────────────────────────────────────────────
function calc() {
  const fixed = parseFloat(document.getElementById('fixed-rate').value);
  const sonia = parseFloat(document.getElementById('sonia').value);
  const notional = parseFloat(document.getElementById('notional').value) * 1000;

  document.getElementById('fixed-out').textContent = fixed.toFixed(1) + '%';
  document.getElementById('sonia-out').textContent = sonia.toFixed(1) + '%';
  const fmtNotional = n => {
    if (n >= 1000000) return '£' + (n / 1000000 % 1 === 0 ? (n / 1000000).toFixed(0) : (n / 1000000).toFixed(1)) + 'm';
    return '£' + (n / 1000).toFixed(0) + 'k';
  };
  document.getElementById('notional-out').textContent = fmtNotional(notional);

  const aPays = Math.round((fixed / 100) * notional);
  const bPays = Math.round((sonia / 100) * notional);
  const net = Math.abs(aPays - bPays);
  const fmt = n => '£' + n.toLocaleString('en-GB');
  const nLabel = fmtNotional(notional);

  document.getElementById('a-pays').textContent = fmt(aPays);
  document.getElementById('a-pays-sub').textContent = fixed.toFixed(1) + '% × ' + nLabel + ' / yr';
  document.getElementById('b-pays').textContent = fmt(bPays);
  document.getElementById('b-pays-sub').textContent = sonia.toFixed(1) + '% × ' + nLabel + ' / yr';
  document.getElementById('net-val').textContent = fmt(net) + ' / yr';

  if (fixed > sonia) {
    document.getElementById('net-label').textContent = 'Party A pays Party B the net difference';
  } else if (sonia > fixed) {
    document.getElementById('net-label').textContent = 'Party B pays Party A the net difference';
  } else {
    document.getElementById('net-label').textContent = 'Rates are equal — no net payment';
  }
}

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
  document.querySelectorAll('.nav-btn')[page === 'home' ? 0 : 1].classList.add('active');
  window.scrollTo(0, 0);
}

// ── Form submit ───────────────────────────────────────────────
async function submitForm() {
  const fname = document.getElementById('fname').value.trim();
  const lname = document.getElementById('lname').value.trim();
  const company = document.getElementById('company').value.trim();
  const email = document.getElementById('email').value.trim();
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
    body: JSON.stringify({ fname, lname, company, email, loanType, loanSize, loanTerm, message })
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

