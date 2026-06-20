import { ThreeScene } from './three-scene.js';

// ---------- DOM REFS ----------
const loader = document.getElementById('loader');
const loaderBar = document.getElementById('loaderBar');
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
const hero = document.getElementById('hero');
const scrollIndicator = document.getElementById('scrollIndicator');
const labelsContainer = document.getElementById('labels-container');
const infoPanel = document.getElementById('infoPanel');
const infoName = document.getElementById('infoName');
const infoDesc = document.getElementById('infoDesc');
const infoClose = document.getElementById('infoClose');
const loginBtn = document.getElementById('loginBtn');
const authModal = document.getElementById('authModal');
const authClose = document.getElementById('authClose');
const waitlistForm = document.getElementById('waitlistForm');
const waitlistEmail = document.getElementById('waitlistEmail');
const waitlistBtn = document.getElementById('waitlistBtn');
const waitlistToast = document.getElementById('waitlistToast');

// ---------- STATE ----------
let sceneInstance = null;
let isLoaded = false;
let currentPlanetId = null;

// ---------- THREE.JS SCENE ----------
function initThree() {
  const container = document.getElementById('three-container');
  sceneInstance = new ThreeScene(container);
  
  // Update labels on each frame
  function updateLabels() {
    if (!sceneInstance || !sceneInstance.isLoaded) {
      requestAnimationFrame(updateLabels);
      return;
    }
    const positions = sceneInstance.getPlanetScreenPositions();
    updatePlanetLabels(positions);
    requestAnimationFrame(updateLabels);
  }
  
  requestAnimationFrame(updateLabels);
}

// ---------- PLANET LABELS ----------
function updatePlanetLabels(positions) {
  const labelData = {
    learn: { name: 'Avarith Learn', sub: 'Coming Soon', color: '#5BBFD6' },
    agent: { name: 'Avarith Agent', sub: 'Coming Soon', color: '#8A7EC4' },
    memory: { name: 'Avarith Memory', sub: 'Coming Soon', color: '#C4A06B' },
    api: { name: 'Avarith API', sub: 'Coming Soon', color: '#6BA87A' }
  };

  // Remove old labels
  labelsContainer.innerHTML = '';

  // Create new labels
  Object.keys(positions).forEach(id => {
    const pos = positions[id];
    const data = labelData[id];
    if (!data || pos.depth > 0.98) return; // Skip if behind camera

    const label = document.createElement('div');
    label.className = 'planet-label';
    label.style.left = pos.x + 'px';
    label.style.top = pos.y + 'px';
    label.style.transform = 'translate(-50%, -50%)';
    label.style.opacity = 0.3 + 0.7 * (1 - (pos.depth + 1) / 2);
    label.dataset.id = id;

    label.innerHTML = `
      <span class="label-dot" style="background:${data.color}"></span>
      <span class="planet-label-name">${data.name}</span>
      <span class="planet-label-sub">${data.sub}</span>
    `;

    label.addEventListener('click', () => {
      showPlanetInfo(id, data);
    });

    // Hover effect
    label.addEventListener('mouseenter', () => {
      label.style.transform = 'translate(-50%, -50%) scale(1.08)';
    });
    label.addEventListener('mouseleave', () => {
      label.style.transform = 'translate(-50%, -50%) scale(1)';
    });

    labelsContainer.appendChild(label);
  });
}

// ---------- PLANET INFO ----------
function showPlanetInfo(id, data) {
  const descriptions = {
    learn: 'Knowledge that accumulates. Every interaction makes the system smarter — persisting across sessions, compounding over time, transferring across the collective pool. The more it runs, the smarter the whole ecosystem becomes.',
    agent: 'Autonomous agents that plan, execute, and adapt. Powered by persistent memory and continuous feedback loops from Avarith Core — not just reactive next-token prediction.',
    memory: 'Cross-session, cross-model memory infrastructure. Context that persists, retrieves with precision, and surfaces exactly when needed — regardless of which model is currently active.',
    api: 'Memory, learning, and feedback as a service. Clean APIs that let developers integrate Avarith Core capabilities into any application, any model, any stack.'
  };

  infoName.textContent = data.name;
  infoDesc.textContent = descriptions[id] || 'Coming soon.';
  infoPanel.classList.add('open');
  currentPlanetId = id;
}

// ---------- LOADER ----------
let progress = 0;
function simulateLoader() {
  const interval = setInterval(() => {
    progress += Math.random() * 3 + 1;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      setTimeout(() => {
        loader.classList.add('hidden');
        isLoaded = true;
        initThree();
        initScrollEffects();
        initObservers();
      }, 300);
    }
    loaderBar.style.width = Math.min(progress, 100) + '%';
  }, 50);
}

// ---------- SCROLL EFFECTS ----------
function initScrollEffects() {
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const vh = window.innerHeight;

    // Nav shadow
    if (scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Scroll indicator
    if (scrollY > 100) {
      scrollIndicator.classList.add('hidden');
    } else {
      scrollIndicator.classList.remove('hidden');
    }

    // Hero fade on scroll
    const heroOpacity = Math.max(0, 1 - scrollY / (vh * 0.6));
    hero.style.opacity = heroOpacity;
  });
}

// ---------- INTERSECTION OBSERVER (Principles) ----------
function initObservers() {
  const cards = document.querySelectorAll('.principle-card');
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = parseInt(entry.target.dataset.delay) || 0;
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, delay);
      }
    });
  }, { threshold: 0.2, rootMargin: '0px 0px -50px 0px' });

  cards.forEach(card => observer.observe(card));

  // Number animation for stats
  const stats = document.querySelectorAll('.stat-number');
  let statsAnimated = false;
  
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !statsAnimated) {
        statsAnimated = true;
        stats.forEach(stat => {
          const target = parseInt(stat.dataset.count);
          animateNumber(stat, target);
        });
      }
    });
  }, { threshold: 0.5 });

  const statsContainer = document.querySelector('.about-stats');
  if (statsContainer) statsObserver.observe(statsContainer);
}

function animateNumber(el, target) {
  let current = 0;
  const duration = 1800;
  const start = performance.now();
  
  const update = (time) => {
    const progress = Math.min(1, (time - start) / duration);
    const eased = 1 - Math.pow(1 - progress, 3);
    current = Math.round(eased * target);
    el.textContent = current + (target === 100 ? '%' : '');
    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = target + (target === 100 ? '%' : '');
    }
  };
  requestAnimationFrame(update);
}

// ---------- WAITLIST ----------
waitlistForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = waitlistEmail.value.trim();
  
  if (!email || !email.includes('@')) {
    showToast('Please enter a valid email address.', 'error');
    return;
  }

  waitlistBtn.textContent = 'Joining...';
  waitlistBtn.disabled = true;

  try {
    const response = await fetch('/api/waitlist/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email, 
        source: 'landing_page',
        referrer: document.referrer || 'direct'
      })
    });

    const data = await response.json();

    if (response.ok) {
      showToast('🎉 You\'re on the waitlist! Check your email for confirmation.', 'success');
      waitlistEmail.value = '';
    } else {
      showToast(data.error || 'Something went wrong. Please try again.', 'error');
    }
  } catch (error) {
    showToast('Network error. Please try again.', 'error');
  } finally {
    waitlistBtn.textContent = 'Join';
    waitlistBtn.disabled = false;
  }
});

function showToast(message, type) {
  waitlistToast.textContent = message;
  waitlistToast.className = 'waitlist-toast show ' + type;
  setTimeout(() => {
    waitlistToast.className = 'waitlist-toast';
  }, 5000);
}

// ---------- AUTH MODAL ----------
loginBtn.addEventListener('click', () => {
  authModal.classList.add('open');
});

authClose.addEventListener('click', () => {
  authModal.classList.remove('open');
});

authModal.addEventListener('click', (e) => {
  if (e.target === authModal) {
    authModal.classList.remove('open');
  }
});

// Auth tabs
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    const target = tab.dataset.tab;
    document.getElementById('loginForm').classList.toggle('hidden', target !== 'login');
    document.getElementById('registerForm').classList.toggle('hidden', target !== 'register');
  });
});

// Auth form submit
document.getElementById('authForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const isLogin = document.getElementById('loginForm').classList.contains('hidden') === false;
  const errorEl = document.getElementById('authError');
  
  let data = {};
  if (isLogin) {
    data = {
      email: document.getElementById('loginEmail').value,
      password: document.getElementById('loginPassword').value
    };
  } else {
    data = {
      name: document.getElementById('registerName').value,
      email: document.getElementById('registerEmail').value,
      password: document.getElementById('registerPassword').value,
      phone: document.getElementById('registerPhone').value
    };
  }

  try {
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (response.ok) {
      errorEl.textContent = '✅ Success!';
      errorEl.style.color = '#6BA87A';
      setTimeout(() => {
        authModal.classList.remove('open');
        errorEl.textContent = '';
        errorEl.style.color = '';
      }, 1500);
    } else {
      errorEl.textContent = result.error || 'Authentication failed.';
      errorEl.style.color = '#D65B5B';
    }
  } catch (error) {
    errorEl.textContent = 'Network error. Please try again.';
    errorEl.style.color = '#D65B5B';
  }
});

// ---------- NAV TOGGLE (Mobile) ----------
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});

// Close nav on link click (mobile)
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// ---------- INFO PANEL CLOSE ----------
infoClose.addEventListener('click', () => {
  infoPanel.classList.remove('open');
});

// Keyboard shortcut: ESC to close info
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    infoPanel.classList.remove('open');
    authModal.classList.remove('open');
  }
});

// ---------- PLANET CLICK FROM THREE ----------
document.addEventListener('planet-click', (e) => {
  const { id, data } = e.detail;
  showPlanetInfo(id, data);
});

// ---------- START ----------
document.addEventListener('DOMContentLoaded', () => {
  simulateLoader();
});

// ---------- SERVICE WORKER (PWA) ----------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('✅ SW registered:', reg))
      .catch(err => console.log('❌ SW registration failed:', err));
  });
}