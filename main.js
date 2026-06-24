// ===== FEATHER ICONS =====
if (typeof feather !== 'undefined') {
  feather.replace({ 'stroke-width': 1.75 });
}

// ===== NAV ACTIVE STATE =====
(function () {
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__links a, .mobile-nav a').forEach(link => {
    if (link.getAttribute('href') === current) link.classList.add('active');
  });
})();

// ===== MOBILE NAV TOGGLE =====
const hamburger = document.querySelector('.navbar__hamburger');
const mobileNav = document.querySelector('.mobile-nav');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    const spans = hamburger.querySelectorAll('span');
    spans[0].style.transform = open ? 'rotate(45deg) translate(5px, 5px)' : '';
    spans[1].style.opacity  = open ? '0' : '';
    spans[2].style.transform = open ? 'rotate(-45deg) translate(5px, -5px)' : '';
  });
}

// ===== TOAST =====
function showToast(message, success = true) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  const iconName = success ? 'check-circle' : 'alert-circle';
  toast.innerHTML = `<i data-feather="${iconName}"></i><span>${message}</span>`;
  if (typeof feather !== 'undefined') feather.replace({ 'stroke-width': 1.75 });
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 4200);
}

// ===== QUICK SEARCH FORM (homepage) =====
const quickSearch = document.getElementById('quickSearch');
if (quickSearch) {
  const today = new Date().toISOString().split('T')[0];
  const pickup  = document.getElementById('searchPickup');
  const dropoff = document.getElementById('searchDropoff');
  if (pickup)  pickup.min  = today;
  if (dropoff) dropoff.min = today;
  pickup?.addEventListener('change', () => { if (dropoff) dropoff.min = pickup.value; });

  quickSearch.addEventListener('submit', e => {
    e.preventDefault();
    const loc = document.getElementById('searchLocation')?.value;
    const p   = pickup?.value;
    const d   = dropoff?.value;
    if (!p || !d) { showToast('Please select pick-up and drop-off dates.', false); return; }
    window.location.href = `fleet.html?${new URLSearchParams({ location: loc, pickup: p, dropoff: d })}`;
  });
}

// ===== FLEET FILTERS =====
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const cat = btn.dataset.filter;
    document.querySelectorAll('.car-card[data-category]').forEach(card => {
      card.style.display = (cat === 'all' || card.dataset.category === cat) ? '' : 'none';
    });
  });
});

// ===== BOOKING PRICE CALCULATOR =====
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  const carSelect   = document.getElementById('carModel');
  const pickupDate  = document.getElementById('pickupDate');
  const returnDate  = document.getElementById('returnDate');
  const summaryDays = document.getElementById('summaryDays');
  const summaryRate = document.getElementById('summaryRate');
  const summarySub  = document.getElementById('summarySubtotal');
  const summaryTot  = document.getElementById('summaryTotal');

  const rates = {
    'Toyota Vitz': 80, 'Suzuki Swift': 75,
    'Toyota Corolla': 100, 'Honda Civic': 110,
    'Toyota RAV4': 150, 'Nissan X-Trail': 160,
    'Toyota Land Cruiser': 250, 'Mitsubishi Pajero': 210,
    'Toyota Hilux': 180, 'Ford Ranger': 200,
    'Toyota Hiace Van': 220, 'Mercedes C-Class': 280,
  };

  function updatePrice() {
    const car  = carSelect?.value;
    const p    = pickupDate?.value;
    const r    = returnDate?.value;
    if (!car || !p || !r) return;
    const rate = rates[car] || 100;
    const days = Math.max(1, Math.ceil((new Date(r) - new Date(p)) / 86400000));
    const sub  = rate * days;
    const tax  = Math.round(sub * 0.16);
    if (summaryDays) summaryDays.textContent = `${days} day${days > 1 ? 's' : ''}`;
    if (summaryRate) summaryRate.textContent = `K${rate}/day`;
    if (summarySub)  summarySub.textContent  = `K${sub.toLocaleString()}`;
    if (summaryTot)  summaryTot.textContent  = `K${(sub + tax).toLocaleString()}`;
  }

  carSelect?.addEventListener('change', updatePrice);
  pickupDate?.addEventListener('change', updatePrice);
  returnDate?.addEventListener('change', updatePrice);

  const today = new Date().toISOString().split('T')[0];
  if (pickupDate) pickupDate.min = today;
  if (returnDate) returnDate.min = today;
  pickupDate?.addEventListener('change', () => { if (returnDate) returnDate.min = pickupDate.value; });

  bookingForm.addEventListener('submit', e => {
    e.preventDefault();
    showToast('Booking submitted! We will confirm via call or email shortly.');
    setTimeout(() => { bookingForm.reset(); updatePrice(); }, 400);
  });

  // Pre-fill from URL params (e.g. clicking Book on fleet page)
  const params = new URLSearchParams(window.location.search);
  if (params.get('car') && carSelect) {
    carSelect.value = params.get('car');
    if (params.get('pickup') && pickupDate) pickupDate.value = params.get('pickup');
    if (params.get('dropoff') && returnDate) returnDate.value = params.get('dropoff');
    updatePrice();
  }
}

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();
    showToast('Message sent! Our team will get back to you soon.');
    contactForm.reset();
  });
}

// ===== INTERSECTION OBSERVER (scroll animations) =====
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.anim-fade').forEach(el => observer.observe(el));

// ===== SCROLL TO TOP =====
const scrollTopBtn = document.getElementById('scrollTop');
if (scrollTopBtn) {
  window.addEventListener('scroll', () => {
    scrollTopBtn.style.opacity = window.scrollY > 400 ? '1' : '0';
    scrollTopBtn.style.pointerEvents = window.scrollY > 400 ? 'all' : 'none';
  }, { passive: true });
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}
