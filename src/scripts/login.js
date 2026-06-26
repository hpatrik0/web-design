// login.js — self-contained auth modal with validation + popup fallback

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js';
import { getDatabase, ref, child, get } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js';

// https://www.gstatic.com/firebasejs/[VERSION]/[SERVICE-NAME].js
// version is 12.14.0

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
	apiKey: "AIzaSyBhA28wmAf5uuhWayF-Y3K4uekfMwKjdCA",
	authDomain: "web-design-67a87.firebaseapp.com",
	databaseURL: "https://web-design-67a87-default-rtdb.europe-west1.firebasedatabase.app",
	projectId: "web-design-67a87",
	storageBucket: "web-design-67a87.firebasestorage.app",
	messagingSenderId: "962302505370",
	appId: "1:962302505370:web:fd0b579c86487f94f64a23",
	measurementId: "G-V9WDR07EBP"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const snapshot = await get(ref(db, `korisnici/`));
const usersDB = snapshot.val();

// login.js — self-contained auth modal + registration/login simulation + navbar integration

(function () {
  // ==================== INLINE CSS ====================
  const css = `
    #authModal {
      display: none;
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5);
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    #authModal .modal {
      background: #fff;
      padding: 20px;
      border-radius: 8px;
      max-width: 350px;
      width: 90%;
    }
    #authModal .tabs {
      display: flex;
      margin-bottom: 20px;
      border-bottom: 2px solid #ccc;
    }
    #authModal .tabs button {
      flex: 1;
      padding: 10px;
      border: none;
      background: none;
      font-size: 0.95rem;
      cursor: pointer;
    }
    #authModal .tabs button.active {
      border-bottom: 2px solid #007bff;
      color: #007bff;
      font-weight: bold;
    }
    #authModal form {
      display: none;
    }
    #authModal form.active {
      display: block;
    }
    #authModal input {
      display: block;
      width: 100%;
      margin-bottom: 10px;
      padding: 8px;
      box-sizing: border-box;
      border: 1px solid #bdc3c7;
      border-radius: 4px;
      font-size: 0.9rem;
    }
    #authModal button[type="submit"] {
      display: block;
      width: 100%;
      padding: 10px;
      background: #3498db;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-weight: 500;
    }

    /* Popup styles (fallback) */
    .popup-overlay {
      display: none;
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.5);
      justify-content: center;
      align-items: center;
      z-index: 2000;
    }
    .popup-dialog {
      background: white;
      padding: 20px;
      border-radius: 8px;
      max-width: 360px;
      text-align: center;
    }
    .popup-dialog p { margin-bottom: 20px; }
    .popup-actions button {
      padding: 8px 20px;
      border-radius: 4px;
      border: 1px solid #bdc3c7;
      cursor: pointer;
      font-weight: 500;
    }
    .popup-ok {
      background: #3498db;
      color: white;
      border-color: #2980b9;
      margin: 0 5px;
    }
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ==================== POPUP HELPER ====================
  let showAlert;
  if (typeof window.showAlert === 'function') {
    showAlert = window.showAlert;
  } else {
    const popupHTML = `
      <div class="popup-overlay" id="popupOverlay">
        <div class="popup-dialog">
          <p id="popupMsg"></p>
          <div class="popup-actions" id="popupActions"></div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', popupHTML);
    const popupOverlay = document.getElementById('popupOverlay');
    const popupMsg = document.getElementById('popupMsg');
    const popupActions = document.getElementById('popupActions');
    const closePopup = () => { popupOverlay.style.display = 'none'; };
    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) closePopup();
    });
    showAlert = (msg) => {
      popupMsg.textContent = msg;
      popupActions.innerHTML = '<button class="popup-ok" id="popupOk">У реду</button>';
      popupOverlay.style.display = 'flex';
      document.getElementById('popupOk').addEventListener('click', closePopup);
    };
  }

  // ==================== STORAGE HELPERS ====================
  const getLocalUsers = () => JSON.parse(localStorage.getItem('bookstore_users') || '{}');
  const saveLocalUsers = (users) => localStorage.setItem('bookstore_users', JSON.stringify(users));
  const getCurrentUser = () => JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  const setCurrentUser = (user) => sessionStorage.setItem('currentUser', JSON.stringify(user));
  const clearCurrentUser = () => sessionStorage.removeItem('currentUser');

  // ==================== USER LOOKUP ====================
  function findUserByEmail(email) {
    const localUsers = getLocalUsers();
    if (localUsers[email]) return { ...localUsers[email], source: 'local' };
    for (const key of Object.keys(usersDB)) {
      const dbUser = usersDB[key];
      if (dbUser.email.toLowerCase() === email.toLowerCase()) {
        return { ...dbUser, source: 'db' };
      }
    }
    return null;
  }
  const isEmailTaken = (email) => !!findUserByEmail(email);

  // ==================== UI UPDATE (navbar integration) ====================
  function updateNavbarButton() {
    const loginNav = document.getElementById('loginNav');
    const userNav = document.getElementById('userNav');
    const userLink = document.getElementById('userLink');
    const user = getCurrentUser();

    if (user) {
      if (loginNav) loginNav.style.display = 'none';
      if (userNav) userNav.style.display = 'flex';   // or 'block' depending on your CSS
      if (userLink) {
        userLink.textContent = user.ime;
        userLink.href = 'korisnik.html';
      }
    } else {
      if (loginNav) loginNav.style.display = 'block';
      if (userNav) userNav.style.display = 'none';
    }
  }

  function logout() {
    clearCurrentUser();
    updateNavbarButton();
    showAlert('Odjavljeni ste.');
  }

  // ==================== INJECT AUTH MODAL ====================
  const authHTML = `
    <div class="modal-overlay" id="authModal">
      <div class="modal">
        <div class="tabs">
          <button class="active" id="auth-loginTab">Prijava</button>
          <button id="auth-registerTab">Registracija</button>
        </div>
        <form id="auth-loginForm" class="active" novalidate>
          <input type="email" id="auth-loginEmail" placeholder="Email" required>
          <input type="password" id="auth-loginPassword" placeholder="Lozinka" required minlength="6">
          <button type="submit">Prijavi se</button>
        </form>
        <form id="auth-registerForm" novalidate>
          <input type="text" id="auth-regIme" placeholder="Ime" required>
          <input type="text" id="auth-regPrezime" placeholder="Prezime" required>
          <input type="text" id="auth-regUlica" placeholder="Ulica" required>
          <input type="email" id="auth-regEmail" placeholder="Email" required>
          <input type="password" id="auth-regPassword" placeholder="Lozinka" required minlength="6">
          <input type="tel" id="auth-regTelefon" placeholder="Telefon (+381...)" required>
          <button type="submit">Registruj se</button>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', authHTML);

  // ==================== DOM REFERENCES (scoped to the injected modal) ====================
  const authModal = document.getElementById('authModal');
  const loginTab = authModal.querySelector('#auth-loginTab');
  const registerTab = authModal.querySelector('#auth-registerTab');
  const loginForm = authModal.querySelector('#auth-loginForm');
  const registerForm = authModal.querySelector('#auth-registerForm');

  // Inputs stored once, never queried again
  const loginEmail = authModal.querySelector('#auth-loginEmail');
  const loginPassword = authModal.querySelector('#auth-loginPassword');
  const regIme = authModal.querySelector('#auth-regIme');
  const regPrezime = authModal.querySelector('#auth-regPrezime');
  const regUlica = authModal.querySelector('#auth-regUlica');
  const regEmail = authModal.querySelector('#auth-regEmail');
  const regPassword = authModal.querySelector('#auth-regPassword');
  const regTelefon = authModal.querySelector('#auth-regTelefon');

  // ==================== OPEN MODAL (delegated) ====================
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('#openAuthModal');
    if (trigger) {
      e.preventDefault();
      if (getCurrentUser()) {
        logout();
        return;
      }
      // Reset to login tab
      loginTab.classList.add('active');
      registerTab.classList.remove('active');
      loginForm.classList.add('active');
      registerForm.classList.remove('active');
      loginForm.style.display = 'block';
      registerForm.style.display = 'none';
      authModal.style.display = 'flex';
    }
  });

  // ==================== LOGOUT BUTTON (delegated) ====================
  document.addEventListener('click', (e) => {
    if (e.target.closest('#logoutBtn')) {
      e.preventDefault();
      logout();
    }
  });

  // ==================== CLOSE ON OVERLAY CLICK ====================
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) authModal.style.display = 'none';
  });

  // ==================== TAB SWITCHING ====================
  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
    loginForm.style.display = 'block';
    registerForm.style.display = 'none';
  });
  registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
    registerForm.style.display = 'block';
    loginForm.style.display = 'none';
  });

  // ==================== VALIDATION HELPERS ====================
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidPhone = (phone) => /^\+381\d{6,12}$/.test(phone.replace(/[\s\-]/g, ''));

  // ==================== LOGIN HANDLER ====================
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = loginEmail.value.trim();
    const password = loginPassword.value;

    if (!email || !password) return showAlert('Popunite sva polja.');
    if (!isValidEmail(email)) return showAlert('Neispravna email adresa.');

    const user = findUserByEmail(email);
    if (!user) return showAlert('Korisnik ne postoji.');

    const storedPassword = user.lozinka || user.password;
    if (storedPassword !== password) return showAlert('Pogrešna lozinka.');

    setCurrentUser({ email, ime: user.ime, prezime: user.prezime });
    updateNavbarButton();
    showAlert(`Dobrodošli, ${user.ime}!`);
    authModal.style.display = 'none';
    loginForm.reset();
  });

  // ==================== REGISTER HANDLER ====================
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const ime = regIme.value.trim();
    const prezime = regPrezime.value.trim();
    const ulica = regUlica.value.trim();
    const email = regEmail.value.trim().toLowerCase();
    const password = regPassword.value;
    const telefon = regTelefon.value.trim();

    if (!ime || !prezime || !ulica || !email || !password || !telefon)
      return showAlert('Popunite sva polja.');
    if (!isValidEmail(email)) return showAlert('Neispravna email adresa.');
    if (password.length < 6) return showAlert('Lozinka mora imati najmanje 6 karaktera.');
    if (!isValidPhone(telefon)) return showAlert('Neispravan broj telefona. Format: +381 64 1234567');
    if (isEmailTaken(email)) return showAlert('Korisnik sa ovim email-om već postoji.');

    const localUsers = getLocalUsers();
    localUsers[email] = { password, ime, prezime, ulica, telefon };
    saveLocalUsers(localUsers);

    setCurrentUser({ email, ime, prezime });
    updateNavbarButton();
    showAlert(`Registracija uspešna. Dobrodošli, ${ime}!`);
    authModal.style.display = 'none';
    registerForm.reset();
  });

  // ==================== INITIAL SETUP ====================
  updateNavbarButton();
})();