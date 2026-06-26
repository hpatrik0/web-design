// navbar.js – renders the admin navbar with login/logout + user link

(function () {
  const navbarHTML = `
    <nav class="navbar">
      <ul>
        <li><a href="katalogKnjiga.html">Почетна</a></li>
        <li><a href="autori.html">Аутори</a></li>
        <li><a href="autor_admin.html">Админ: Аутори</a></li>
        <li><a href="adminKnjige.html">Админ: Књиге</a></li>

        <!-- Logged out state -->
        <li id="loginNav" style="margin-left: auto;">
          <button id="openAuthModal" class="nav-link-btn">Prijava</button>
        </li>

        <!-- Logged in state (hidden by default) -->
        <li id="userNav" style="margin-left: auto; display: none;">
          <a id="userLink" href="korisnik.html" class="nav-link-btn"></a>
          <button id="logoutBtn" class="nav-link-btn" style="margin-left: 15px;">Odjavi se</button>
        </li>
      </ul>
    </nav>
  `;

  const container = document.getElementById('navbar');
  if (container) {
    container.innerHTML = navbarHTML;
  }
})();