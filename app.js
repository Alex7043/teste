// ---- Helpers ----
function getUsers() { return JSON.parse(localStorage.getItem('users') || '[]'); }
function saveUsers(u) { localStorage.setItem('users', JSON.stringify(u)); }
function getPosts() { return JSON.parse(localStorage.getItem('posts') || '[]'); }
function savePosts(p) { localStorage.setItem('posts', JSON.stringify(p)); }
function getComments() { return JSON.parse(localStorage.getItem('comments') || '[]'); }
function saveComments(c) { localStorage.setItem('comments', JSON.stringify(c)); }
function getSession() { return localStorage.getItem('session'); }
function setSession(u) { localStorage.setItem('session', u); }
function clearSession() { localStorage.removeItem('session'); }

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showNotification(msg, type = 'success') {
  let container = document.getElementById('notif-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'notif-container';
    document.body.appendChild(container);
  }
  const notif = document.createElement('div');
  notif.className = `notif-item ${type} animate-fade-up`;
  const icon = type === 'error' ? 'fa-circle-xmark' : 'fa-circle-check';
  notif.innerHTML = `<i class="fas ${icon}"></i> <span>${msg}</span>`;
  container.appendChild(notif);
  setTimeout(() => {
    notif.style.opacity = '0';
    notif.style.transform = 'translate(0, -20px)';
    setTimeout(() => notif.remove(), 500);
  }, 4000);
}

function timeAgo(ts) {
  if (!ts) return '';
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return diff + 's atrás';
  if (diff < 3600) return Math.floor(diff / 60) + 'min atrás';
  if (diff < 86400) return Math.floor(diff / 3600) + 'h atrás';
  return Math.floor(diff / 86400) + 'd atrás';
}

// Helper para detectar se o ícone é uma imagem/URL
function isImage(str) {
  if (!str) return false;
  const s = str.toLowerCase().trim();
  return s.startsWith('http') || s.startsWith('data:image') || s.includes('discordapp.com') || s.includes('.webp') || s.includes('.png') || s.includes('.gif');
}

// ---- Badges Helper ----
function renderBadgesHtml(user) {
  if (!user) return '';
  let html = '<div class="badges-row">';
  const uid = user.id || '';
  
  if (uid === "937937001112555531") {
    html += `
      <div class="badge-item">
        <span class="owner-glow">⚡</span>
        <div class="badge-tooltip"><strong>Owner & Founder</strong><p>Dono e desenvolvedor supremo.</p></div>
      </div>`;
  }
  if (user.isVerified) {
    html += `
      <div class="badge-item" style="color:#1e90ff">
        <i class="fas fa-check-circle"></i>
        <div class="badge-tooltip"><strong>Verificado</strong><p>Usuário de confiança da comunidade.</p></div>
      </div>`;
  }
  if (user.discordUser) {
    html += `
      <div class="badge-item" style="color:#5865F2">
        <i class="fab fa-discord"></i>
        <div class="badge-tooltip"><strong>Discord</strong><p>Membro do servidor oficial.</p></div>
      </div>`;
  }
  if (user.badges) {
    user.badges.forEach(b => {
      const content = isImage(b.icon) ? `<img src="${escapeHtml(b.icon)}" class="admin-badge-icon">` : b.icon;
      html += `
        <div class="badge-item">
          ${content}
          <div class="badge-tooltip"><strong>${escapeHtml(b.name || 'Badge Oficial')}</strong><p>${escapeHtml(b.desc)}</p></div>
        </div>`;
    });
  }
  html += '</div>';
  return html;
}

// ---- Roblox API Helper ----
async function fetchRobloxGame(placeId) {
  try {
    // Usando proxy para evitar CORS (comum em sites estáticos)
    const proxy = "https://api.allorigins.win/get?url=";
    const apiUrl = encodeURIComponent(`https://games.roblox.com/v1/games/multiget-place-details?placeIds=${placeId}`);
    const response = await fetch(proxy + apiUrl);
    const data = await response.json();
    const details = JSON.parse(data.contents)[0];
    
    const thumbUrl = `https://thumbnails.roblox.com/v1/places/gameicons?placeIds=${placeId}&size=150x150&format=Png&isCircular=false`;
    return { name: details.name, image: thumbUrl };
  } catch (e) { return null; }
}

// ---- Force Owner ID ----
function fixOwnerId() {
  let users = getUsers();
  let alex = users.find(u => u.username.toLowerCase() === 'alex');
  if (alex && alex.id !== "937937001112555531") {
    alex.id = "937937001112555531";
    alex.canPost = true;
    alex.isBanned = false;
    saveUsers(users);
  }
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

  users.push({ 
    id: Math.floor(Math.random() * 1000000).toString(), 
    username, 
    password,
    badges: [], // Array de {icon: '', desc: ''}
    isBanned: false,
    canPost: true,
    warns: 0,
    timeoutUntil: 0
  });
  saveUsers(users);
  setSession(username);
  window.location.href = './';
}

function login() {
  const username = document.getElementById('username').value.trim();
  const password = document.getElementById('password').value;
  const error    = document.getElementById('error');

  const users = getUsers();
  const user  = users.find(u => u.username === username && u.password === password);
  if (!user) return (error.textContent = 'Usuário ou senha incorretos.');

  setSession(username);
  window.location.href = './';
}

function verifyUser(userId) {
  const session = getSession();
  if (session !== 'Alex') return;
  let users = getUsers();
  const idx = users.findIndex(u => u.id === userId);
  if (idx !== -1) {
    users[idx].isVerified = !users[idx].isVerified;
    saveUsers(users);
    showNotification(users[idx].isVerified ? "Usuário Verificado!" : "Verificação removida.");
    location.reload();
  }
}

function logout() {
  clearSession();
  window.location.href = './';
}

function togglePass(id, btn) {
  const input = document.getElementById(id);
  if (!input) return;
  const show = input.type === 'password';
  input.type = show ? 'text' : 'password';
  btn.querySelector('i').className = show ? 'fas fa-eye-slash' : 'fas fa-eye';
}

// ---- Social Systems ----
function toggleFollow(targetUsername) {
  const session = getSession();
  if (!session) return showNotification("Faça login para seguir!", "error");
  if (session === targetUsername) return;

  let users = getUsers();
  let me = users.find(u => u.username === session);
  if (!me.following) me.following = [];

  const idx = me.following.indexOf(targetUsername);
  if (idx > -1) {
    me.following.splice(idx, 1);
    showNotification(`Você deixou de seguir ${targetUsername}`);
  } else {
    me.following.push(targetUsername);
    showNotification(`Seguindo ${targetUsername}!`);
  }
  saveUsers(users);
  location.reload();
}

function getChatMessages() { return JSON.parse(localStorage.getItem('chat_msgs') || '[]'); }
function saveChatMessages(m) { localStorage.setItem('chat_msgs', JSON.stringify(m)); }

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

  const session = getSession();
  const user = getUsers().find(u => u.username === session);

  if (!title || !code) return showNotification('Preencha o título e o script.', 'error');
  if (user?.isBanned) return showNotification('Sua conta está banida.', 'error');
  if (!user?.canPost) return showNotification('Seu acesso para publicar scripts foi revogado.', 'error');
  if (user?.timeoutUntil > Date.now()) return showNotification('Você está em timeout.', 'error');

  const posts = getPosts();
  posts.unshift({
    id: Date.now(),
    title, code, game, image, desc, tags,
    author: getSession(),
    date: new Date().toLocaleDateString('pt-BR'),
    ts: Date.now(),
    isVerifiedPost: user.isVerified || false,
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

let currentFilter = 'all';
function setFilter(f, btn) {
  currentFilter = f;
  document.querySelectorAll('.ftab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderFeed();
}

function renderFeed() {
  const grid = document.getElementById('scriptGrid');
  if (!grid) return;

  let posts = getPosts();
  const users = getUsers();
  const q = document.getElementById('searchInput')?.value.toLowerCase() || '';

  if (q) posts = posts.filter(p => (p.title + (p.game||'') + (p.author||'')).toLowerCase().includes(q));
  if (currentFilter === 'verified') posts = posts.filter(p => p.isVerifiedPost);
  if (currentFilter === 'recent') posts = posts.slice(0, 10);

  if (posts.length === 0) {
    grid.innerHTML = '<p class="feed-empty">Nenhum script encontrado. Seja o primeiro a postar!</p>';
    return;
  }

  grid.innerHTML = posts.map(p => {
    const img = p.image
      ? `<div class="pc-img"><img src="${escapeHtml(p.image)}" alt="cover" onerror="this.parentElement.classList.add('pc-img-err')"/></div>`
      : `<div class="pc-img pc-img-placeholder"><i class="fas fa-code"></i></div>`;
    
    const authorUser = users.find(u => u.username === p.author);
    const badges = renderBadgesHtml(authorUser);

    return `
    <a class="post-card" href="script?id=${p.id}">
      <div class="pc-top">
        <span class="pc-time"><i class="fas fa-clock"></i> ${timeAgo(p.ts) || p.date}</span>
        <div class="pc-author-wrap">
          <span class="pc-author">@${escapeHtml(p.author || 'anon')}</span>
          ${badges}
        </div>
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
    ? recent.map(p => `<a class="recent-item" href="script?id=${p.id}"><span class="ri-title">${escapeHtml(p.title)}</span><span class="ri-game">${escapeHtml(p.game||'Universal')}</span></a>`).join('')
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
  const navAdmin = document.getElementById('navAdminBtn');

  if (!guest || !logged) return;

  if (session) {
    guest.style.display  = 'none';
    logged.style.display = 'flex';
    if (navName) navName.textContent = session;
    if (navAvatar) {
      const users = getUsers();
      const user  = users.find(u => u.username === session);

      if (navAdmin && user?.id === "937937001112555531") {
        navAdmin.style.display = 'flex';
      }
      
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
  fixOwnerId();
  initNavbar();
  initParticles();
  renderFeed();
  updateStats();
})();
