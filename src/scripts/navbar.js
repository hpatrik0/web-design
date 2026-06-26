// navbar.js – renders the admin navbar into a placeholder with id="navbar"

(function () {
  const navbarHTML = `
    <nav class="navbar">
      <ul>
        <li><a href="katalogKnjiga.html">Почетна</a></li>
        <li><a href="autori.html">Аутори</a></li>
        <li><a href="autor_admin.html">Админ: Аутори</a></li>
        <li><a href="adminKnjige.html">Админ: Књиге</a></li>
        <li style="margin-left: auto;">
          <button id="openAuthModal" class="nav-link-btn">Prijava</button>
        </li>
      </ul>
    </nav>
  `;

  // Find the placeholder and insert the navbar
  const container = document.getElementById('navbar');
  if (container) {
    container.innerHTML = navbarHTML;
  }
})();