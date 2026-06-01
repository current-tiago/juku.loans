// ── Calculator ──────────────────────────────────────────────
function calc() {
  const fixed = parseFloat(document.getElementById('fixed-rate').value);
  const sonia = parseFloat(document.getElementById('sonia').value);
  const notional = parseFloat(document.getElementById('notional').value) * 1000;

  document.getElementById('fixed-out').textContent = fixed.toFixed(1) + '%';
  document.getElementById('sonia-out').textContent = sonia.toFixed(1) + '%';
  document.getElementById('notional-out').textContent = '£' + (notional / 1000).toFixed(0) + 'k';

  const aPays = Math.round((fixed / 100) * notional);
  const bPays = Math.round((sonia / 100) * notional);
  const net = Math.abs(aPays - bPays);
  const fmt = n => '£' + n.toLocaleString('en-GB');
  const nk = (notional / 1000).toFixed(0);

  document.getElementById('a-pays').textContent = fmt(aPays);
  document.getElementById('a-pays-sub').textContent = fixed.toFixed(1) + '% × £' + nk + 'k / yr';
  document.getElementById('b-pays').textContent = fmt(bPays);
  document.getElementById('b-pays-sub').textContent = sonia.toFixed(1) + '% × £' + nk + 'k / yr';
  document.getElementById('net-val').textContent = fmt(net) + ' / yr';

  if (fixed > sonia) {
    document.getElementById('net-label').textContent = 'Party A pays Party B the net difference';
  } else if (sonia > fixed) {
    document.getElementById('net-label').textContent = 'Party B pays Party A the net difference';
  } else {
    document.getElementById('net-label').textContent = 'Rates are equal — no net payment';
  }
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
function submitForm() {
  const fname = document.getElementById('fname').value.trim();
  const email = document.getElementById('email').value.trim();
  if (!fname || !email) {
    alert('Please fill in your name and email address.');
    return;
  }
  document.getElementById('form-inner').style.display = 'none';
  document.getElementById('success-msg').style.display = 'block';
}

