// ---- Helpers ----
function getUsers() { return JSON.parse(localStorage.getItem('users') || '[]'); }
function saveUsers(u) { localStorage.setItem('users', JSON.stringify(u)); }
function getPosts() { return JSON.parse(localStorage.getItem('posts') || '[]'); }
function savePosts(p) { localStorage.setItem('posts', JSON.stringify(p)); }
function getSession() { return localStorage.getItem('session'); }
function setSession(u) { localStorage.setItem('session', u); }
function clearSession() { localStorage.removeItem('session'); }

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function initOwner() {
  const users = getUsers();
  if (!users.find(u => u.username === 'Alex')) {
    users.push({ username: 'Alex', password: 'Alex', bio: 'Owner & Founder', avatarColor: '#7c6af7', nameColor: '#ffffff', badge: '⚡ Owner' });
    saveUsers(users);
  }
}

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return diff + 's atrás';
  if (diff < 3600) return Math.floor(diff / 60) + 'min atrás';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h atrás';
  return Math.floor(diff / 86400) + 'd atrás';
}

// ---- Auth ----
function register() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const confirm  = document.getElementById('confirm').value;
  const error    = document.getElementById('error');

  if (!username || !password) return (error.textContent = 'Preencha todos os campos.');
  if (password !== confirm)   return (error.textContent = 'Senhas não coincidem.');

  const users = getUsers();
  if (users.find(u => u.username === username)) return (error.textContent = 'Usuário já existe.');

  users.push({ username, password });
  saveUsers(users);
  setSession(username);
  window.location.href = 'index.html';
}

function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const error    = document.getElementById('error');

  const users = getUsers();
  const user  = users.find(u => u.username === username && u.password === password);
  if (!user) return (error.textContent = 'Usuário ou senha incorretos.');

  setSession(username);
  window.location.href = 'index.html';
}

function logout() {
  clearSession();
  window.location.href = 'index.html';
}

function togglePass(id, btn) {
  const input = document.getElementById(id);
  if (!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.querySelector('i').className = show ? 'fas fa-eye-slash' : 'fas fa-eye';
}

// ---- Modal ----
function openPostModal() {
  const m = document.getElementById('postModal');
  if (m) m.classList.add('open');
}

function closePostModal() {
  const m = document.getElementById('postModal');
  if (m) m.classList.remove('open');
}

// ---- Posts ----
function submitPost() {
  const title = document.getElementById('mTitle')?.value.trim();
  const code  = document.getElementById('mCode')?.value.trim();
  const game  = document.getElementById('mGame')?.value.trim();
  const image = document.getElementById('mImage')?.value.trim();
  const desc  = document.getElementById('mDesc')?.value.trim();
  const tags  = document.getElementById('mTags')?.value.split(',').map(t => t.trim()).filter(Boolean);

  if (!title || !code) return alert('Preencha o título e o script.');

  const posts = getPosts();
  posts.unshift({
    id: Date.now(),
    title, code, game, image, desc, tags,
    author: getSession(),
    date: new Date().toLocaleDateString('pt-BR'),
    ts: Date.now(),
    views: 0
  });
  savePosts(posts);
  closePostModal();

  // limpa campos
  ['mTitle','mCode','mGame','mImage','mDesc','mTags'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  renderFeed();
  updateStats();
}

function copyScript(id, e) {
  if (e) e.preventDefault();
  const post = getPosts().find(p => p.id === id);
  if (!post) return;
  navigator.clipboard.writeText(post.code);
}

// ---- Filter ----
let currentFilter = 'all';
function setFilter(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderFeed();
}

// ---- Feed ----
function renderFeed() {
  const grid = document.getElementById('scriptGrid');
  if (!grid) return;

  let posts = getPosts();
  const q = document.getElementById('searchInput')?.value.toLowerCase() || '';

  if (q) posts = posts.filter(p => (p.title + (p.game||'') + (p.author||'')).toLowerCase().includes(q));
  if (currentFilter === 'recent') posts = posts.slice(0, 10);

  if (posts.length === 0) {
    grid.innerHTML = '<p class="feed-empty">Nenhum script encontrado. Seja o primeiro a postar!</p>';
    return;
  }

  grid.innerHTML = posts.map(p => {
    const img = p.image
      ? `<div class="pc-img"><img src="${escapeHtml(p.image)}" alt="cover" onerror="this.parentElement.classList.add('pc-img-err')"/></div>`
      : `<div class="pc-img pc-img-placeholder"><i class="fas fa-code"></i></div>`;
    return `
    <a class="post-card" href="script.html?id=${p.id}">
      <div class="pc-top">
        <span class="pc-time"><i class="fas fa-clock"></i> ${timeAgo(p.ts) || p.date}</span>
        <span class="pc-author">@${escapeHtml(p.author || 'anon')}</span>
      </div>
      ${img}
      <div class="pc-bottom">
        <div class="pc-title">${escapeHtml(p.title)}</div>
        <div class="pc-game"><i class="fas fa-gamepad"></i> ${escapeHtml(p.game || 'Universal')}</div>
      </div>
    </a>`;
  }).join('');

  renderRecent(posts);
  renderTagCloud(posts);
}

function renderRecent(posts) {
  const el = document.getElementById('recentList');
  if (!el) return;
  const recent = posts.slice(0, 5);
  el.innerHTML = recent.length
    ? recent.map(p => `<a class="recent-item" href="script.html?id=${p.id}"><span class="ri-title">${escapeHtml(p.title)}</span><span class="ri-game">${escapeHtml(p.game||'Universal')}</span></a>`).join('')
    : '<p style="color:#555;font-size:.8rem">Nenhum script ainda.</p>';
}

function renderTagCloud(posts) {
  const el = document.getElementById('tagCloud');
  if (!el) return;
  const map = {};
  posts.forEach(p => (p.tags||[]).forEach(t => { map[t] = (map[t]||0)+1; }));
  const tags = Object.entries(map).sort((a,b)=>b[1]-a[1]).slice(0,12);
  el.innerHTML = tags.length
    ? tags.map(([t]) => `<span class="tag-chip" onclick="document.getElementById('searchInput').value='${escapeHtml(t)}';renderFeed()">${escapeHtml(t)}</span>`).join('')
    : '<p style="color:#555;font-size:.8rem">Sem tags ainda.</p>';
}

function updateStats() {
  const posts = getPosts();
  const users = getUsers();
  const visits = parseInt(localStorage.getItem('visits')||'0') + 1;
  localStorage.setItem('visits', visits);

  ['statScripts','sideStatScripts'].forEach(id => { const e=document.getElementById(id); if(e) e.textContent=posts.length; });
  ['statUsers','sideStatUsers'].forEach(id => { const e=document.getElementById(id); if(e) e.textContent=users.length; });
  ['statVisits','sideStatVisits'].forEach(id => { const e=document.getElementById(id); if(e) e.textContent=visits; });
}

// ---- Navbar ----
function initNavbar() {
  const session  = getSession();
  const guest    = document.getElementById('nav-guest');
  const logged   = document.getElementById('nav-logged');
  const navName  = document.getElementById('navName');
  const navAvatar= document.getElementById('navAvatar');

  if (!guest || !logged) return;

  if (session) {
    guest.style.display  = 'none';
    logged.style.display = 'flex';
    if (navName) navName.textContent = session;
    if (navAvatar) {
      const users = getUsers();
      const user  = users.find(u => u.username === session);
      if (user?.avatarURL) { navAvatar.innerHTML = `<img src="${escapeHtml(user.avatarURL)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover">`; }
      else { navAvatar.textContent = session.charAt(0).toUpperCase(); navAvatar.style.background = user?.avatarColor || '#7c6af7'; }
    }
  } else {
    guest.style.display  = 'flex';
    logged.style.display = 'none';
  }

  // dropdown toggle
  const wrap = document.getElementById('navAvatarWrap');
  const drop = document.getElementById('navDropdown');
  if (wrap && drop) {
    wrap.addEventListener('click', e => { e.stopPropagation(); drop.classList.toggle('open'); });
    document.addEventListener('click', () => drop.classList.remove('open'));
  }

  // fechar modal clicando fora
  const modal = document.getElementById('postModal');
  if (modal) modal.addEventListener('click', e => { if (e.target === modal) closePostModal(); });
}

// ---- Particles ----
function initParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, dots = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function spawn() {
    dots = Array.from({length: 60}, () => ({
      x: Math.random()*W, y: Math.random()*H,
      vx: (Math.random()-.5)*.3, vy: (Math.random()-.5)*.3,
      r: Math.random()*1.5+.5, a: Math.random()*.5+.1
    }));
  }

  function draw() {
    ctx.clearRect(0,0,W,H);
    dots.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if (d.x<0||d.x>W) d.vx*=-1;
      if (d.y<0||d.y>H) d.vy*=-1;
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(124,106,247,${d.a})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }

  resize(); spawn(); draw();
  window.addEventListener('resize', () => { resize(); spawn(); });
}

// ---- Init ----
(function init() {
  initOwner();
  initNavbar();
  initParticles();
  renderFeed();
  updateStats();
})();
