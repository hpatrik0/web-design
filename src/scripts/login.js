// login.js — self-contained auth modal with validation + popup fallback

(function () {
  // ==================== INLINE CSS ====================
  const css = `
    /* Auth modal overlay (identical to your existing modals) */
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

    /* Popup styles (only injected if needed) */
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
    .popup-dialog p {
      margin-bottom: 20px;
    }
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

  // ==================== POPUP HELPER (reuses existing or creates new) ====================
  let showAlert, showConfirm;
  if (typeof window.showAlert === 'function' && typeof window.showConfirm === 'function') {
    // Use the existing popup system from the admin page
    showAlert = window.showAlert;
    showConfirm = window.showConfirm;
  } else {
    // Create our own popup modal
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

    function closePopup() { popupOverlay.style.display = 'none'; }
    popupOverlay.addEventListener('click', (e) => {
      if (e.target === popupOverlay) closePopup();
    });

    showAlert = (msg) => {
      popupMsg.textContent = msg;
      popupActions.innerHTML = '<button class="popup-ok" id="popupOk">У реду</button>';
      popupOverlay.style.display = 'flex';
      document.getElementById('popupOk').addEventListener('click', closePopup);
    };

    showConfirm = (msg, onOk) => {
      popupMsg.textContent = msg;
      popupActions.innerHTML = `
        <button class="popup-ok" id="popupOk">Потврди</button>
        <button id="popupCancel">Одустани</button>
      `;
      popupOverlay.style.display = 'flex';
      document.getElementById('popupOk').addEventListener('click', () => {
        closePopup();
        onOk();
      });
      document.getElementById('popupCancel').addEventListener('click', closePopup);
    };
  }

  // ==================== VALIDATION HELPERS ====================
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  function isValidPhone(phone) {
    const cleaned = phone.replace(/[\s\-]/g, '');
    return /^\+381\d{6,12}$/.test(cleaned);
  }

  // ==================== BUILD AUTH MODAL HTML ====================
  const authHTML = `
    <div class="modal-overlay" id="authModal">
      <div class="modal">
        <div class="tabs">
          <button class="active" id="loginTab">Prijava</button>
          <button id="registerTab">Registracija</button>
        </div>
        <form id="loginForm" class="active" novalidate>
          <input type="email" id="loginEmail" placeholder="Email" required>
          <input type="password" id="loginPassword" placeholder="Lozinka" required minlength="6">
          <button type="submit">Prijavi se</button>
        </form>
        <form id="registerForm" novalidate>
          <input type="text" id="regIme" placeholder="Ime" required>
          <input type="text" id="regPrezime" placeholder="Prezime" required>
          <input type="text" id="regUlica" placeholder="Ulica" required>
          <input type="email" id="regEmail" placeholder="Email" required>
          <input type="password" id="regPassword" placeholder="Lozinka" required minlength="6">
          <input type="tel" id="regTelefon" placeholder="Telefon (+381...)" required>
          <button type="submit">Registruj se</button>
        </form>
      </div>
    </div>
  `;
  // Append to body
  document.body.insertAdjacentHTML('beforeend', authHTML);

  // ==================== DOM REFERENCES ====================
  const authModal = document.getElementById('authModal');
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');

  // ==================== OPEN MODAL (delegated) ====================
    document.addEventListener('click', (e) => {
    if (e.target.closest('#openAuthModal')) {
        e.preventDefault();

        // Reset to login tab every time the modal opens
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        loginForm.style.display = 'block';          // force visible
        registerForm.style.display = 'none';        // force hidden

        authModal.style.display = 'flex';
    }
    });

  // ==================== CLOSE ON OVERLAY CLICK ====================
  authModal.addEventListener('click', (e) => {
    if (e.target === authModal) {
      authModal.style.display = 'none';
    }
  });

  // ==================== TAB SWITCHING ====================
  loginTab.addEventListener('click', () => {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.classList.add('active');
    registerForm.classList.remove('active');
  });
  registerTab.addEventListener('click', () => {
    registerTab.classList.add('active');
    loginTab.classList.remove('active');
    registerForm.classList.add('active');
    loginForm.classList.remove('active');
  });

  // ==================== LOGIN VALIDATION ====================
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
      showAlert('Popunite sva polja.');
      return;
    }
    if (!isValidEmail(email)) {
      showAlert('Neispravna email adresa.');
      return;
    }
    if (password.length < 6) {
      showAlert('Lozinka mora imati najmanje 6 karaktera.');
      return;
    }
    // Placeholder – success
    showAlert('Uspešno ste se prijavili.');
    authModal.style.display = 'none';
    loginForm.reset();
  });

  // ==================== REGISTER VALIDATION ====================
  registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const ime = document.getElementById('regIme').value.trim();
    const prezime = document.getElementById('regPrezime').value.trim();
    const ulica = document.getElementById('regUlica').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const telefon = document.getElementById('regTelefon').value.trim();

    if (!ime || !prezime || !ulica || !email || !password || !telefon) {
      showAlert('Popunite sva polja.');
      return;
    }
    if (!isValidEmail(email)) {
      showAlert('Neispravna email adresa.');
      return;
    }
    if (password.length < 6) {
      showAlert('Lozinka mora imati najmanje 6 karaktera.');
      return;
    }
    if (!isValidPhone(telefon)) {
      showAlert('Neispravan broj telefona. Format: +381 64 1234567');
      return;
    }
    // Placeholder – success
    showAlert('Registracija uspešna.');
    authModal.style.display = 'none';
    registerForm.reset();
  });
})();