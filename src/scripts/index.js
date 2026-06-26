import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js';
import { getDatabase, ref, child, get } from 'https://www.gstatic.com/firebasejs/12.14.0/firebase-database.js';

// https://www.gstatic.com/firebasejs/[VERSION]/[SERVICE-NAME].js
// version is 12.14.0
let deposit = document.getElementById("content");

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

const params = new URLSearchParams(search_bar);

const full_id = params.get('id');

const type_list = ['aut', 'knj', 'kor', 'oce', 'rec'];


if (full_id) {
	const id = params.get('id').substring(0, 3);

	switch (id) {
	case type_list[0]:
		loadAutora(full_id);
		break;
	case type_list[1]:
		loadKnjiga();
		break;
	case type_list[2]:
		loadKorisnika();
		break;
	case type_list[3]:
		loadOcena();
		break;
	case type_list[4]:
		loadRecenzija();
		break;
	default:
		console.log(`Nije pronadjen ID ${id}`);
	}
} else {
	// onda mora da je neka lista, sto ce biti u tagu bodija
	const id = document.body.id;

	switch (id) {
		case 'lista_autora':
			loadListuAutora();
			break;
		case 'admin_autor':
			loadAdminAutorTable();
			break;
		default:
			console.log(`Nije pronadjen ID ${id}`);
	}
}

async function loadAutora(id) {
	const snapshot = await get(ref(db, `autori/${id}`));
	const data = snapshot.val();

	let biografija = document.getElementById("biografija");
	let ime = document.getElementById("ime");
	let prezime = document.getElementById("prezime");
	let ime_title = document.getElementById("ime_title");
	let status = document.getElementById("status");
	let br_nagrada = document.getElementById("br_nagrada");
	let br_primeraka = document.getElementById("br_primeraka");
	let datum = document.getElementById("datum");
	let kontakt = document.getElementById("kontakt");
	let slika = document.getElementById("slika_autora");

	biografija.textContent = data["biografija"];
	ime.textContent = data["ime"];
	prezime.textContent = data["prezime"];
	ime_title.textContent = data["ime"] + " " + data["prezime"];
	status.textContent = data["status"];
	br_nagrada.textContent = data["brojOsvojenihNagrada"];
	br_primeraka.textContent = data["brojProdatihPrimeraka"];
	kontakt.textContent = data["kontaktTelefonMenadzera"];
	slika.src = data["slike"][0];
}

async function loadListuAutora() {
	const snapshot = await get(ref(db, `autori/`));
	const data = snapshot.val();
	console.log(data);
	
	if (!snapshot.exists()) {
		container.innerHTML = '<p>Autori nisu pronadjeni.</p>';
		return;
	}
	const container = document.getElementById('autor-grid');
	const template = document.getElementById('autor_slot_template');

	snapshot.forEach(element => {
		const author = element.val();
		const authorID = element.key;

		const clone = template.content.cloneNode(true);
		const link = clone.querySelector('a');

		link.href = `autor.html?id=${authorID}`;

		const img = clone.getElementById("slika");
		img.src = author['slike'][0];
		img.alt = author.ime + " " + author.prezime;

		const name = clone.getElementById("ime");
		name.textContent = author.ime + " " + author.prezime;

		container.appendChild(clone);
	});
}

async function loadAdminAutorTable() {
	const snapshot = await get(ref(db, `autori/`));
	const data = snapshot.val();

	if (!snapshot.exists()) {
		container.innerHTML = '<p>Autori nisu pronadjeni.</p>';
		return;
	}

	console.log(data)
	const container = document.getElementById('admin_table');
	const template = document.getElementById('table_row_template');

	snapshot.forEach(element => {
		const row_data = element.val();
		const rowID = element.key;

		const clone = template.content.cloneNode(true);

		clone.getElementById("ime").textContent = row_data["ime"] + " " + row_data["prezime"];
		// clone.getElementById("prezime").textContent = row_data["prezime"];
		// clone.getElementById("biografija").textContent = row_data["biografija"];
		clone.getElementById("slika").src = row_data["slike"][0];
		clone.getElementById("rodjendan").textContent = row_data["datumRodjenja"];
		clone.getElementById("status").textContent = row_data["status"];
		// clone.getElementById("br_nagrada").textContent = row_data["brojOsvojenihNagrada"];
		clone.getElementById("br_primeraka").textContent = row_data["brojProdatihPrimeraka"];
		clone.getElementById("kontakt").textContent = row_data["kontaktTelefonMenadzera"];

		container.appendChild(clone);
	});

	return;
}

function loadKorisnika() {
	return;
}

const addBtn = document.getElementById('openAddModal');
    const modalOverlay = document.getElementById('addModal');
    const closeBtn = document.getElementById('closeModal');

    // Open modal
	if (addBtn) {
		addBtn.addEventListener('click', () => {
        modalOverlay.classList.add('active');
    });
	}



    // Close modal (✕ button)
	if (closeBtn) {
		closeBtn.addEventListener('click', () => {
			modalOverlay.classList.remove('active');
		});
	}

    // Close when clicking outside the white box
	if (modalOverlay) {
		modalOverlay.addEventListener('click', (e) => {
			if (e.target === modalOverlay) {
				modalOverlay.classList.remove('active');
			}
		});
	}

const editOverlay = document.getElementById('editModal');
    if (editOverlay) {
        const closeEdit = editOverlay.querySelector('.close-modal');

        // Listen for clicks on any .edit-btn, even if added later
		document.addEventListener('click', (e) => {
			if (e.target.closest('.edit-btn')) {
				const editOverlay = document.getElementById('editModal');
				if (editOverlay) editOverlay.classList.add('active');
			}
		});

        closeEdit.addEventListener('click', () => editOverlay.classList.remove('active'));
        editOverlay.addEventListener('click', (e) => {
            if (e.target === editOverlay) editOverlay.classList.remove('active');
        });
    }

const deleteBtn = document.querySelector('.delete-selected-btn');
if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
        const checkboxes = document.querySelectorAll('.table-element input[type="checkbox"]');
        const anyChecked = Array.from(checkboxes).some(cb => cb.checked);

        if (!anyChecked) {
            alert('Oзначите бар једног аутора за брисање.');
            return;
        }

        const confirmed = confirm('Да ли сте сигурни да желите да обришете означене ауторе?');
        if (confirmed) {
            alert('Аутори су обрисани.');
            checkboxes.forEach(cb => cb.checked = false);
        }
    });
}

    const openAuthBtn = document.getElementById('openAuthModal');
    const authOverlay = document.getElementById('authModal');
    if (openAuthBtn && authOverlay) {
        const closeAuth = authOverlay.querySelector('.close-modal');
        openAuthBtn.addEventListener('click', () => authOverlay.classList.add('active'));
        closeAuth.addEventListener('click', () => authOverlay.classList.remove('active'));
        authOverlay.addEventListener('click', (e) => {
            if (e.target === authOverlay) authOverlay.classList.remove('active');
        });
    }

    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    loginTab.addEventListener('click', () => {
        loginTab.style.borderBottom = '2px solid #007bff';
        loginTab.style.color = '#007bff';
        registerTab.style.borderBottom = 'none';
        registerTab.style.color = 'black';
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
    });
    registerTab.addEventListener('click', () => {
        registerTab.style.borderBottom = '2px solid #007bff';
        registerTab.style.color = '#007bff';
        loginTab.style.borderBottom = 'none';
        loginTab.style.color = 'black';
        document.getElementById('registerForm').style.display = 'block';
        document.getElementById('loginForm').style.display = 'none';
    });