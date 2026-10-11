// Key localStorage dan versi khusus untuk fitur kontak
const STORAGE_KEY = "web-contacts-v1";

// Seleksi elemen DOM Form & Control
const contactForm = document.querySelector("#contact-form");
const contactIdInput = document.querySelector("#contact-id");
const nameInput = document.querySelector("#name-input");
const phoneInput = document.querySelector("#phone-input");
const emailInput = document.querySelector("#email-input");
const categoryInput = document.querySelector("#category-input");
const contactError = document.querySelector("#contact-error");
const saveButton = document.querySelector("#save-button");
const cancelEditBtn = document.querySelector("#cancel-edit-btn");

const searchInput = document.querySelector("#search-input");
const filterCategory = document.querySelector("#filter-category");
const contactList = document.querySelector("#contact-list");
const contactCount = document.querySelector("#contact-count");
const emptyState = document.querySelector("#empty-state");
const emptyMessage = document.querySelector("#empty-message");

// State aplikasi
let contacts = muatContacts();
let searchText = "";
let selectedCategory = "all";

// Data awal
function inisialisasiDataAwal() {
  return [
    {
      id: "1",
      name: "Zakha",
      phone: "081234567890",
      email: "zakha@gmail.com",
      category: "Kerja",
    },
    {
      id: "2",
      name: "Kakak",
      phone: "085678901234",
      email: "dimas@gmail.com",
      category: "Keluarga",
    },
    {
      id: "3",
      name: "Josia",
      phone: "087812345678",
      email: "josia@gmail.com",
      category: "Teman",
    },
    {
      id: "4",
      name: "Mama",
      phone: "082198765432",
      email: "mama@gmail.com",
      category: "Keluarga",
    },
    {
      id: "5",
      name: "Rey",
      phone: "081355556666",
      email: "rey@gmail.com",
      category: "Teman",
    },
    {
      id: "6",
      name: "Gaffin",
      phone: "085788889999",
      email: "gaffin@gmail.com",
      category: "Teman",
    },
    {
      id: "7",
      name: "Jokowi",
      phone: "081122334455",
      email: "jokowi@gmail.com",
      category: "Lainnya",
    },
    {
      id: "8",
      name: "Prabowo",
      phone: "087799887766",
      email: "prabowo@gmail.com",
      category: "Lainnya",
    },
  ];
}

// Ambil data dari localStorage atau inisialisasi jika belum ada
function muatContacts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = inisialisasiDataAwal();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

// Simpan array contacts ke localStorage
function simpanContacts() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(contacts));
}

// Helper: Simpan data lalu perbarui tampilan
function commit() {
  simpanContacts();
  render();
}

// Validasi nama, telp, format email, & cegah duplikasi email
function validasiKontak(name, phone, email, currentId = null) {
  const cleanName = name.trim();
  const cleanPhone = phone.trim();
  const cleanEmail = email.trim();

  if (!cleanName || !cleanPhone || !cleanEmail) {
    return { valid: false, message: "Semua kolom wajib diisi." };
  }
  if (cleanName.length < 3) {
    return { valid: false, message: "Nama minimal harus 3 karakter." };
  }

  // Validasi format nomor telepon (8-15 digit)
  const phoneRegex = /^[0-9+\-\s]{8,15}$/;
  if (!phoneRegex.test(cleanPhone)) {
    return { valid: false, message: "Nomor telepon tidak valid (8-15 digit)." };
  }

  // Validasi format email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { valid: false, message: "Format email tidak valid." };
  }

  // Cek apakah email sudah terpakai oleh kontak lain
  const duplicateEmail = contacts.find(
    (c) =>
      c.email.toLowerCase() === cleanEmail.toLowerCase() && c.id !== currentId,
  );
  if (duplicateEmail) {
    return { valid: false, message: "Email sudah terdaftar pada kontak lain." };
  }

  return {
    valid: true,
    value: { name: cleanName, phone: cleanPhone, email: cleanEmail },
  };
}

// Tampilkan / sembunyikan pesan error validasi
function tampilkanError(pesan) {
  if (pesan) {
    contactError.textContent = pesan;
    contactError.hidden = false;
  } else {
    contactError.textContent = "";
    contactError.hidden = true;
  }
}

// Tambah kontak baru
function tambahKontak(data) {
  const newContact = {
    id: String(Date.now()),
    ...data,
    category: categoryInput.value,
  };
  contacts = [newContact, ...contacts];
  commit();
}

// Perbarui kontak yang sedang di-edit
function updateKontak(id, data) {
  contacts = contacts.map((c) =>
    c.id === id ? { ...c, ...data, category: categoryInput.value } : c,
  );
  resetForm();
  commit();
}

// Hapus kontak berdasarkan ID
function hapusKontak(id) {
  if (confirm("Hapus kontak ini dari daftar?")) {
    contacts = contacts.filter((c) => c.id !== id);
    if (contactIdInput.value === id) resetForm();
    commit();
  }
}

// Isi form dengan data kontak yang dipilih untuk diedit
function mulaiEdit(id) {
  const target = contacts.find((c) => c.id === id);
  if (!target) return;

  contactIdInput.value = target.id;
  nameInput.value = target.name;
  phoneInput.value = target.phone;
  emailInput.value = target.email;
  categoryInput.value = target.category;

  saveButton.textContent = "Perbarui Kontak";
  cancelEditBtn.hidden = false;
  tampilkanError("");
  nameInput.focus();
}

// Bersihkan form dan kembalikan ke mode tambah
function resetForm() {
  contactForm.reset();
  contactIdInput.value = "";
  saveButton.textContent = "Simpan Kontak";
  cancelEditBtn.hidden = true;
  tampilkanError("");
}

// Filter data dan urutkan nama secara alfabet tanpa mengubah array asal
function filterDanUrutkanContacts() {
  const filtered = contacts.filter((c) => {
    const cocokKategori =
      selectedCategory === "all" || c.category === selectedCategory;
    const query = searchText.toLowerCase();
    const cocokTeks =
      c.name.toLowerCase().includes(query) ||
      c.email.toLowerCase().includes(query);
    return cocokKategori && cocokTeks;
  });

  // Urutkan salinan array agar `contacts` tidak termutasi
  return [...filtered].sort((a, b) =>
    a.name.localeCompare(b.name, "id", { sensitivity: "base" }),
  );
}

// Buat elemen DOM menggunakan `textContent` agar aman dari serangan XSS
function buatKontakElement(contact) {
  const li = document.createElement("li");
  li.className = "task-item";
  li.dataset.id = contact.id;

  const content = document.createElement("div");
  content.className = "task-content";

  const nameSpan = document.createElement("span");
  nameSpan.className = "contact-name";
  nameSpan.textContent = contact.name; // Aman via textContent

  const phoneSpan = document.createElement("span");
  phoneSpan.className = "contact-detail";
  phoneSpan.textContent = `Telp: ${contact.phone}`;

  const emailSpan = document.createElement("span");
  emailSpan.className = "contact-detail";
  emailSpan.textContent = `Email: ${contact.email}`;

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = contact.category;

  content.append(nameSpan, phoneSpan, emailSpan, badge);

  const actions = document.createElement("div");
  actions.className = "task-actions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "btn-action btn-edit";
  editBtn.dataset.action = "edit";
  editBtn.textContent = "Edit";

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.className = "btn-action btn-delete";
  deleteBtn.dataset.action = "delete";
  deleteBtn.textContent = "Hapus";

  actions.append(editBtn, deleteBtn);
  li.append(content, actions);

  return li;
}

// Render daftar kontak ke DOM
function render() {
  const data = filterDanUrutkanContacts();
  contactList.replaceChildren();

  const fragment = document.createDocumentFragment();
  data.forEach((c) => fragment.append(buatKontakElement(c)));
  contactList.append(fragment);

  contactCount.textContent = data.length;

  if (data.length === 0) {
    emptyState.hidden = false;
    emptyMessage.textContent =
      contacts.length === 0
        ? "Belum ada kontak."
        : "Tidak ada kontak yang sesuai pencarian atau filter.";
  } else {
    emptyState.hidden = true;
  }
}

// Handler submit form (Tambah/Edit)
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const currentId = contactIdInput.value;
  const val = validasiKontak(
    nameInput.value,
    phoneInput.value,
    emailInput.value,
    currentId,
  );

  if (!val.valid) {
    tampilkanError(val.message);
    return;
  }

  tampilkanError("");

  if (currentId) {
    updateKontak(currentId, val.value);
  } else {
    tambahKontak(val.value);
    resetForm();
  }
});

// Tombol Batal Edit
cancelEditBtn.addEventListener("click", () => resetForm());

// Reset pesan error saat mengetik ulang
nameInput.addEventListener("input", () => tampilkanError(""));
phoneInput.addEventListener("input", () => tampilkanError(""));
emailInput.addEventListener("input", () => tampilkanError(""));

// Handler pencarian live
searchInput.addEventListener("input", (e) => {
  searchText = e.target.value.trim();
  render();
});

// Handler filter kategori
filterCategory.addEventListener("change", (e) => {
  selectedCategory = e.target.value;
  render();
});

// Event delegation untuk tombol Edit dan Hapus
contactList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const item = btn.closest("[data-id]");
  if (!item) return;

  const id = item.dataset.id;
  const action = btn.dataset.action;

  if (action === "edit") mulaiEdit(id);
  if (action === "delete") hapusKontak(id);
});

// Jalankan render awal saat halaman dimuat
render();
