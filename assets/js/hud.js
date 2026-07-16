/**
 * Centralized Interactive HUD Engine
 * Laser Tag Giżycko - Competition Level Web App Logic
 */

// --- SOUND ENGINE (Web Audio API Synthesizer) ---
let audioCtx = null;
let soundEnabled = localStorage.getItem('soundEnabled') === 'true';

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playLaserSound() {
  if (!soundEnabled) return;
  initAudio();
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(900, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.18);
  
  gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.18);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + 0.18);
}

function playBipSound(freq = 600, duration = 0.08) {
  if (!soundEnabled) return;
  initAudio();
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
  
  gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

// --- THEME ENGINE ---
function initTheme() {
  const isDay = localStorage.getItem('themeDay') === 'true';
  if (isDay) {
    document.body.classList.add('theme-day');
  } else {
    document.body.classList.remove('theme-day');
  }
}

// --- DOM CREATOR: SETTINGS PANEL & CONTROLS ---
function buildSettingsHUD() {
  // Create settings container
  const container = document.createElement('div');
  container.className = 'settings-hud';
  
  // Theme Button
  const themeBtn = document.createElement('button');
  themeBtn.className = 'settings-btn';
  themeBtn.id = 'toggle-theme-hud';
  themeBtn.innerHTML = `
    <span class="btn-icon">🌓</span>
    <span class="btn-lbl">Tryb</span>
  `;
  
  // Sound Button
  const soundBtn = document.createElement('button');
  soundBtn.className = `settings-btn ${soundEnabled ? 'active' : ''}`;
  soundBtn.id = 'toggle-sound-hud';
  soundBtn.innerHTML = `
    <span class="btn-icon">🔊</span>
    <span class="btn-lbl">${soundEnabled ? 'Dźwięk: Wł' : 'Dźwięk: Wył'}</span>
  `;
  
  container.appendChild(themeBtn);
  container.appendChild(soundBtn);
  document.body.appendChild(container);
  
  // Listeners
  themeBtn.addEventListener('click', () => {
    const wasDay = document.body.classList.toggle('theme-day');
    localStorage.setItem('themeDay', wasDay ? 'true' : 'false');
    playBipSound(wasDay ? 800 : 400);
  });
  
  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    localStorage.setItem('soundEnabled', soundEnabled ? 'true' : 'false');
    if (soundEnabled) {
      soundBtn.classList.add('active');
      soundBtn.querySelector('.btn-lbl').innerText = 'Dźwięk: Wł';
      initAudio();
      playLaserSound();
    } else {
      soundBtn.classList.remove('active');
      soundBtn.querySelector('.btn-lbl').innerText = 'Dźwięk: Wył';
    }
  });
}

// --- INTERACTIVE CLASS UPDATER (OFERTA) ---
const classesData = {
  assault: {
    name: 'Szturmowiec',
    role: 'Zrównoważony Atak // Karabinek Laserowy X-12',
    desc: 'Uniwersalna klasa przeznaczona do walki na średnich dystansach. Wyposażona w karabinek o średniej sile ognia i dużej szybkostrzelności. Idealna do przejmowania punktów i dynamicznej ofensywy.',
    fire: '80%',
    range: '65%',
    ammo: '75%',
    hp: '100 HP',
    hpBar: '55%'
  },
  sniper: {
    name: 'Snajper',
    role: 'Eliminacja Dystansowa // Karabin Laserowy L-99',
    desc: 'Wysoka precyzja i ogromny zasięg kosztem mniejszej szybkostrzelności. Klasa doskonała dla graczy lubiących trzymać dystans, obserwować pole bitwy z wieży i likwidować cele z daleka.',
    fire: '30%',
    range: '100%',
    ammo: '40%',
    hp: '80 HP',
    hpBar: '44%'
  },
  medic: {
    name: 'Medyk / Support',
    role: 'Leczenie i Odnowienie // Karabinek R-42 + Moduł Pola',
    desc: 'Kluczowe wsparcie dla całego teamu. Medyk posiada zdolność zdalnego leczenia/przywracania punktów życia swoim sojusznikom na odległość. Niezastąpiony podczas długich operacji taktycznych.',
    fire: '60%',
    range: '50%',
    ammo: '90%',
    hp: '120 HP',
    hpBar: '66%'
  },
  heavy: {
    name: 'Ciężkie Wsparcie',
    role: 'Obrona Sektora // CKM G-20 + Pancerna Kamizelka',
    desc: 'Ogromna pula zdrowia (HP) i nieskończona amunicja w magazynku. Klasa powolna, ale idealna do zaporowej obrony baz i korytarzy, przyjmująca na siebie najwięcej ognia nieprzyjaciela.',
    fire: '90%',
    range: '45%',
    ammo: '100%',
    hp: '160 HP',
    hpBar: '88%'
  }
};

window.selectClass = function(key, element) {
  playBipSound(550, 0.1);
  
  // Update active class
  document.querySelectorAll('.class-btn').forEach(btn => btn.classList.remove('active'));
  if (element) {
    element.classList.add('active');
  } else {
    // fallback to find button
    const btns = document.querySelectorAll('.class-btn');
    if (key === 'assault' && btns[0]) btns[0].classList.add('active');
    if (key === 'sniper' && btns[1]) btns[1].classList.add('active');
    if (key === 'medic' && btns[2]) btns[2].classList.add('active');
    if (key === 'heavy' && btns[3]) btns[3].classList.add('active');
  }
  
  const selected = classesData[key];
  if (!selected) return;
  
  const nameEl = document.getElementById('display-name');
  const roleEl = document.getElementById('display-role');
  const descEl = document.getElementById('display-desc');
  
  if (nameEl) nameEl.innerText = selected.name;
  if (roleEl) roleEl.innerText = selected.role;
  if (descEl) descEl.innerText = selected.desc;
  
  const statFire = document.getElementById('stat-fire');
  const barFire = document.getElementById('bar-fire');
  if (statFire && barFire) {
    statFire.innerText = selected.fire;
    barFire.style.width = selected.fire;
  }
  
  const statRange = document.getElementById('stat-range');
  const barRange = document.getElementById('bar-range');
  if (statRange && barRange) {
    statRange.innerText = selected.range;
    barRange.style.width = selected.range;
  }
  
  const statAmmo = document.getElementById('stat-ammo');
  const barAmmo = document.getElementById('bar-ammo');
  if (statAmmo && barAmmo) {
    statAmmo.innerText = selected.ammo;
    barAmmo.style.width = selected.ammo;
  }
  
  const statHp = document.getElementById('stat-hp');
  const barHp = document.getElementById('bar-hp');
  if (statHp && barHp) {
    statHp.innerText = selected.hp;
    barHp.style.width = selected.hpBar;
  }
};

function initClassConfigurator() {
  // Configured via window.selectClass
}

// --- CHECKOUT & BOOKING SIMULATION ENGINE ---
let calculatedBookingPrice = 300; // default state
let selectedBookingPackage = "Pakiet Standard (LT1)";

function buildCheckoutModal() {
  const modal = document.createElement('div');
  modal.className = 'checkout-modal';
  modal.id = 'checkout-modal';
  
  modal.innerHTML = `
    <div class="checkout-box">
      <span class="checkout-close" id="checkout-close-btn">&times;</span>
      <h3 class="checkout-title">Terminal Płatniczy</h3>
      <div id="checkout-summary-body">
        <div class="checkout-summary-row">
          <span>Pakiet:</span>
          <strong id="chk-package">${selectedBookingPackage}</strong>
        </div>
        <div class="checkout-summary-row">
          <span>Uczestnicy:</span>
          <strong id="chk-players">10 graczy</strong>
        </div>
        <div class="checkout-summary-row">
          <span>Czas misji:</span>
          <strong id="chk-duration">60 minut</strong>
        </div>
        <div class="checkout-summary-row">
          <span>Suma do zapłaty:</span>
          <strong class="text-accent" id="chk-price" style="font-size: 1.4rem;">${calculatedBookingPrice} PLN</strong>
        </div>
      </div>
      
      <div class="pay-btn-group">
        <button class="pay-btn active" data-type="blik">BLIK</button>
        <button class="pay-btn" data-type="card">Karta</button>
        <button class="pay-btn" data-type="transfer">Przelew</button>
      </div>

      <!-- BLIK SECTION -->
      <div class="checkout-input-group active" id="pay-group-blik">
        <label class="form-label" style="margin-top: 15px;">Kod BLIK (6 cyfr)</label>
        <input type="text" class="form-input" placeholder="000 000" id="blik-code" maxlength="6" style="text-align: center; font-size: 1.3rem; letter-spacing: 0.2em;">
      </div>

      <!-- CARD SECTION -->
      <div class="checkout-input-group" id="pay-group-card">
        <label class="form-label" style="margin-top: 15px;">Numer karty</label>
        <input type="text" class="form-input" placeholder="0000 0000 0000 0000" maxlength="19">
        <div class="d-flex gap-3" style="margin-top: 10px;">
          <div style="flex: 1;">
            <label class="form-label">Ważność</label>
            <input type="text" class="form-input" placeholder="MM/RR" maxlength="5">
          </div>
          <div style="flex: 1;">
            <label class="form-label">CVV</label>
            <input type="password" class="form-input" placeholder="***" maxlength="3">
          </div>
        </div>
      </div>

      <!-- TRANSFER SECTION -->
      <div class="checkout-input-group" id="pay-group-transfer">
        <label class="form-label" style="margin-top: 15px;">Wybierz swój bank</label>
        <select class="form-input" style="background: rgba(0,0,0,0.6); border-color: var(--border-ghost); color: #fff;">
          <option>mBank S.A.</option>
          <option>PKO Bank Polski</option>
          <option>Santander Bank Polska</option>
          <option>ING Bank Śląski</option>
          <option>Pekao SA</option>
          <option>Alior Bank</option>
        </select>
      </div>

      <button class="btn-hud btn-hud-orange" id="pay-confirm-btn" style="width: 100%; margin-top: 25px; border: none;">Autoryzuj Transakcję</button>
      
      <div id="payment-status-message" style="margin-top: 15px; text-align: center; font-weight: bold; min-height: 24px;"></div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Close triggers
  const closeBtn = document.getElementById('checkout-close-btn');
  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    playBipSound(400);
  });
  
  // Switch Payment Tabs
  const payButtons = modal.querySelectorAll('.pay-btn');
  payButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      payButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      playBipSound(650, 0.05);
      
      const type = btn.dataset.type;
      modal.querySelectorAll('.checkout-input-group').forEach(grp => grp.classList.remove('active'));
      document.getElementById(`pay-group-${type}`).classList.add('active');
    });
  });
  
  // Payment authorization trigger
  const confirmBtn = document.getElementById('pay-confirm-btn');
  const statusMsg = document.getElementById('payment-status-message');
  
  confirmBtn.addEventListener('click', () => {
    playLaserSound();
    confirmBtn.disabled = true;
    confirmBtn.innerText = "Przetwarzanie...";
    statusMsg.className = "text-cyan";
    statusMsg.innerText = "📡 Łączenie z bramką autoryzacyjną...";
    
    setTimeout(() => {
      statusMsg.innerText = "⏳ Weryfikacja środków i podpisu...";
      playBipSound(600, 0.1);
      
      setTimeout(() => {
        statusMsg.className = "text-success";
        statusMsg.innerText = "🟢 Transakcja zatwierdzona! Baza zarezerwowana.";
        confirmBtn.innerText = "Zakończone";
        playBipSound(800, 0.3);
        
        setTimeout(() => {
          // Reset modal state
          modal.style.display = 'none';
          confirmBtn.disabled = false;
          confirmBtn.innerText = "Autoryzuj Transakcję";
          statusMsg.innerText = "";
          const codeInput = document.getElementById('blik-code');
          if (codeInput) codeInput.value = "";
        }, 2000);
      }, 1500);
    }, 1200);
  });
}

function openCheckout(summaryData) {
  // Ensure DOM is created
  let modal = document.getElementById('checkout-modal');
  if (!modal) {
    buildCheckoutModal();
  }
  
  // Update details
  document.getElementById('chk-package').innerText = summaryData.package;
  document.getElementById('chk-players').innerText = summaryData.players + " graczy";
  document.getElementById('chk-duration').innerText = summaryData.duration + " minut";
  document.getElementById('chk-price').innerText = summaryData.price + " PLN";
  
  // Show
  document.getElementById('checkout-modal').style.display = 'flex';
  playLaserSound();
}

// --- FAQ ACCORDION ENGINE (KONTAKT) ---
window.toggleFaq = function(element) {
  playBipSound(550, 0.05);
  const isActive = element.classList.contains('active');
  
  // Close all
  document.querySelectorAll('.faq-item').forEach(item => {
    item.classList.remove('active');
    const answer = item.querySelector('.faq-a');
    if (answer) answer.style.maxHeight = null;
  });
  
  // Toggle current
  if (!isActive) {
    element.classList.add('active');
    const answer = element.querySelector('.faq-a');
    if (answer) answer.style.maxHeight = answer.scrollHeight + "px";
  }
};

function initFAQ() {
  // Configured via window.toggleFaq
}

// --- LIGHTBOX GALLERY ENGINE (GALERIA) ---
window.openLightbox = function(src, title) {
  playLaserSound();
  const lightbox = document.getElementById('lightbox');
  const img = document.getElementById('lightbox-img');
  const caption = document.getElementById('lightbox-caption');
  if (lightbox && img && caption) {
    img.src = src;
    caption.innerText = title;
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  }
};

window.closeLightbox = function() {
  playBipSound(400);
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.style.display = 'none';
    document.body.style.overflow = 'auto';
  }
};

function initGalleryLightbox() {
  // Configured via window.openLightbox
}

// --- SOUND FEEDBACK FOR NORMAL LINKS & HOVERS ---
function initSoundHooks() {
  // Attach sounds to all main navigation elements
  const interactiveElements = document.querySelectorAll('.desktop-menu a, .bottom-nav a, .btn-hud, .class-btn, .calc-btn-option');
  
  interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => {
      if (soundEnabled) playBipSound(800, 0.02);
    });
    el.addEventListener('click', () => {
      if (soundEnabled) {
        if (el.classList.contains('btn-hud-orange')) {
          playLaserSound();
        } else {
          playBipSound(600, 0.08);
        }
      }
    });
  });
}

// --- GLOBAL DYNAMIC CALCULATOR STATE (CENNIK.HTML) ---
let dayType = 'weekday'; // 'weekday' or 'weekend'
let modeType = 'indiv'; // 'indiv' or 'bday'
let bdayTier = '10'; // '10', '15', '20'
let bdaySize = 'S'; // 'S', 'M', 'L'

window.selectDay = function(type, element) {
  playBipSound(600, 0.08);
  const weekdayBtn = document.getElementById('day-weekday');
  const weekendBtn = document.getElementById('day-weekend');
  if (weekdayBtn) weekdayBtn.classList.remove('active');
  if (weekendBtn) weekendBtn.classList.remove('active');
  if (element) element.classList.add('active');
  dayType = type;
  window.updateCalculator();
};

window.selectMode = function(mode, element) {
  playBipSound(600, 0.08);
  const indivBtn = document.getElementById('mode-indiv');
  const bdayBtn = document.getElementById('mode-bday');
  if (indivBtn) indivBtn.classList.remove('active');
  if (bdayBtn) bdayBtn.classList.remove('active');
  if (element) element.classList.add('active');
  modeType = mode;
  
  const playersGroup = document.getElementById('calc-group-players');
  const bdayGroup = document.getElementById('calc-group-bday-options');
  if (mode === 'indiv') {
    if (playersGroup) playersGroup.style.display = 'block';
    if (bdayGroup) bdayGroup.style.display = 'none';
  } else {
    if (playersGroup) playersGroup.style.display = 'none';
    if (bdayGroup) bdayGroup.style.display = 'block';
  }
  window.updateCalculator();
};

window.selectBdayTier = function(tier, element) {
  playBipSound(600, 0.08);
  const t10 = document.getElementById('tier-10');
  const t15 = document.getElementById('tier-15');
  const t20 = document.getElementById('tier-20');
  if (t10) t10.classList.remove('active');
  if (t15) t15.classList.remove('active');
  if (t20) t20.classList.remove('active');
  if (element) element.classList.add('active');
  bdayTier = tier;
  window.updateCalculator();
};

window.selectBdaySize = function(size, element) {
  playBipSound(600, 0.08);
  const sS = document.getElementById('size-S');
  const sM = document.getElementById('size-M');
  const sL = document.getElementById('size-L');
  if (sS) sS.classList.remove('active');
  if (sM) sM.classList.remove('active');
  if (sL) sL.classList.remove('active');
  if (element) element.classList.add('active');
  bdaySize = size;
  window.updateCalculator();
};

window.updateCalculator = function() {
  const playersRange = document.getElementById('players-range');
  const playersVal = document.getElementById('players-val');
  const totalPriceEl = document.getElementById('total-price');
  
  if (!totalPriceEl) return;
  
  let price = 0;
  let playersCount = 10;
  if (playersRange) {
    playersCount = parseInt(playersRange.value);
    if (playersVal) playersVal.innerText = playersCount;
  }
  
  if (modeType === 'indiv') {
    if (dayType === 'weekday') {
      if (playersCount <= 6) {
        price = playersCount * 50;
      } else if (playersCount <= 10) {
        price = playersCount * 45;
      } else {
        price = playersCount * 40;
      }
    } else {
      if (playersCount <= 6) {
        price = playersCount * 60;
      } else if (playersCount <= 10) {
        price = playersCount * 55;
      } else {
        price = playersCount * 50;
      }
    }
    selectedBookingPackage = "Wejście Indywidualne";
  } else {
    const rates = {
      weekday: {
        '10': { S: 550, M: 600, L: 650 },
        '15': { S: 750, M: 800, L: 850 },
        '20': { S: 850, M: 900, L: 950 }
      },
      weekend: {
        '10': { S: 650, M: 700, L: 750 },
        '15': { S: 850, M: 900, L: 950 },
        '20': { S: 950, M: 1000, L: 1050 }
      }
    };
    price = rates[dayType][bdayTier][bdaySize];
    selectedBookingPackage = `Pakiet Urodzinowy ${bdaySize} (do ${bdayTier} os)`;
  }
  
  calculatedBookingPrice = price;
  totalPriceEl.innerText = price;
};

function initBookingCalculator() {
  const playersRange = document.getElementById('players-range');
  if (playersRange) {
    playersRange.addEventListener('input', () => {
      window.updateCalculator();
      if (soundEnabled) playBipSound(300 + parseInt(playersRange.value) * 15, 0.03);
    });
  }
  
  const bookBtn = document.getElementById('trigger-booking-payment');
  if (bookBtn) {
    bookBtn.addEventListener('click', (e) => {
      e.preventDefault();
      
      const playersRange = document.getElementById('players-range');
      let playersCount = 10;
      if (playersRange && modeType === 'indiv') {
        playersCount = playersRange.value;
      } else if (modeType === 'bday') {
        playersCount = bdayTier;
      }
      
      let durationDesc = "60";
      if (modeType === 'bday') {
        if (bdaySize === 'S') durationDesc = "120";
        if (bdaySize === 'M') durationDesc = "150";
        if (bdaySize === 'L') durationDesc = "180";
      }
      
      openCheckout({
        package: selectedBookingPackage,
        players: playersCount,
        duration: durationDesc,
        price: calculatedBookingPrice
      });
    });
  }
}

// --- INIT MAIN ENGINE ---
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  buildSettingsHUD();
  initBgCanvas();
  initClassConfigurator();
  initFAQ();
  initGalleryLightbox();
  initSoundHooks();
  initBookingCalculator();
  initArenaBookingForm();
  
  // Booking page normal submit override (for regular forms)
  const contactForm = document.getElementById('booking-contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      // Gather inputs
      const name = document.getElementById('client-name').value;
      const phone = document.getElementById('client-phone').value;
      const date = document.getElementById('booking-date').value;
      
      openCheckout({
        package: "Rezerwacja Areny (Misja Specjalna)",
        players: "Grupa (" + name + ")",
        duration: "Termin: " + date,
        price: 500
      });
    });
  }
});

// --- DYNAMIC BACKGROUND CANVAS ENGINE (Smoke & Lasers) ---
function initBgCanvas() {
  let canvas = document.getElementById('bg-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    document.body.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');
  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  // Smoke particles definition
  const particles = [];
  const particleCount = 20;
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 150 + 100,
      alpha: Math.random() * 0.1 + 0.05
    });
  }

  // Laser dots definition (for night mode)
  const lasers = [
    { x: Math.random() * width, y: Math.random() * height, tx: Math.random() * width, ty: Math.random() * height, color: 'rgba(255, 0, 127, 0.35)', dotColor: '#ff007f', speed: 0.005, size: 4 },
    { x: Math.random() * width, y: Math.random() * height, tx: Math.random() * width, ty: Math.random() * height, color: 'rgba(57, 255, 20, 0.35)', dotColor: '#39ff14', speed: 0.003, size: 5 },
    { x: Math.random() * width, y: Math.random() * height, tx: Math.random() * width, ty: Math.random() * height, color: 'rgba(0, 240, 255, 0.35)', dotColor: '#00f0ff', speed: 0.004, size: 4 }
  ];

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const isDay = document.body.classList.contains('theme-day');

    // 1. Draw Smoke Particles
    particles.forEach(p => {
      // Move particles
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around screen edges
      if (p.x < -p.radius) p.x = width + p.radius;
      if (p.x > width + p.radius) p.x = -p.radius;
      if (p.y < -p.radius) p.y = height + p.radius;
      if (p.y > height + p.radius) p.y = -p.radius;

      // Draw gradient
      const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
      if (isDay) {
        // Light grey-blue smoke for day mode
        grad.addColorStop(0, `rgba(210, 220, 235, ${p.alpha * 0.7})`);
        grad.addColorStop(1, 'rgba(210, 220, 235, 0)');
      } else {
        // Dark blue-purple smoke for night mode
        grad.addColorStop(0, `rgba(30, 35, 60, ${p.alpha * 0.8})`);
        grad.addColorStop(1, 'rgba(30, 35, 60, 0)');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
    });

    // 2. Draw Lasers (NIGHT MODE ONLY)
    if (!isDay) {
      lasers.forEach(l => {
        // Interpolate position towards target
        l.x += (l.tx - l.x) * l.speed;
        l.y += (l.ty - l.y) * l.speed;

        // If close to target, select a new target
        if (Math.abs(l.x - l.tx) < 10 && Math.abs(l.y - l.ty) < 10) {
          l.tx = Math.random() * width;
          l.ty = Math.random() * height;
        }

        // Draw laser line (starting from offscreen / or fixed points like top corners)
        ctx.strokeStyle = l.color;
        ctx.lineWidth = 1;
        ctx.shadowBlur = 10;
        ctx.shadowColor = l.dotColor;
        
        ctx.beginPath();
        // Each laser originates from a different corner to simulate real shooters from different spots
        if (l.color.includes('255, 0, 127')) {
          ctx.moveTo(0, 0); // Pink laser from top-left
        } else if (l.color.includes('57, 255')) {
          ctx.moveTo(width, 0); // Green laser from top-right
        } else {
          ctx.moveTo(width / 2, height); // Cyan laser from center bottom
        }
        ctx.lineTo(l.x, l.y);
        ctx.stroke();

        // Draw aiming dot (pulsing)
        const pulse = Math.sin(Date.now() * 0.01) * 3 + l.size;
        ctx.fillStyle = l.dotColor;
        ctx.beginPath();
        ctx.arc(l.x, l.y, pulse, 0, Math.PI * 2);
        ctx.fill();

        // Draw secondary outer ring
        ctx.strokeStyle = l.color;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(l.x, l.y, pulse * 2, 0, Math.PI * 2);
        ctx.stroke();

        // Reset shadow
        ctx.shadowBlur = 0;
      });
    }

    requestAnimationFrame(draw);
  }

  // Start loop
  requestAnimationFrame(draw);
}

// --- GLOBAL SVG MAP ZONE SELECTOR ---
window.selectZone = function(id, title, desc) {
  playBipSound(680, 0.1);
  const titleEl = document.getElementById('zone-title');
  const descEl = document.getElementById('zone-desc');
  if (titleEl && descEl) {
    titleEl.innerText = title;
    descEl.innerText = desc;
  }
  
  const card = document.getElementById('zone-details');
  if (card) {
    if (id === 'checkpoint-alfa') {
      card.style.borderColor = 'var(--accent-primary)';
      card.style.boxShadow = 'var(--laser-glow)';
    } else if (id === 'tower-bravo') {
      card.style.borderColor = 'var(--accent-secondary)';
      card.style.boxShadow = 'var(--sensor-glow)';
    } else {
      card.style.borderColor = 'var(--accent-success)';
      card.style.boxShadow = '0 0 15px rgba(var(--accent-success-rgb), 0.4)';
    }
  }
};

// --- GLOBAL EVENT TAB SELECTOR ---
const eventsData = {
  birthdays: {
    title: 'Urodziny Rekruta',
    desc: 'Zorganizuj najbardziej dynamiczne urodziny dla swojego dziecka na Mazurach! Oferujemy bezpieczną, bezbolesną rozgrywkę laserową, która uczy strategicznego myślenia i współpracy w grupie. Dzieci bawią się pod stałą opieką doświadczonego instruktora, który koordynuje scenariusze i dba o zasady gry. <br><br> W cenie każdego pakietu znajduje się dostęp do dedykowanej sali urodzinowej, wojskowy briefing oraz pamiątkowe dyplomy dla każdego rekruta.'
  },
  corporate: {
    title: 'Integracje Firmowe',
    desc: 'Szukasz sposobu na zgranie zespołu lub podsumowanie udanego kwartału? Laser tag to idealny teambuilding. Przygotowujemy spersonalizowane turnieje taktyczne, które zmuszają do podziału ról, planowania i błyskawicznej komunikacji pod presją czasu. <br><br> Oferujemy pełną wyłączność na obiekt, profesjonalny system rankingowy z wydrukiem statystyk dla każdego pracownika oraz możliwość organizacji pełnego cateringu z gorącymi posiłkami i zimnymi napojami.'
  },
  bachelor: {
    title: 'Wieczory Kawalerskie i Panieńskie',
    desc: 'Ostatnie chwile wolności w militarnym stylu! Przeprowadzamy specjalne misje typu "Polowanie na VIP-a", gdzie przyszły Pan Młody lub Panna Młoda staje się głównym celem taktycznym nieprzyjaciela. <br><br> Gwarantujemy potężną dawkę adrenaliny, nielimitowany dostęp do areny, gęsty dym i muzykę bitewną dostosowaną do Waszych upodobań. Po walce możecie kontynuować integrację w naszej sali odpraw.'
  }
};

window.selectEvent = function(key, btnElement) {
  playBipSound(550, 0.1);
  document.querySelectorAll('.class-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  
  if (btnElement) btnElement.classList.add('active');
  
  const selected = eventsData[key];
  if (selected) {
    const titleEl = document.getElementById('event-title');
    const descEl = document.getElementById('event-desc');
    if (titleEl) titleEl.innerHTML = selected.title;
    if (descEl) descEl.innerHTML = selected.desc;
  }
};

// --- ARENA BOOKING FORM SUBMISSION ENGINE ---
function initArenaBookingForm() {
  const form = document.getElementById('arena-booking-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const name = document.getElementById('form-name').value;
      const phone = document.getElementById('form-phone').value;
      const date = document.getElementById('form-date').value;
      const time = document.getElementById('form-time').value;
      const players = document.getElementById('form-players').value;
      const packageSelected = document.getElementById('form-package').value;
      
      const optionsList = [];
      if (document.getElementById('opt-fire').checked) optionsList.push("Ognisko");
      if (document.getElementById('opt-hour').checked) optionsList.push("Dodatkowa godzina");
      if (document.getElementById('opt-animator').checked) optionsList.push("Animator");
      
      const msg = document.getElementById('form-msg').value;

      playLaserSound();
      
      // Calculate estimated price
      let basePrice = 200;
      if (packageSelected === 'M') basePrice = 350;
      if (packageSelected === 'L') basePrice = 500;
      if (packageSelected === 'Plener') basePrice = 400; // default plener

      let extraPrice = 0;
      if (document.getElementById('opt-fire').checked) extraPrice += 150;
      if (document.getElementById('opt-hour').checked) extraPrice += 100;
      if (document.getElementById('opt-animator').checked) extraPrice += 100;

      const totalPrice = basePrice + extraPrice;
      
      // Open our modern checkout modal with all calculated details
      openCheckout({
        package: `Pakiet ${packageSelected} (Gra na Arenie)`,
        players: `${players} graczy (Zgłaszający: ${name})`,
        duration: `Termin: ${date} o godz. ${time}`,
        price: totalPrice
      });
      
      console.log("Rezerwacja zgłoszona:", { name, phone, date, time, players, packageSelected, optionsList, msg, totalPrice });
    });
  }
}


