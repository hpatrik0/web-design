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

const grid = document.getElementById('autor-grid');
const template = document.getElementById('autor_slot_template');

function createCard(author, key) {
  const clone = template.content.cloneNode(true);
  const card = clone.querySelector('.autor');
  const img = card.querySelector('#slika');
  const label = card.querySelector('#ime');

  const photo = (Array.isArray(author.slike) && author.slike.length) ? author.slike[0] : 'src/assets/default_pfp.png';
  img.src = photo;
  label.textContent = `${author.ime} ${author.prezime}`;

  // Store full name for filtering
  card.dataset.fullname = `${author.ime} ${author.prezime}`;
  card.dataset.status = author.status;

  // Make the link point to a dedicated author page (optional)
  card.parentElement.href = `autor.html?id=${key}`;

  return clone;
}

// Render all authors
for (const [key, author] of Object.entries(authorsData)) {
  grid.appendChild(createCard(author, key));
}

// Search filter
function applyFilters() {
  const searchTerm = document.getElementById('authorSearch').value.trim().toLowerCase();
  const selectedStatus = document.getElementById('statusFilter').value;
  const cards = document.querySelectorAll('.autor');

  cards.forEach(card => {
    const fullName = (card.dataset.fullname || '').toLowerCase();
    const status = card.dataset.status || '';   // you’ll need to store the status when creating cards

    const nameMatch = fullName.includes(searchTerm);
    const statusMatch = !selectedStatus || status === selectedStatus;

    card.parentElement.style.display = (nameMatch && statusMatch) ? '' : 'none';
  });
}

document.getElementById('authorSearch').addEventListener('input', applyFilters);
document.getElementById('statusFilter').addEventListener('change', applyFilters);

// ---------- Auth modal logic ----------
const authModal = document.getElementById('authModal');

// Wait for navbar.js to inject the button, then attach listener
document.getElementById('navbar').addEventListener('click', (e) => {
  const btn = e.target.closest('#openAuthModal');
  if (btn) {
    authModal.style.display = 'flex';
  }
});

// Close auth modal on overlay click
authModal.addEventListener('click', (e) => {
  if (e.target === authModal) {
    authModal.style.display = 'none';
  }
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