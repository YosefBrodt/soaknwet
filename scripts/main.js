// =========================================
// JAX & JESSE'S — MAIN JS
// =========================================

// NAV SCROLL EFFECT
const nav = document.getElementById('nav');
if (nav) {
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// MOBILE NAV TOGGLE
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });
  // Close on link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => navLinks.classList.remove('open'));
  });
}

// SCROLL REVEAL
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// SERVICES PAGE TABS
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

if (tabBtns.length) {
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      const targetContent = document.getElementById(target);
      if (targetContent) {
        targetContent.classList.add('active');
        // Re-trigger reveals in newly shown tab
        targetContent.querySelectorAll('.reveal').forEach(el => {
          el.classList.add('visible');
        });
      }
    });
  });
}

// Handle anchor links to tabs (e.g. services.html#cutting)
if (window.location.hash) {
  const hash = window.location.hash.replace('#', '');
  const targetBtn = document.querySelector(`.tab-btn[data-tab="${hash}"]`);
  if (targetBtn) targetBtn.click();
}

// SERVICE SCOPE — vertical tabs (nav + panel per split block)
function initServiceSplit() {
  document.querySelectorAll('.service-split').forEach((split) => {
    const navBtns = split.querySelectorAll('.service-split-nav-btn');
    const panels = split.querySelectorAll('.service-split-panel');

    function syncPanelsAria() {
      panels.forEach((p) => {
        const active = p.classList.contains('is-active');
        p.setAttribute('aria-hidden', active ? 'false' : 'true');
      });
    }

    syncPanelsAria();

    navBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const panelId = btn.dataset.panel;
        if (!panelId) return;

        navBtns.forEach((b) => {
          const active = b === btn;
          b.classList.toggle('active', active);
          b.setAttribute('aria-selected', active ? 'true' : 'false');
        });

        panels.forEach((p) => {
          p.classList.toggle('is-active', p.id === panelId);
        });
        syncPanelsAria();
      });
    });
  });
}

initServiceSplit();

// GALLERY FILTERS
const filterBtns = document.querySelectorAll('.filter-btn');
const galleryItems = document.querySelectorAll('.gallery-item');

if (filterBtns.length) {
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      galleryItems.forEach(item => {
        if (filter === 'all') {
          item.classList.remove('hidden');
        } else {
          const cats = item.dataset.category || '';
          item.classList.toggle('hidden', !cats.includes(filter));
        }
      });
    });
  });
}

// FORM SUBMISSION (placeholder — swap for real handler)
const quoteForm = document.getElementById('quoteForm');
if (quoteForm) {
  quoteForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = quoteForm.querySelector('[type="submit"]');
    btn.textContent = 'Submitted! We\'ll be in touch.';
    btn.style.background = '#1e3048';
    btn.style.borderColor = '#1e3048';
    btn.style.color = '#fff';
    btn.disabled = true;
  });
}
