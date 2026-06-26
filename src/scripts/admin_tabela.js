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

const snapshot = await get(ref(db, `autori/`));
const authorsData = snapshot.val();


// ===================== CONSTANTS =====================
const statusLabels = {
  'Активан':   'Активан',
  'Преминуо':  'Преминуо',
  'У пензији': 'У пензији'
};

const statusColors = {
  'Активан':   { bg: '#d4edda', text: '#155724' },
  'Преминуо':  { bg: '#f8d7da', text: '#721c24' },
  'У пензији': { bg: '#fff3cd', text: '#856404' }
};

// ===================== HELPERS =====================
function isValidPhone(phone) {
  // Allows +381 followed by 6-12 digits, spaces/hyphens allowed
  const clean = phone.replace(/[\s\-]/g, '');
  return /^\+381\d{6,12}$/.test(clean);
}

function formatDate(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  return d.toLocaleDateString('sr', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatPhone(raw) {
  const cleaned = raw.replace(/\s+/g, '');
  if (cleaned.startsWith('+381')) {
    const m = cleaned.match(/^(\+381)(\d{2})(\d{3})(\d{3,4})$/);
    if (m) return `${m[1]} ${m[2]} ${m[3]} ${m[4]}`;
  }
  return raw;
}

function formatSales(num) {
  // Guard against undefined / non-number
  if (num == null || isNaN(num)) return '0';
  return Number(num).toLocaleString('sr');
}

function applyStatusBadge(element, status) {
  element.textContent = statusLabels[status] || status;
  const colors = statusColors[status] || { bg: '#e0e0e0', text: '#333' };
  element.style.backgroundColor = colors.bg;
  element.style.color = colors.text;
}

// ===================== DOM ELEMENTS =====================
const tbody = document.querySelector('#admin_table tbody');
const template = document.querySelector('#table_row_template');

const detailsModal = document.getElementById('authorDetailsModal');
const addModal = document.getElementById('addModal');
const editModal = document.getElementById('editModal');
const authModal = document.getElementById('authModal');


// ===================== CUSTOM POPUPS =====================
const popupModal = document.getElementById('popupModal');
const popupMessage = document.getElementById('popupMessage');
const popupActions = document.getElementById('popupActions');

function showAlert(message) {
  popupMessage.textContent = message;
  popupActions.innerHTML = '<button class="popup-ok" id="popupOkBtn">У реду</button>';
  popupModal.style.display = 'flex';

  document.getElementById('popupOkBtn').addEventListener('click', () => {
    popupModal.style.display = 'none';
  });
}

function showConfirm(message, onConfirm, onCancel = () => {}) {
  popupMessage.textContent = message;
  popupActions.innerHTML = `
    <button class="popup-cancel" id="popupCancelBtn">Одустани</button>
    <button class="popup-ok" id="popupOkBtn">Потврди</button>
  `;
  popupModal.style.display = 'flex';

  document.getElementById('popupOkBtn').addEventListener('click', () => {
    popupModal.style.display = 'none';
    onConfirm();
  });
  document.getElementById('popupCancelBtn').addEventListener('click', () => {
    popupModal.style.display = 'none';
    onCancel();
  });
}

// Close popup by clicking overlay
popupModal.addEventListener('click', (e) => {
  if (e.target === popupModal) {
    popupModal.style.display = 'none';
  }
});



// ===================== ROW CREATION =====================
function createRow(author, key) {
  const clone = template.content.cloneNode(true);
  const mainRow = clone.querySelector('.main-row');

  // Name
  mainRow.querySelector('.author-name').textContent = `${author.ime} ${author.prezime}`;
  mainRow.querySelector('.author-name').setAttribute('data-fullname', `${author.ime} ${author.prezime}`); 

  // Photo – use first image from array, or default
  const photo = (Array.isArray(author.slike) && author.slike.length) ? author.slike[0] : 'default_pfp.png';
  mainRow.querySelector('.author-thumb').src = photo;

  // Birth date
  mainRow.querySelector('.birthday').textContent = formatDate(author.datumRodjenja);

  // Status badge (status is now Serbian Cyrillic)
  const badge = mainRow.querySelector('.status-badge');
  applyStatusBadge(badge, author.status);

  // Sales
  mainRow.querySelector('.sales').textContent = formatSales(author.brojProdatihPrimeraka);

  // Phone
  const phone = author.kontaktTelefonMenadzera || '';
  const phoneLink = mainRow.querySelector('.phone a');
  phoneLink.href = `tel:${phone}`;
  phoneLink.textContent = formatPhone(phone);

  // Store key
  mainRow.dataset.id = key;
  mainRow.querySelector('.row-checkbox').dataset.id = key;

  return clone;
}

// ===================== INITIAL RENDER =====================
for (const [key, author] of Object.entries(authorsData)) {
  tbody.appendChild(createRow(author, key));
}

// ===================== SEARCH =====================
const searchInput = document.getElementById('authorSearch');
const statusFilter = document.getElementById('statusFilter');

function applyFilters() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedStatus = statusFilter.value;  // empty string = all

  const rows = tbody.querySelectorAll('tr.main-row');
  rows.forEach(row => {
    const nameSpan = row.querySelector('.author-name');
    const fullName = nameSpan.getAttribute('data-fullname') || '';
    const nameMatch = fullName.toLowerCase().includes(searchTerm);

    // Status filter
    const badge = row.querySelector('.status-badge');
    const rowStatus = badge ? badge.textContent.trim() : '';
    const statusMatch = !selectedStatus || rowStatus === selectedStatus;

    if (nameMatch && statusMatch) {
      row.style.display = '';

      // Highlight search term in name
      if (searchTerm) {
        // Escape regex special characters
        const escaped = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(${escaped})`, 'gi');
        nameSpan.innerHTML = fullName.replace(regex, '<mark>$1</mark>');
      } else {
        nameSpan.textContent = fullName;  // no highlighting when search is empty
      }
    } else {
      row.style.display = 'none';
    }
  });
}

searchInput.addEventListener('input', applyFilters);
statusFilter.addEventListener('change', applyFilters);

// ===================== DETAILS MODAL =====================
function showDetailsModal(author, key) {
  document.getElementById('details-ime').textContent = author.ime;
  document.getElementById('details-prezime').textContent = author.prezime;

  // Photo
  const photo = (Array.isArray(author.slike) && author.slike.length) ? author.slike[0] : 'default_pfp.png';
  document.getElementById('details-img').src = photo;

  document.getElementById('details-dob').textContent = formatDate(author.datumRodjenja);

  const statusSpan = document.getElementById('details-status');
  applyStatusBadge(statusSpan, author.status);

  document.getElementById('details-sales').textContent = formatSales(author.brojProdatihPrimeraka);

  const phone = author.kontaktTelefonMenadzera || '';
  const phoneLink = document.getElementById('details-phone');
  phoneLink.href = `tel:${phone}`;
  phoneLink.textContent = formatPhone(phone);

  document.getElementById('details-awards').textContent = author.brojOsvojenihNagrada;
  document.getElementById('details-bio').textContent = author.biografija;

  detailsModal.dataset.authorId = key;
  detailsModal.style.display = 'flex';
}

// Open details modal on "⋯" click
tbody.addEventListener('click', (e) => {
  const btn = e.target.closest('.details-btn');
  if (!btn) return;
  const mainRow = btn.closest('tr');
  const key = mainRow.dataset.id;
  const author = authorsData[key];
  if (author) showDetailsModal(author, key);
});

// Delete from details modal
document.getElementById('detailsDeleteBtn').addEventListener('click', () => {
  const key = detailsModal.dataset.authorId;
  if (!key || !authorsData[key]) return;
  if (!confirm('Да ли сте сигурни да желите да обришете овог аутора?')) return;
  delete authorsData[key];
  const row = tbody.querySelector(`tr.main-row[data-id="${key}"]`);
  if (row) row.remove();
  detailsModal.style.display = 'none';
});

// Edit button in details modal -> open edit modal pre-filled
document.getElementById('detailsEditBtn').addEventListener('click', () => {
  const key = detailsModal.dataset.authorId;
  if (!key || !authorsData[key]) return;
  const author = authorsData[key];

  document.getElementById('edit-id').value = key;
  document.getElementById('edit-name').value = author.ime;
  document.getElementById('edit-surname').value = author.prezime;
  document.getElementById('edit-bio').value = author.biografija;
  document.getElementById('edit-dob').value = author.datumRodjenja;
  document.getElementById('edit-status').value = author.status;
  document.getElementById('edit-awards').value = author.brojOsvojenihNagrada;
  document.getElementById('edit-sales').value = author.brojProdatihPrimeraka;
  document.getElementById('edit-phone').value = author.kontaktTelefonMenadzera || '';

  detailsModal.style.display = 'none';
  editModal.style.display = 'flex';
});

// ===================== BULK DELETE =====================
document.querySelector('.delete-selected-btn').addEventListener('click', () => {
  const checked = tbody.querySelectorAll('.row-checkbox:checked');
  if (checked.length === 0) {
    showAlert('Ниједан аутор није означен.');
    return;
  }
  checked.forEach(cb => {
    const row = cb.closest('tr');
    const key = row.dataset.id;
    if (key) delete authorsData[key];
    row.remove();
  });
});

// ===================== ADD MODAL =====================
document.getElementById('openAddModal').addEventListener('click', () => {
  addModal.style.display = 'flex';
});

document.getElementById('dodavanje-autora-modal').addEventListener('submit', function(e) {
  e.preventDefault();
  const form = e.target;

  // Required fields
  if (!form.ime.value.trim()) {
    showAlert('Име је обавезно.');
    return;
  }
  if (!form.prezime.value.trim()) {
    showAlert('Презиме је обавезно.');
    return;
  }

  // Phone validation (if provided)
  const phone = form['br-telefona'].value.trim();
  if (phone && !isValidPhone(phone)) {
    showAlert('Неисправан број телефона. Очекивани формат: +381 64 1234567');
    return;
  }

  // Numbers not negative (min attribute handles arrow keys, but just in case)
  const nagrade = parseInt(form['br-nagrada'].value) || 0;
  const prodati = parseInt(form['br-prodatih'].value) || 0;
  if (nagrade < 0) {
    showAlert('Број награда не може бити негативан.');
    return;
  }
  if (prodati < 0) {
    showAlert('Број продатих примерака не може бити негативан.');
    return;
  }

  // All good, create author
  const newAuthor = {
    ime: form.ime.value,
    prezime: form.prezime.value,
    biografija: form.biografija.value || '',
    slike: [],
    datumRodjenja: form['datum-rodjenja'].value,
    status: form.status.value,
    brojOsvojenihNagrada: nagrade,
    brojProdatihPrimeraka: prodati,
    kontaktTelefonMenadzera: phone
  };

  const newKey = 'aut' + Date.now() + Math.random().toString(36).substr(2, 5);
  authorsData[newKey] = newAuthor;
  tbody.appendChild(createRow(newAuthor, newKey));
  form.reset();
  addModal.style.display = 'none';
});

// ===================== EDIT MODAL =====================

document.getElementById('cancelEditBtn').addEventListener('click', () => {
  const key = document.getElementById('edit-id').value;
  editModal.style.display = 'none';
  // Re‑open the details modal with the same author
  const author = authorsData[key];
  if (author) {
    showDetailsModal(author, key);
  }
});

document.getElementById('izmena-autora-modal').addEventListener('submit', function(e) {
  e.preventDefault();
  const key = document.getElementById('edit-id').value;
  if (!key || !authorsData[key]) return;

  // Required fields
  const ime = document.getElementById('edit-name').value.trim();
  const prezime = document.getElementById('edit-surname').value.trim();
  if (!ime) {
    showAlert('Име је обавезно.');
    return;
  }
  if (!prezime) {
    showAlert('Презиме је обавезно.');
    return;
  }

  const phone = document.getElementById('edit-phone').value.trim();
  if (phone && !isValidPhone(phone)) {
    showAlert('Неисправан број телефона. Очекивани формат: +381 64 1234567');
    return;
  }

  const nagrade = parseInt(document.getElementById('edit-awards').value) || 0;
  const prodati = parseInt(document.getElementById('edit-sales').value) || 0;
  if (nagrade < 0) {
    showAlert('Број награда не може бити негативан.');
    return;
  }
  if (prodati < 0) {
    showAlert('Број продатих примерака не може бити негативан.');
    return;
  }

  const author = authorsData[key];
  author.ime = ime;
  author.prezime = prezime;
  author.biografija = document.getElementById('edit-bio').value;
  author.datumRodjenja = document.getElementById('edit-dob').value;
  author.status = document.getElementById('edit-status').value;
  author.brojOsvojenihNagrada = nagrade;
  author.brojProdatihPrimeraka = prodati;
  author.kontaktTelefonMenadzera = phone;

  // Update the row
  const row = tbody.querySelector(`tr.main-row[data-id="${key}"]`);
  if (row) {
    row.querySelector('.author-name').textContent = `${author.ime} ${author.prezime}`;
    row.querySelector('.birthday').textContent = formatDate(author.datumRodjenja);
    applyStatusBadge(row.querySelector('.status-badge'), author.status);
    row.querySelector('.sales').textContent = formatSales(author.brojProdatihPrimeraka);
    const phoneLink = row.querySelector('.phone a');
    phoneLink.href = `tel:${author.kontaktTelefonMenadzera}`;
    phoneLink.textContent = formatPhone(author.kontaktTelefonMenadzera);
  }
  editModal.style.display = 'none';
});

// ===================== AUTH MODAL =====================
document.getElementById('openAuthModal').addEventListener('click', () => {
  authModal.style.display = 'flex';
});

// Tab switching
document.getElementById('loginTab').addEventListener('click', function () {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('registerForm').style.display = 'none';
  this.style.borderBottom = '2px solid #007bff';
  this.style.color = '#007bff';
  this.style.fontWeight = 'bold';
  const rt = document.getElementById('registerTab');
  rt.style.borderBottom = 'none';
  rt.style.color = '';
  rt.style.fontWeight = '';
});

document.getElementById('registerTab').addEventListener('click', function () {
  document.getElementById('registerForm').style.display = 'block';
  document.getElementById('loginForm').style.display = 'none';
  this.style.borderBottom = '2px solid #007bff';
  this.style.color = '#007bff';
  this.style.fontWeight = 'bold';
  const lt = document.getElementById('loginTab');
  lt.style.borderBottom = 'none';
  lt.style.color = '';
  lt.style.fontWeight = '';
});

// ===================== CLOSE MODALS ON OVERLAY CLICK =====================
window.addEventListener('click', function (e) {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.style.display = 'none';
  }
});