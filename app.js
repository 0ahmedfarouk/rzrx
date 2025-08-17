
// ===== Utilities (Local Storage DB) =====
const KEYS = {
  USER: 'rzrx_user',
  BALANCES: 'rzrx_balances',
  PURCHASES: 'rzrx_purchases', // { guildId: [slug, ...] }
  TXS: 'rzrx_transactions'     // [ {discordId, type, amount, reason, date} ]
};

const load = (k, fallback) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fallback; }
  catch { return fallback; }
};
const save = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// ===== Auth (Fake Login) =====
function getCurrentUser() {
  return load(KEYS.USER, null);
}
function loginPrompt() {
  const discord_id = prompt('أدخل Discord ID (مثال: 123456789012345678):');
  if (!discord_id) return;
  const username = prompt('اكتب اسم يظهر لك (اختياري):') || 'User';
  const avatar = 'https://cdn.discordapp.com/embed/avatars/0.png';
  const user = { discord_id, username, avatar };
  save(KEYS.USER, user);
  ensureUserInit(discord_id);
  location.reload();
}
function logout() {
  localStorage.removeItem(KEYS.USER);
  location.reload();
}

// ===== Balances / Credits =====
function ensureUserInit(discord_id) {
  const balances = load(KEYS.BALANCES, {});
  if (!(discord_id in balances)) {
    balances[discord_id] = 0;
    save(KEYS.BALANCES, balances);
  }
}
function getBalance(discord_id) {
  const balances = load(KEYS.BALANCES, {});
  return balances[discord_id] ?? 0;
}
function setBalance(discord_id, amount) {
  const balances = load(KEYS.BALANCES, {});
  balances[discord_id] = Math.max(0, parseInt(amount || 0, 10));
  save(KEYS.BALANCES, balances);
}
function addBalance(discord_id, delta, reason='ADJUST') {
  const b = getBalance(discord_id) + parseInt(delta, 10);
  setBalance(discord_id, b);
  const txs = load(KEYS.TXS, []);
  txs.push({ discordId: discord_id, type: (delta >= 0 ? 'EARN' : 'SPEND'), amount: Math.abs(delta), reason, date: new Date().toISOString() });
  save(KEYS.TXS, txs);
}

// ===== Purchases / Entitlements =====
function getEntitlements(guildId) {
  const p = load(KEYS.PURCHASES, {});
  return p[guildId] ?? [];
}
function addEntitlement(guildId, slug) {
  const p = load(KEYS.PURCHASES, {});
  p[guildId] = Array.from(new Set([...(p[guildId] || []), slug]));
  save(KEYS.PURCHASES, p);
}

// ===== UI Helpers =====
function setText(id, value) { const el = document.getElementById(id); if (el) el.textContent = value; }
function setVisible(id, flag) { const el = document.getElementById(id); if (el) el.style.display = flag ? '' : 'none'; }

// ===== Load Products =====
async function loadProducts() {
  const res = await fetch('products.json?_=' + Date.now());
  if (!res.ok) throw new Error('failed products');
  return await res.json();
}

// ===== Render Shop =====
async function renderShop() {
  const user = getCurrentUser();
  const products = await loadProducts();
  const list = document.getElementById('products-list');
  list.innerHTML = '';

  products.forEach(p => {
    const card = document.createElement('div');
    card.className = 'rounded-2xl border border-white/10 p-4 bg-white/5 flex flex-col';
    card.innerHTML = `
      <img src="${p.image}" class="rounded-xl w-full h-32 object-cover mb-3" alt="">
      <div class="font-semibold">${p.name}</div>
      <div class="text-sm text-white/70 mb-3">${p.description}</div>
      <div class="mt-auto flex items-center justify-between">
        <span class="text-sm">السعر: <b>${p.price}</b> ${window.RZRX_CONFIG.coinName}</span>
        <button class="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20" data-slug="${p.slug}">شراء</button>
      </div>
    `;
    list.appendChild(card);
  });

  list.querySelectorAll('button[data-slug]').forEach(btn => {
    btn.addEventListener('click', () => purchase(btn.dataset.slug));
  });

  // header state
  if (user) {
    setText('user-name', user.username);
    setText('balance', getBalance(user.discord_id));
    setVisible('logged-in', true);
    setVisible('logged-out', false);
  } else {
    setVisible('logged-in', false);
    setVisible('logged-out', true);
  }
}

async function purchase(slug) {
  const user = getCurrentUser();
  if (!user) return alert('سجّل دخول أولاً 🙏');
  const guildId = document.getElementById('guild-id').value.trim();
  if (!guildId) return alert('اكتب Server (Guild) ID الذي تريد تفعيل الباقة له');

  const products = await loadProducts();
  const product = products.find(p => p.slug === slug);
  if (!product) return alert('المنتج غير موجود');

  const bal = getBalance(user.discord_id);
  if (bal < product.price) return alert('رصيدك غير كافٍ');

  // Deduct + Save
  setBalance(user.discord_id, bal - product.price);
  addEntitlement(guildId, slug);
  const txs = load(KEYS.TXS, []);
  txs.push({ discordId: user.discord_id, type: 'SPEND', amount: product.price, reason: `Buy ${slug} for guild ${guildId}`, date: new Date().toISOString() });
  save(KEYS.TXS, txs);

  // Refresh header
  setText('balance', getBalance(user.discord_id));
  alert('تم الشراء والتفعيل محليًا ✅\n(ملاحظة: ده نموذج بدون سيرفر، التفعيل الحقيقي يحتاج ربط مع بوت/خادم لاحقًا)');
}

// ===== Admin Page =====
function adminInit() {
  const pin = prompt('أدخل Admin PIN');
  if (!pin) return alert('لم يتم إدخال PIN');
  if (pin !== window.RZRX_CONFIG.adminPin) return alert('PIN خاطئ');

  document.getElementById('admin-panel').style.display = '';

  document.getElementById('set-balance').addEventListener('click', () => {
    const id = document.getElementById('a-discord-id').value.trim();
    const amt = parseInt(document.getElementById('a-amount').value, 10);
    if (!id || isNaN(amt)) return alert('أدخل Discord ID وكمية صحيحة');
    setBalance(id, amt);
    alert('تم حفظ الرصيد ✅');
  });

  document.getElementById('give-balance').addEventListener('click', () => {
    const id = document.getElementById('a-discord-id').value.trim();
    const delta = parseInt(document.getElementById('a-delta').value, 10);
    if (!id || isNaN(delta)) return alert('أدخل Discord ID وكمية صحيحة');
    addBalance(id, delta, 'ADJUST');
    alert('تم إضافة/خصم الكوينز ✅');
  });
}

// ===== Init on pages =====
document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page || 'home';
  document.getElementById('brand').textContent = window.RZRX_CONFIG.brand;
  document.querySelectorAll('.coin-name').forEach(el => el.textContent = window.RZRX_CONFIG.coinName);

  if (page === 'home') {
    renderShop();
    document.getElementById('login-btn')?.addEventListener('click', loginPrompt);
    document.getElementById('logout-btn')?.addEventListener('click', logout);
  }
  if (page === 'admin') {
    adminInit();
  }
});
