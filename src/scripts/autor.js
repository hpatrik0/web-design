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

const books = await get(ref(db, 'knjige/'));
const booksData = books.val();

const search_bar = window.location.search;

const url_params = new URLSearchParams(search_bar);

const full_id = url_params.get('id');

const type_list = ['aut', 'knj', 'kor', 'oce', 'rec'];

const book_list = [];

// ===================== HELPERS =====================
function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('sr', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

// ===================== GET AUTHOR ID FROM URL =====================
const params = new URLSearchParams(window.location.search);
const authorId = params.get('id');

// ===================== DOM CONTAINERS =====================
const detailsContainer = document.getElementById('author-details');
const booksContainer   = document.getElementById('author-books');

// ===================== AUTHOR NOT FOUND =====================
const author = authorsData[authorId];
if (!author) {
  if (booksContainer)   booksContainer.innerHTML = '';
} else {
  // ==================== RENDER BOOK LIST (NEW LAYOUT) ====================
  if (booksContainer) {
    const authorBooks = Object.entries(booksData)
      .filter(([key, book]) => book.idAutora === authorId)
      .map(([key, book]) => ({ key, ...book }));

    if (authorBooks.length === 0) {
      booksContainer.innerHTML = '<p>Нема књига за овог аутора.</p>';
    } else {
      const listHTML = `
        <h3 style="text-align:center;">Књиге аутора</h3>
        <div class="book-list">
          ${authorBooks.map(book => {
            const cover = (Array.isArray(book.slike) && book.slike.length)
                            ? book.slike[0]
                            : 'src/assets/default_book_cover.png';
            return `
              <a href="knjiga.html?id=${book.key}" class="book-row">
                <div class="book-row-left">
                  <img src="${cover}" alt="${book.naziv}">
                  <strong>${book.naziv}</strong>
                </div>
                <div class="book-row-right">
                  <p>${book.opis}</p>
                </div>
              </a>
            `;
          }).join('')}
        </div>
      `;
      booksContainer.innerHTML = listHTML;
    }
  }
}