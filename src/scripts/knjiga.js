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

const search_bar = window.location.search;

const url_params = new URLSearchParams(search_bar);

const full_id = url_params.get('id');

const snapshot = await get(ref(db, `knjige/${full_id}`));
const bookData = snapshot.val();

const outputDiv = document.getElementById("output");

// Helper: determine if the whole object is a collection (all values are objects)
function isCollection(data) {
    if (typeof data !== 'object' || data === null) return false;
    const values = Object.values(data);
    return values.every(v => typeof v === 'object' && v !== null && !Array.isArray(v));
}

// Helper: display a single book's properties
function displayBook(section, bookId, book) {
    for (const [key, value] of Object.entries(book)) {
    const p = document.createElement('p');
    let displayValue = value;
    if (Array.isArray(value)) {
        displayValue = value.join(', ') || '(empty array)';
    } else if (typeof value === 'object' && value !== null) {
        displayValue = JSON.stringify(value);
    }
    p.innerHTML = `<strong>${key}:</strong> ${displayValue}`;
    section.appendChild(p);
    }
}

if (isCollection(bookData)) {
    // Collection of books
    for (const [bookId, book] of Object.entries(bookData)) {
    const section = document.createElement('div');
    section.className = 'book-section';
    displayBook(section, bookId, book);
    outputDiv.appendChild(section);
    }
} else {
    // Single book or flat object
    const section = document.createElement('div');
    section.className = 'book-section';
    if (typeof bookData === 'object' && bookData !== null && !Array.isArray(bookData)) {
    // It's a single book object with properties like naziv, opis
    displayBook(section, null, bookData);
    } else {
    // It's some other type, just show as string
    section.textContent = JSON.stringify(bookData, null, 2);
    }
    outputDiv.appendChild(section);
}