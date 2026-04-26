// ---- Helpers ----
function getUsers() { return JSON.parse(localStorage.getItem('users') || '[]'); }
function saveUsers(u) { localStorage.setItem('users', JSON.stringify(u)); }
function getPosts() { return JSON.parse(localStorage.getItem('posts') || '[]'); }
function savePosts(p) { localStorage.setItem('posts', JSON.stringify(p)); }
function getSession() { return localStorage.getItem('session'); }
function setSession(u) { localStorage.setItem('session', u); }
function clearSession() { localStorage.removeItem('session'); }

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
  window.location.reload();
}

// ---- Posts ----
function submitPost() {
  const title = document.getElementById('post-title').value.trim();
  const code  = document.getElementById('post-code').value.trim();
  if (!title || !code) return alert('Preencha o título e o script.');

  const posts = getPosts();
  posts.unshift({
    id: Date.now(),
    title,
    code,
    author: getSession(),
    date: new Date().toLocaleDateString('pt-BR')
  });
  savePosts(posts);
  document.getElementById('post-title').value = '';
  document.getElementById('post-code').value  = '';
  renderFeed();
}

function copyScript(id) {
  const posts = getPosts();
  const post  = posts.find(p => p.id === id);
  if (!post) return;
  navigator.clipboard.writeText(post.code).then(() => {
    const btn = document.getElementById('copy-' + id);
    btn.textContent = '✅ Copiado!';
    btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '📋 Copiar Script'; btn.classList.remove('copied'); }, 2000);
  });
}

function renderFeed() {
  const feed  = document.getElementById('feed');
  if (!feed) return;
  const posts = getPosts();

  if (posts.length === 0) {
    feed.innerHTML = '<p style="color:#555">Nenhum post ainda. Seja o primeiro!</p>';
    return;
  }

  feed.innerHTML = posts.map(p => `
    <div class="post-card">
      <div class="post-header">
        <div>
          <div class="post-title">${escapeHtml(p.title)}</div>
          <div class="post-author">@${escapeHtml(p.author)}</div>
        </div>
        <div class="post-date">${p.date}</div>
      </div>
      <pre class="post-code">${escapeHtml(p.code)}</pre>
      <button class="copy-btn" id="copy-${p.id}" onclick="copyScript(${p.id})">📋 Copiar Script</button>
    </div>
  `).join('');
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ---- Init ----
(function init() {
  const session    = getSession();
  const navAuth    = document.getElementById('nav-auth');
  const navUser    = document.getElementById('nav-user');
  const navName    = document.getElementById('nav-username');
  const postForm   = document.getElementById('post-form');

  if (navAuth && navUser) {
    if (session) {
      navAuth.style.display = 'none';
      navUser.style.display = 'flex';
      if (navName) navName.textContent = session;
      if (postForm) postForm.style.display = 'flex';
    } else {
      navAuth.style.display = 'flex';
      navUser.style.display = 'none';
    }
  }

  renderFeed();
})();
