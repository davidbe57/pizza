// ─── Map reveal ───
document.getElementById('mapRevealBtn')?.addEventListener('click', function() {
  const placeholder = document.getElementById('mapPlaceholder');
  const iframe = document.getElementById('mapIframe');
  iframe.src = iframe.dataset.src;
  iframe.onload = () => placeholder.classList.add('hidden');
});

// ─── Floating particles ───
(function() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  const symbols = ['🌿', '🍕', '🧀', '🌱', '✨'];
  for (let i = 0; i < 12; i++) {
    const p = document.createElement('span');
    p.className = 'hero-particle';
    p.textContent = symbols[i % symbols.length];
    p.style.left = Math.random() * 100 + '%';
    p.style.animationDuration = (8 + Math.random() * 12) + 's';
    p.style.animationDelay = (Math.random() * 10) + 's';
    p.style.fontSize = (12 + Math.random() * 16) + 'px';
    p.style.opacity = 0.08 + Math.random() * 0.12;
    hero.appendChild(p);
  }
})();

// ─── Hero title reveal ───
(function() {
  const title = document.querySelector('.hero-title');
  if (!title) return;
  const text = title.textContent;
  title.textContent = '';
  title.style.visibility = 'visible';
  title.style.opacity = '1';
  const letters = text.split('').map(l => l === ' ' ? '\u00A0' : l);
  title.innerHTML = letters.map((l, i) =>
    `<span class="hero-letter" style="animation-delay:${i * 0.07}s">${l}</span>`
  ).join('');
})();

// ─── Counters ───
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      if (!target || el.dataset.counted) return;
      el.dataset.counted = 'true';
      const duration = 2000;
      const step = Math.max(1, Math.floor(target / 60));
      let current = 0;
      const interval = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(interval); }
        el.textContent = current;
      }, duration / (target / step));
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter-number').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  counterObserver.observe(el);
});

// Also reveal counter items when counter becomes visible
const counterRevealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.counter-number').forEach((el, i) => {
        setTimeout(() => {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        }, i * 150);
      });
      counterRevealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.section-counters').forEach(el => counterRevealObserver.observe(el));

// ─── About Carousel ───
(function initAboutCarousel() {
  const imgs = document.querySelectorAll('#aboutCarousel .about-carousel-img');
  if (imgs.length < 2) return;
  let current = 0;
  setInterval(() => {
    imgs[current].classList.remove('active');
    current = (current + 1) % imgs.length;
    imgs[current].classList.add('active');
  }, 5000);
})();

// ─── Scroll Progress ───
const progressBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const scroll = window.pageYOffset;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = height > 0 ? `${(scroll / height) * 100}%` : '0%';
});

// ─── Navbar ───
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.pageYOffset > 80);
});

const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');
navToggle.addEventListener('click', () => {
  navToggle.classList.toggle('active');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navToggle.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// ─── API ───
async function api(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Erreur réseau');
  return res.json();
}

// ─── Render menu ───
function renderMenu(menu) {
  const pom = menu.find(p => p.pizzaOfMonth);
  const others = menu.filter(p => !p.pizzaOfMonth);

  const pomSection = document.getElementById('pizzaOfMonthContainer');
  if (pom) {
    const fallbackImg = 'https://cdn.website.dish.co/media/83/3f/8425421/CASA-TONIO-jpg-20230309-201756-0000-jpg.jpg';
    pomSection.innerHTML = `
      <div class="pom-card">
        <div class="pom-card-image">
          <img src="${pom.image || fallbackImg}" alt="${pom.name}" onerror="this.src='${fallbackImg}'">
        </div>
        <div class="pom-card-content">
          <span class="pom-badge">🏆 Pizza du mois</span>
          <h3>${pom.name}</h3>
          <p>${pom.description}</p>
          <span class="pom-price">${pom.price}</span>
        </div>
      </div>`;
  }

  const grid = document.getElementById('menuGrid');
  const fallbackImg = 'https://cdn.website.dish.co/media/83/3f/8425421/CASA-TONIO-jpg-20230309-201756-0000-jpg.jpg';

  if (others.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:rgba(255,255,255,0.4);padding:60px 0">Carte bientôt disponible</p>';
    return;
  }

  const allergenLabels = {
    gluten: '🌾',
    lactose: '🥛',
    poisson: '🐟',
    oeufs: '🥚',
    soja: '🫘',
    fruitsCoque: '🥜'
  };

  grid.innerHTML = others.map(p => `
    <div class="menu-item-card">
      <div class="item-image">
        <img src="${p.image || fallbackImg}" alt="${p.name}" loading="lazy" onerror="this.src='${fallbackImg}'">
      </div>
      <div class="item-info">
        <h3>${p.name}</h3>
        <p>${p.description}</p>
        ${p.allergens && p.allergens.length ? `<div class="item-allergens">${p.allergens.map(a => `<span class="allergen-tag" title="${a}">${allergenLabels[a] || a}</span>`).join('')}</div>` : ''}
        <div class="item-bottom">
          <span class="item-price">${p.price}</span>
          <span class="item-category">${p.category}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ─── Render hours ───
function renderHours(hours) {
  const days = [
    ['lundi', 'Lundi'], ['mardi', 'Mardi'], ['mercredi', 'Mercredi'],
    ['jeudi', 'Jeudi'], ['vendredi', 'Vendredi'], ['samedi', 'Samedi'], ['dimanche', 'Dimanche']
  ];

  const now = new Date();
  const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const todayKey = dayNames[now.getDay()];
  const todayIdx = days.findIndex(d => d[0] === todayKey);

  const tbody = document.getElementById('hoursBody');
  tbody.innerHTML = days.map(([key, label], i) => {
    const d = hours[key] || { midi: '', soir: '', ferme: false };
    const isToday = i === todayIdx;
    const todayAttr = isToday ? ' style="background:rgba(197,165,90,0.1);border-radius:6px;font-weight:700"' : '';
    if (d.ferme) {
      return `<tr${todayAttr}><td>${label}</td><td colspan="2">Fermé</td></tr>`;
    }
    return `<tr${todayAttr}><td>${label}</td><td>${d.midi || '—'}</td><td>${d.soir || '—'}</td></tr>`;
  }).join('');

  const statusEl = document.getElementById('todayStatus');
  const today = hours[todayKey] || {};
  if (today.ferme) {
    statusEl.className = 'today-status closed';
    statusEl.innerHTML = '<span class="status-dot"></span> Fermé aujourd\'hui';
  } else {
    statusEl.className = 'today-status open';
    statusEl.innerHTML = '<span class="status-dot"></span> Ouvert aujourd\'hui';
  }
}

// ─── Available slots ───
function parseTime(str) {
  const clean = str.replace(/[^\d:]/g, '');
  const [h, m] = clean.split(':').map(Number);
  return h * 60 + (m || 0);
}

function formatSlot(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${m ? m.toString().padStart(2, '0') : ''}`;
}

function generateSlots(hours, maxPizzasPerSlot, existingOrders) {
  const now = new Date();
  const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const todayKey = dayNames[now.getDay()];
  const today = hours[todayKey];

  if (!today || today.ferme) return [];

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const slots = [];

  const midiStart = today.midi ? parseTime(today.midi) : null;
  const midiEnd = today.midi && (today.midi.includes('–') || today.midi.includes(' - ')) ? parseTime(today.midi.split('–').length > 1 ? today.midi.split('–')[1] : today.midi.split(' - ')[1]) : null;
  const soirStart = today.soir ? parseTime(today.soir) : null;
  const soirEnd = today.soir && (today.soir.includes('–') || today.soir.includes(' - ')) ? parseTime(today.soir.split('–').length > 1 ? today.soir.split('–')[1] : today.soir.split(' - ')[1]) : null;

  const ranges = [];
  if (midiStart && midiEnd) ranges.push([midiStart - 15, midiEnd]);
  if (soirStart && soirEnd) ranges.push([soirStart - 15, soirEnd]);

  for (const [start, end] of ranges) {
    for (let t = start; t < end; t += 15) {
      if (t < currentMinutes + 45) continue;
      const slot = formatSlot(t);
      const count = existingOrders.filter(o => o.slot === slot && o.status !== 'Terminée').length;
      const remaining = Math.max(0, maxPizzasPerSlot - count);
      slots.push({ label: `${slot} (${remaining}/${maxPizzasPerSlot} dispo)`, value: slot, remaining, disabled: remaining === 0 });
    }
  }

  return slots;
}

let currentSlots = [];

async function populateSlots() {
  try {
    const data = await api('/api/slots');
    currentSlots = data.slots;
    const select = document.getElementById('orderSlot');
    const info = document.getElementById('slotInfo');

    if (data.ferme) {
      select.innerHTML = '<option value="">Fermé aujourd\'hui</option>';
      info.textContent = '';
      return;
    }
    if (data.slots.length === 0) {
      select.innerHTML = '<option value="">Plus de créneaux disponibles aujourd\'hui</option>';
      info.textContent = '⏰ Le délai de préparation de 45 min est dépassé pour ce soir. Revenez demain !';
      return;
    }

    select.innerHTML = '<option value="">Choisissez un créneau</option>' +
      data.slots.map(s =>
        `<option value="${s.value}" ${!s.disponible ? 'disabled' : ''}>
          ${s.value} (${s.remaining}/${s.max} dispo)
        </option>`
      ).join('');

    select.onchange = () => {
      const slot = data.slots.find(s => s.value === select.value);
      info.textContent = slot && slot.remaining <= 2
        ? `⚠️ Plus que ${slot.remaining} pizza(s) possible(s) sur ce créneau`
        : '';
    };
  } catch (e) {
    console.warn('Impossible de charger les créneaux');
  }
}

function countPizzas(str) {
  return (str.match(/(\d+)\s*x?/gi) || []).reduce((s, m) => s + parseInt(m), 0) || 1;
}

// ─── Testimonials ───
function renderTestimonials(testimonials) {
  const grid = document.getElementById('testimonialsGrid');
  if (!testimonials.length) {
    grid.innerHTML = '';
    return;
  }
  grid.innerHTML = testimonials.map(t => `
    <div class="testimonial-card">
      <div class="testimonial-stars" data-stars="${t.stars}">
        ${Array.from({length:5}, (_, i) =>
          `<span class="star${i < t.stars ? ' star--fill' : ''}">★</span>`
        ).join('')}
      </div>
      <p>« ${t.text} »</p>
      <div class="testimonial-author">
        <strong>${t.author}</strong>
        <span>${t.source || ''}${t.date ? ' · ' + t.date : ''}</span>
      </div>
    </div>
  `).join('');
  if (testimonials.length > 3) {
    grid.classList.add('carousel');
  } else {
    grid.classList.remove('carousel');
  }
  initStarAnimation();
}

function initStarAnimation() {
  const starObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const stars = entry.target.querySelectorAll('.star--fill');
        stars.forEach((s, i) => {
          s.style.animationDelay = `${i * 0.2}s`;
          s.classList.add('star--animate');
        });
        starObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.testimonial-card').forEach(el => starObserver.observe(el));
}

let testimonialScrollTimer = null;

function initTestimonialScroll() {
  if (testimonialScrollTimer) clearInterval(testimonialScrollTimer);
  const wrapper = document.getElementById('testimonialsWrapper');
  const grid = document.getElementById('testimonialsGrid');
  const cards = grid.querySelectorAll('.testimonial-card');
  if (cards.length <= 3) return;
  wrapper.style.overflow = 'hidden';
  testimonialScrollTimer = setInterval(() => {
    const first = grid.firstElementChild;
    if (!first) return;
    const gap = 24;
    const step = first.offsetWidth + gap;
    grid.style.transition = 'transform 0.6s ease';
    grid.style.transform = `translateX(-${step}px)`;
    setTimeout(() => {
      grid.style.transition = 'none';
      grid.style.transform = 'translateX(0)';
      grid.appendChild(first);
    }, 600);
  }, 4000);
}

// ─── Init ───
async function init() {
  try {
    const [menu, hours, testimonials] = await Promise.all([
      api('/api/menu'),
      api('/api/hours'),
      api('/api/testimonials')
    ]);
    renderMenu(menu);
    renderHours(hours);
    populateSlots();
    renderTestimonials(testimonials);
    initTestimonialScroll();
  } catch (e) {
    console.warn('API indisponible');
  }
}

init();

// ─── Copy phone ───
document.querySelectorAll('.copy-phone').forEach(el => {
  el.addEventListener('click', (e) => {
    e.preventDefault();
    const phone = el.dataset.phone;
    navigator.clipboard.writeText(phone).then(() => {
      el.classList.add('copied');
      el.querySelector('.copy-hint').textContent = 'Copié !';
      setTimeout(() => {
        el.classList.remove('copied');
        el.querySelector('.copy-hint').textContent = 'Copier';
      }, 2000);
    }).catch(() => {
      window.location.href = el.getAttribute('href');
    });
  });
});

// ─── FAB ───
const fabTop = document.getElementById('fabTop');
window.addEventListener('scroll', () => {
  fabTop.classList.toggle('visible', window.pageYOffset > 600);
});
fabTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ─── Order Modal ───
const fabOrder = document.getElementById('fabOrder');
const orderModal = document.getElementById('orderModal');
const orderModalClose = document.getElementById('orderModalClose');
const orderForm = document.getElementById('orderForm');

fabOrder.addEventListener('click', () => {
  orderModal.classList.add('open');
  document.body.style.overflow = 'hidden';
  populateSlots();
});

function closeOrderModal() {
  orderModal.classList.remove('open');
  document.body.style.overflow = '';
}

orderModalClose.addEventListener('click', closeOrderModal);
orderModal.addEventListener('click', (e) => {
  if (e.target === orderModal) closeOrderModal();
});

orderForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('orderName').value.trim();
  const phone = document.getElementById('orderPhone').value.trim();
  const pizzas = document.getElementById('orderPizzas').value.trim();
  const slotVal = document.getElementById('orderSlot').value;

  if (!name || !phone || !pizzas || !slotVal) return;

  const slotData = currentSlots.find(s => s.value === slotVal);
  const qty = countPizzas(pizzas);
  if (slotData && qty > slotData.remaining) {
    alert(`Vous commandez ${qty} pizzas mais il ne reste que ${slotData.remaining} place(s) sur ce créneau. Réduisez votre commande ou choisissez un autre créneau.`);
    return;
  }

  const submitBtn = orderForm.querySelector('button[type="submit"]');
  submitBtn.textContent = 'Envoi en cours...';
  submitBtn.disabled = true;

  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone, commande: pizzas, slot: slotVal, type: 'emporter' })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Erreur');
    }

    orderForm.innerHTML = `
      <div style="text-align:center;padding:20px 0">
        <div style="font-size:3rem;margin-bottom:16px">✅</div>
        <h3 style="font-family:'Playfair Display',serif;font-size:1.3rem;margin-bottom:8px">Commande à ${slotVal} confirmée !</h3>
        <p style="color:#666;font-size:0.9rem">${qty} pizza(s) · Nous vous rappelons au <strong>${phone}</strong> pour confirmer.</p>
      </div>
    `;
    setTimeout(closeOrderModal, 4000);
    populateSlots();
  } catch (err) {
    submitBtn.textContent = 'Erreur, réessayez';
    submitBtn.disabled = false;
    alert(err.message);
  }
});

// ─── Lightbox ───
const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');
const lightboxClose = document.getElementById('lightboxClose');
const lightboxPrev = document.getElementById('lightboxPrev');
const lightboxNext = document.getElementById('lightboxNext');
const lightboxCounter = document.getElementById('lightboxCounter');
let galleryItems = [];
let currentIndex = 0;

function openLightbox(index) {
  currentIndex = index;
  const item = galleryItems[index];
  if (!item) return;
  lightboxImg.src = item.dataset.src;
  lightboxImg.alt = item.querySelector('img').alt;
  lightboxCounter.textContent = `${index + 1} / ${galleryItems.length}`;
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function navigateLightbox(dir) {
  currentIndex = (currentIndex + dir + galleryItems.length) % galleryItems.length;
  const item = galleryItems[currentIndex];
  lightboxImg.src = item.dataset.src;
  lightboxImg.alt = item.querySelector('img').alt;
  lightboxCounter.textContent = `${currentIndex + 1} / ${galleryItems.length}`;
}

galleryItems = document.querySelectorAll('.gallery-item');
galleryItems.forEach((item, i) => {
  item.addEventListener('click', () => openLightbox(i));
});

lightboxClose.addEventListener('click', closeLightbox);
lightbox.addEventListener('click', (e) => {
  if (e.target === lightbox) closeLightbox();
});
lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
lightboxNext.addEventListener('click', () => navigateLightbox(1));

document.addEventListener('keydown', (e) => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft') navigateLightbox(-1);
  if (e.key === 'ArrowRight') navigateLightbox(1);
});

// ─── Cookie Consent ───
if (!localStorage.getItem('cookieConsent')) {
  setTimeout(() => {
    document.getElementById('cookieBanner').classList.add('show');
  }, 1000);
}

document.getElementById('cookieAccept').addEventListener('click', () => {
  localStorage.setItem('cookieConsent', 'true');
  document.getElementById('cookieBanner').classList.remove('show');
});

// ─── Share ───
document.getElementById('shareBtn').addEventListener('click', () => {
  if (navigator.share) {
    navigator.share({
      title: 'Casa Tonio — Pizzeria Artisanale',
      text: 'Pizzeria artisanale à Mégange — Produits locaux, pâte faite maison',
      url: window.location.href
    });
  } else {
    navigator.clipboard.writeText(window.location.href).then(() => {
      const btn = document.getElementById('shareBtn');
      btn.innerHTML = '✅ Lien copié';
      setTimeout(() => {
        btn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg> Partager`;
      }, 2000);
    });
  }
});

// ─── Scroll reveal staggered ───
const staggerObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = parseInt(entry.target.dataset.staggerDelay) || 0;
      setTimeout(() => {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }, delay);
      staggerObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll(
  '.section-header, .about-grid, .pom-card, .pom-section, ' +
  '.hours-wrapper, .contact-grid, .chef-wrapper'
).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.7s ease-out, transform 0.7s ease-out';
  staggerObserver.observe(el);
});

// Grid items with stagger
['.menu-item-card', '.partner-card', '.gallery-item', '.engagement-card', '.testimonial-card'].forEach(sel => {
  document.querySelectorAll(sel).forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    el.dataset.staggerDelay = i * 100;
    staggerObserver.observe(el);
  });
});
