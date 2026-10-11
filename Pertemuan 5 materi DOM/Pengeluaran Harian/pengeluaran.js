// Storage key unik dengan versi khusus untuk fitur pengeluaran
const STORAGE_KEY = "web-expenses-v1";

// Seleksi Elemen DOM
const expenseForm = document.querySelector("#expense-form");
const expenseIdInput = document.querySelector("#expense-id");
const descInput = document.querySelector("#desc-input");
const amountInput = document.querySelector("#amount-input");
const categoryInput = document.querySelector("#category-input");
const dateInput = document.querySelector("#date-input");
const expenseError = document.querySelector("#expense-error");
const saveButton = document.querySelector("#save-button");
const cancelEditBtn = document.querySelector("#cancel-edit-btn");

const searchInput = document.querySelector("#search-input");
const filterCategory = document.querySelector("#filter-category");
const filterDate = document.querySelector("#filter-date");
const resetFilterBtn = document.querySelector("#reset-filter-btn");

const expenseList = document.querySelector("#expense-list");
const expenseCount = document.querySelector("#expense-count");
const totalAllEl = document.querySelector("#total-all");
const totalFilteredEl = document.querySelector("#total-filtered");
const emptyState = document.querySelector("#empty-state");
const emptyMessage = document.querySelector("#empty-message");
const clearAllBtn = document.querySelector("#clear-all-btn");

// State aplikasi
let expenses = muatExpenses();
let searchText = "";
let selectedCategory = "all";
let selectedDate = "";

// Data 10 transaksi
function inisialisasiDataUji() {
  return [
    {
      id: "1",
      description: "Makan siang",
      amount: 10000,
      category: "Makanan",
      date: "2026-10-01",
    },
    {
      id: "2",
      description: "Beli bensin",
      amount: 30000,
      category: "Transportasi",
      date: "2026-10-01",
    },
    {
      id: "3",
      description: "Belanja bulanan",
      amount: 150000,
      category: "Belanja",
      date: "2026-10-02",
    },
    {
      id: "4",
      description: "Token Listrik",
      amount: 100000,
      category: "Utilitas",
      date: "2026-10-02",
    },
    {
      id: "5",
      description: "Jajan",
      amount: 18000,
      category: "Makanan",
      date: "2026-10-03",
    },
    {
      id: "6",
      description: "Parkir",
      amount: 2000,
      category: "Transportasi",
      date: "2026-10-03",
    },
    {
      id: "7",
      description: "Langganan streaming film",
      amount: 50000,
      category: "Lainnya",
      date: "2026-10-04",
    },
    {
      id: "8",
      description: "Makan Malam",
      amount: 15000,
      category: "Makanan",
      date: "2026-10-04",
    },
    {
      id: "9",
      description: "Beli Alat Tulis",
      amount: 25000,
      category: "Belanja",
      date: "2026-10-05",
    },
    {
      id: "10",
      description: "Ganti Oli",
      amount: 70000,
      category: "Transportasi",
      date: "2026-10-05",
    },
  ];
}

// Memuat data dari localStorage dengan penanganan try/catch untuk memulihkan storage yang rusak/korup
function muatExpenses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = inisialisasiDataUji();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("Data di localStorage bukan berupa Array.");
    }
    return parsed;
  } catch (e) {
    // Apabila data korup / error JSON.parse, kembalikan ke data default secara aman
    console.warn("Peringatan: Storage rusak, memulihkan ke data default", e);
    const initial = inisialisasiDataUji();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
}

// Menyimpan data array expenses ke localStorage
function simpanExpenses() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(expenses));
  } catch (e) {
    console.error("Gagal menyimpan ke localStorage:", e);
  }
}

// Helper: Simpan data lalu perbarui UI
function commit() {
  simpanExpenses();
  render();
}

// Validasi nominal angka positif (> 0) dan tanggal wajib diisi
function validasiTransaksi(desc, amount, date) {
  const cleanDesc = desc.trim();
  const numAmount = Number(amount);
  const cleanDate = date.trim();

  if (!cleanDesc || amount === "" || !cleanDate) {
    return {
      valid: false,
      message: "Semua kolom (deskripsi, nominal, tanggal) wajib diisi.",
    };
  }
  if (isNaN(numAmount) || numAmount <= 0) {
    return {
      valid: false,
      message: "Nominal harus berupa angka positif (> 0).",
    };
  }

  return {
    valid: true,
    value: { description: cleanDesc, amount: numAmount, date: cleanDate },
  };
}

// Menampilkan / menyembunyikan pesan error validasi
function tampilkanError(pesan) {
  if (pesan) {
    expenseError.textContent = pesan;
    expenseError.hidden = false;
  } else {
    expenseError.textContent = "";
    expenseError.hidden = true;
  }
}

// Menambahkan transaksi baru ke bagian atas array
function tambahTransaksi(data) {
  const newTx = {
    id: String(Date.now()),
    ...data,
    category: categoryInput.value,
  };
  expenses = [newTx, ...expenses];
  commit();
}

// Memperbarui transaksi yang sedang di-edit
function updateTransaksi(id, data) {
  expenses = expenses.map((item) =>
    item.id === id ? { ...item, ...data, category: categoryInput.value } : item,
  );
  resetForm();
  commit();
}

// Menghapus transaksi berdasarkan ID
function hapusTransaksi(id) {
  if (confirm("Hapus catatan transaksi ini?")) {
    expenses = expenses.filter((item) => item.id !== id);
    if (expenseIdInput.value === id) resetForm();
    commit();
  }
}

// Menghapus seluruh data transaksi setelah mengonfirmasi pesan peringatan
function hapusSemuaTransaksi() {
  if (expenses.length === 0) return;
  if (
    confirm("PERINGATAN: Yakin ingin menghapus SELURUH catatan pengeluaran?")
  ) {
    expenses = [];
    resetForm();
    commit();
  }
}

// Mengisi data transaksi ke form untuk mode edit
function mulaiEdit(id) {
  const target = expenses.find((item) => item.id === id);
  if (!target) return;

  expenseIdInput.value = target.id;
  descInput.value = target.description;
  amountInput.value = target.amount;
  categoryInput.value = target.category;
  dateInput.value = target.date;

  saveButton.textContent = "Perbarui Transaksi";
  cancelEditBtn.hidden = false;
  tampilkanError("");
  descInput.focus();
}

// Mengembalikan form ke mode tambah
function resetForm() {
  expenseForm.reset();
  expenseIdInput.value = "";
  saveButton.textContent = "Simpan Transaksi";
  cancelEditBtn.hidden = true;
  tampilkanError("");
}

// Helper: Format angka ke format Rupiah Indonesia
function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(angka);
}

// Menghitung total seluruh transaksi & hasil filter memakai `reduce()`, serta memfilter data
function filterDanHitung() {
  // Hitung total seluruh transaksi tanpa filter menggunakan reduce
  const totalSemua = expenses.reduce(
    (sum, item) => sum + Number(item.amount),
    0,
  );

  // Filter data berdasar kategori, teks pencarian deskripsi, dan tanggal
  const filtered = expenses.filter((item) => {
    const cocokKategori =
      selectedCategory === "all" || item.category === selectedCategory;
    const query = searchText.toLowerCase();
    const cocokTeks = item.description.toLowerCase().includes(query);
    const cocokTanggal = !selectedDate || item.date === selectedDate;

    return cocokKategori && cocokTeks && cocokTanggal;
  });

  // Hitung total hasil filter menggunakan reduce
  const totalFiltered = filtered.reduce(
    (sum, item) => sum + Number(item.amount),
    0,
  );

  return { filtered, totalSemua, totalFiltered };
}

// Membuat elemen HTML <li> untuk item transaksi secara aman menggunakan textContent (mencegah XSS)
function buatTransaksiElement(item) {
  const li = document.createElement("li");
  li.className = "task-item";
  li.dataset.id = item.id;

  const content = document.createElement("div");
  content.className = "task-content";

  const descSpan = document.createElement("span");
  descSpan.className = "expense-desc";
  descSpan.textContent = item.description;

  const amountSpan = document.createElement("span");
  amountSpan.className = "expense-amount";
  amountSpan.textContent = `- ${formatRupiah(item.amount)}`;

  const metaSpan = document.createElement("span");
  metaSpan.className = "expense-meta";
  metaSpan.textContent = `Tanggal: ${item.date}`;

  const badge = document.createElement("span");
  badge.className = "badge";
  badge.textContent = item.category;

  content.append(descSpan, amountSpan, metaSpan, badge);

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

// Fungsi utama untuk merender UI
function render() {
  const { filtered, totalSemua, totalFiltered } = filterDanHitung();

  // Memperbarui nominal angka pada kartu ringkasan
  totalAllEl.textContent = formatRupiah(totalSemua);
  totalFilteredEl.textContent = formatRupiah(totalFiltered);

  expenseList.replaceChildren();
  const fragment = document.createDocumentFragment();
  filtered.forEach((item) => fragment.append(buatTransaksiElement(item)));
  expenseList.append(fragment);

  expenseCount.textContent = filtered.length;

  if (filtered.length === 0) {
    emptyState.hidden = false;
    emptyMessage.textContent =
      expenses.length === 0
        ? "Belum ada catatan transaksi."
        : "Tidak ada transaksi yang sesuai dengan filter atau pencarian.";
  } else {
    emptyState.hidden = true;
  }
}

// Handler submit form (Tambah/Edit)
expenseForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const currentId = expenseIdInput.value;
  const val = validasiTransaksi(
    descInput.value,
    amountInput.value,
    dateInput.value,
  );

  if (!val.valid) {
    tampilkanError(val.message);
    return;
  }

  tampilkanError("");

  if (currentId) {
    updateTransaksi(currentId, val.value);
  } else {
    tambahTransaksi(val.value);
    resetForm();
  }
});

cancelEditBtn.addEventListener("click", () => resetForm());

// Bersihkan pesan error saat mengetik ulang
descInput.addEventListener("input", () => tampilkanError(""));
amountInput.addEventListener("input", () => tampilkanError(""));
dateInput.addEventListener("input", () => tampilkanError(""));

// Handler live search deskripsi
searchInput.addEventListener("input", (e) => {
  searchText = e.target.value.trim();
  render();
});

// Handler filter berdasarkan kategori
filterCategory.addEventListener("change", (e) => {
  selectedCategory = e.target.value;
  render();
});

// Handler filter berdasarkan tanggal
filterDate.addEventListener("change", (e) => {
  selectedDate = e.target.value;
  resetFilterBtn.hidden = !selectedDate;
  render();
});

// Reset filter tanggal
resetFilterBtn.addEventListener("click", () => {
  filterDate.value = "";
  selectedDate = "";
  resetFilterBtn.hidden = true;
  render();
});

// Handler tombol hapus semua
clearAllBtn.addEventListener("click", () => {
  hapusSemuaTransaksi();
});

// Event delegation untuk tombol Edit dan Hapus di item list
expenseList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const item = btn.closest("[data-id]");
  if (!item) return;

  const id = item.dataset.id;
  const action = btn.dataset.action;

  if (action === "edit") mulaiEdit(id);
  if (action === "delete") hapusTransaksi(id);
});

// Jalankan render awal saat halaman dimuat
render();
