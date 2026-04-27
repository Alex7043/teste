# ⚡ ScriptDrop — Scripts Premium

<div align="center">
  <img src="favicon.svg" width="100" height="100" alt="Logo ScriptDrop">
  <p><i>A plataforma definitiva para compartilhar e descobrir scripts de alta qualidade.</i></p>

  ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
  ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
  ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
  ![Discord](https://img.shields.io/badge/Discord-5865F2?style=for-the-badge&logo=discord&logoColor=white)
</div>

---

## 📸 Visual do Projeto

Aqui estão algumas prévias da interface moderna e responsiva do ScriptDrop:

### 🏠 Landing Page (Home)
> Design limpo com efeito de partículas e sistema de busca inteligente.
<img src="https://via.placeholder.com/800x400/0f0f0f/7c6af7?text=Landing+Page+Screenshot" width="100%" alt="Home Screen">

### 👤 Perfil Imersivo
> Banners em vídeo/GIF, Player de Música integrado e Badges Oficiais estilo Discord.
<img src="https://via.placeholder.com/800x400/050505/1e90ff?text=User+Profile+with+Video+Banner" width="100%" alt="Profile Screen">

### 🛠️ Painel Owner (Exclusivo)
> Controle total sobre usuários: Ban, Warn, Verificação e Atribuição de Badges com arquivos locais.
<img src="https://via.placeholder.com/800x400/0a0a0a/ffd700?text=Admin+Dashboard+Control+Panel" width="100%" alt="Admin Panel">

---

## ✨ Funcionalidades Principais

- **🌐 URLs Amigáveis**: Perfil acessível via `site.com/nome-do-usuario`.
- **🎥 Banner Full-Page**: Suporte para vídeos MP4, GIFs e imagens em alta definição que cobrem todo o fundo do perfil.
- **🎵 Profile Music**: Cada usuário pode subir sua música favorita (.mp3) diretamente do computador.
- **🔒 Segurança de Elite**: Sistema de notificações (Toasts) customizadas, sem pop-ups chatos do navegador.
- **🎮 Integração Roblox**: Publicação automática puxando Nome e Ícone do jogo apenas pelo **Place ID**.
- **💬 Sistema Social**: Seguir usuários, comentários em tempo real e chat privado para seguidores mútuos.
- **🛡️ Moderação Avançada**: 
  - Sistema de avisos (Warns) com contador.
  - Timeout de 24h e Banimento Global.
  - Verificação de usuários confiáveis (Selo ✅).

---

## 🤖 Bot de Integração (Discord)

O site possui um bot dedicado para gerenciar comandos via prefixo `$`:

| Comando | Descrição | Permissão |
| :--- | :--- | :--- |
| `$help` | Lista todos os comandos disponíveis | Todos |
| `$owner [id]` | Transforma um usuário em Owner | Alex (ID 937937001112555531) |
| `$darbadges [id] [nome]` | Atribui uma badge oficial a um usuário | Alex (ID 937937001112555531) |
| `$uid [nome]` | Consulta o ID de um usuário no site | Admin |

---

## 🚀 Como Executar o Projeto

1. Clone o repositório:
   ```bash
   git clone https://github.com/alex7043/teste.git
   ```
2. Abra o arquivo `index.html` em qualquer navegador moderno.
3. Para o bot, entre na pasta `Bot Discord My Serve`:
   ```bash
   npm install
   node index.js
   ```

---

## 👨‍💻 Créditos

- **Desenvolvedor:** Alex
- **Plataforma:** ScriptDrop
- **Tecnologias:** Vanilla JS, CSS Grid/Flexbox, Discord.js API, Roblox Web API.

<div align="center">
  <p>Feito com 💜 por Alex</p>
</div>