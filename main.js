// cart stored in localStorage
let cart = JSON.parse(localStorage.getItem('sn-cart') || '[]');

function saveCart() {
  localStorage.setItem('sn-cart', JSON.stringify(cart));
}

function updateBadge() {
  const total = cart.reduce((sum, i) => sum + i.qty, 0);
  document.querySelectorAll('.badge').forEach(el => {
    el.textContent = total;
    el.style.display = total ? 'flex' : 'none';
  });
}

function addToCart(id, name, price, img) {
  const found = cart.find(i => i.id === id);
  if (found) found.qty++;
  else cart.push({ id, name, price, img, qty: 1 });
  saveCart();
  updateBadge();
  toast(`"${name}" added to cart`);
}

function toast(msg, type = '') {
  let el = document.getElementById('toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = `toast ${type}`;
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => el.classList.remove('show'), 2800);
}

// wishlist
let wishlist = JSON.parse(localStorage.getItem('sn-wish') || '[]');

function toggleWish(btn, id, name) {
  const i = wishlist.indexOf(id);
  if (i === -1) { wishlist.push(id); btn.style.color = '#e63946'; toast(`Added to wishlist`); }
  else { wishlist.splice(i, 1); btn.style.color = ''; toast(`Removed from wishlist`); }
  localStorage.setItem('sn-wish', JSON.stringify(wishlist));
}

// hook up product cards
function bindCards() {
  document.querySelectorAll('[data-add]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const card = el.closest('[data-id]');
      if (!card) return;
      addToCart(card.dataset.id, card.dataset.name, +card.dataset.price, card.querySelector('img')?.src || '');
    });
  });

  document.querySelectorAll('.wish-btn').forEach(btn => {
    const card = btn.closest('[data-id]');
    if (!card) return;
    if (wishlist.includes(card.dataset.id)) btn.style.color = '#e63946';
    btn.addEventListener('click', e => {
      e.preventDefault();
      toggleWish(btn, card.dataset.id, card.dataset.name);
    });
  });
}

// hero slider
function initSlider() {
  const track = document.querySelector('.slider-track');
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  if (!track || !slides.length) return;

  let cur = 0;
  let timer = setInterval(next, 4500);

  function go(n) {
    cur = (n + slides.length) % slides.length;
    track.style.transform = `translateX(-${cur * 100}%)`;
    dots.forEach((d, i) => d.classList.toggle('active', i === cur));
  }

  function next() { go(cur + 1); }

  document.querySelector('.slider-arrow.next')?.addEventListener('click', () => { next(); reset(); });
  document.querySelector('.slider-arrow.prev')?.addEventListener('click', () => { go(cur - 1); reset(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { go(i); reset(); }));

  function reset() { clearInterval(timer); timer = setInterval(next, 4500); }
}

// countdown
function initTimer() {
  const end = Date.now() + 12 * 3600 * 1000;
  function tick() {
    const d = end - Date.now();
    if (d <= 0) return;
    const h = String(Math.floor(d / 3600000)).padStart(2, '0');
    const m = String(Math.floor((d % 3600000) / 60000)).padStart(2, '0');
    const s = String(Math.floor((d % 60000) / 1000)).padStart(2, '0');
    const H = document.getElementById('th');
    const M = document.getElementById('tm');
    const S = document.getElementById('ts');
    if (H) H.textContent = h;
    if (M) M.textContent = m;
    if (S) S.textContent = s;
  }
  tick();
  setInterval(tick, 1000);
}

// cart page
function renderCart() {
  const wrap = document.getElementById('cart-items');
  if (!wrap) return;

  if (!cart.length) {
    wrap.innerHTML = `<p style="text-align:center;padding:40px;color:#999">Your cart is empty. <a href="shop.html" style="color:#e63946;font-weight:600">Shop now →</a></p>`;
    calcSummary();
    return;
  }

  wrap.innerHTML = cart.map(item => `
    <div class="cart-row" data-rid="${item.id}">
      <div class="cart-product">
        <img src="${item.img}" alt="${item.name}" onerror="this.src='https://placehold.co/64x64/f5f5f5/999?text=?'">
        <div>
          <div class="pname">${item.name}</div>
          <div class="pmeta">₹${item.price.toLocaleString()} each</div>
        </div>
      </div>
      <div class="qty-ctrl">
        <button onclick="changeQty('${item.id}',-1)">−</button>
        <span>${item.qty}</span>
        <button onclick="changeQty('${item.id}',1)">+</button>
      </div>
      <div class="price">₹${item.price.toLocaleString()}</div>
      <div class="total">₹${(item.price * item.qty).toLocaleString()}</div>
      <button class="remove-btn" onclick="removeItem('${item.id}')">✕</button>
    </div>
  `).join('');

  calcSummary();
}

function changeQty(id, d) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += d;
  if (item.qty < 1) cart = cart.filter(i => i.id !== id);
  saveCart(); updateBadge(); renderCart();
}

function removeItem(id) {
  cart = cart.filter(i => i.id !== id);
  saveCart(); updateBadge(); renderCart();
}

function calcSummary() {
  const sub = cart.reduce((a, b) => a + b.price * b.qty, 0);
  const disc = Math.round(sub * 0.1);
  const ship = sub > 999 ? 0 : 99;
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('s-sub', `₹${sub.toLocaleString()}`);
  set('s-disc', `-₹${disc.toLocaleString()}`);
  set('s-ship', ship ? `₹${ship}` : 'FREE');
  set('s-total', `₹${(sub - disc + ship).toLocaleString()}`);
}

// auth forms
function initAuth() {
  document.querySelectorAll('.pw-wrap button').forEach(btn => {
    btn.addEventListener('click', () => {
      const inp = btn.previousElementSibling;
      inp.type = inp.type === 'password' ? 'text' : 'password';
      btn.textContent = inp.type === 'password' ? '👁' : '🙈';
    });
  });

  document.getElementById('login-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const em = document.getElementById('email').value.trim();
    const pw = document.getElementById('pw').value;
    if (!em || !pw) { toast('Fill in all fields', 'err'); return; }
    toast('Logging in...');
    setTimeout(() => location.href = 'index.html', 1600);
  });

  document.getElementById('signup-form')?.addEventListener('submit', e => {
    e.preventDefault();
    const pw = document.getElementById('pw').value;
    const cpw = document.getElementById('cpw')?.value;
    if (cpw && pw !== cpw) { toast('Passwords do not match', 'err'); return; }
    toast('Account created!');
    setTimeout(() => location.href = 'index.html', 1600);
  });
}

// active nav link
function markActive() {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === page);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateBadge();
  bindCards();
  initSlider();
  initTimer();
  renderCart();
  initAuth();
  markActive();
});
