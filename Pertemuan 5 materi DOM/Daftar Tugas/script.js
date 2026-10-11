// Key untuk menyimpan data di Local Storage
const STORAGE_KEY = "web-tasks-v1";

// Seleksi elemen DOM
const taskForm = document.querySelector("#task-form");
const taskInput = document.querySelector("#task-input");
const taskError = document.querySelector("#task-error");
const searchInput = document.querySelector("#search-input");
const filterButtons = document.querySelectorAll("[data-filter]");
const taskList = document.querySelector("#task-list");
const taskCount = document.querySelector("#task-count");
const emptyState = document.querySelector("#empty-state");
const emptyMessage = document.querySelector("#empty-message");

// State aplikasi (penyimpan data sementara di memori)
let tasks = muatTasks();
let activeFilter = "all";
let searchText = "";
let editingTaskId = null;

// Ambil data dari Local Storage
function muatTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

// Simpan array tasks ke Local Storage
function simpanTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// Helper: Simpan data lalu render ulang tampilan
function commit() {
  simpanTasks();
  render();
}

// Validasi input judul tugas
function validasiJudul(rawText) {
  const title = rawText.trim();
  if (!title) return { valid: false, message: "Nama tugas wajib diisi." };
  if (title.length < 3) return { valid: false, message: "Minimal 3 karakter." };
  return { valid: true, value: title };
}

// Tampilkan / sembunyikan pesan error
function tampilkanError(pesan) {
  if (pesan) {
    taskError.textContent = pesan;
    taskError.hidden = false;
  } else {
    taskError.textContent = "";
    taskError.hidden = true;
  }
}

// Tambah tugas baru ke array
function tambahTask(title) {
  const newTask = {
    id: String(Date.now()),
    title: title,
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks = [newTask, ...tasks];
  commit();
}

// Ubah status selesai / belum
function toggleTask(id) {
  tasks = tasks.map((t) =>
    t.id === id ? { ...t, completed: !t.completed } : t,
  );
  commit();
}

// Hapus tugas berdasarkan ID
function deleteTask(id) {
  if (confirm("Hapus tugas ini?")) {
    tasks = tasks.filter((t) => t.id !== id);
    if (editingTaskId === id) editingTaskId = null;
    commit();
  }
}

// Simpan hasil edit tugas
function simpanEditTask(id, newTitle) {
  const val = validasiJudul(newTitle);
  if (!val.valid) {
    alert(val.message);
    return;
  }
  tasks = tasks.map((t) => (t.id === id ? { ...t, title: val.value } : t));
  editingTaskId = null;
  commit();
}

// Filter data tugas berdasarkan status & pencarian
function pilihTasks() {
  return tasks.filter((task) => {
    const cocokStatus =
      activeFilter === "all" ||
      (activeFilter === "active" && !task.completed) ||
      (activeFilter === "completed" && task.completed);
    const cocokTeks = task.title
      .toLowerCase()
      .includes(searchText.toLowerCase());
    return cocokStatus && cocokTeks;
  });
}

// Buat elemen HTML <li> secara dinamis
function buatTaskElement(task) {
  const li = document.createElement("li");
  li.className = `task-item ${task.completed ? "is-completed" : ""}`;
  li.dataset.id = task.id;

  // Mode Edit: Tampilkan input & tombol simpan/batal
  if (editingTaskId === task.id) {
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.className = "task-edit-input";
    editInput.value = task.title;
    editInput.dataset.action = "edit-input";

    const saveBtn = document.createElement("button");
    saveBtn.type = "button";
    saveBtn.className = "btn-action btn-save";
    saveBtn.dataset.action = "save-edit";
    saveBtn.textContent = "Simpan";

    const cancelBtn = document.createElement("button");
    cancelBtn.type = "button";
    cancelBtn.className = "btn-action btn-delete";
    cancelBtn.dataset.action = "cancel-edit";
    cancelBtn.textContent = "Batal";

    const actions = document.createElement("div");
    actions.className = "task-actions";
    actions.append(saveBtn, cancelBtn);

    li.append(editInput, actions);
  } else {
    // Mode Normal: Tampilkan judul & tombol aksi
    const content = document.createElement("div");
    content.className = "task-content";

    const titleSpan = document.createElement("span");
    titleSpan.className = "task-title";
    titleSpan.textContent = task.title;

    content.append(titleSpan);

    const actions = document.createElement("div");
    actions.className = "task-actions";

    const toggleBtn = document.createElement("button");
    toggleBtn.type = "button";
    toggleBtn.className = `btn-action btn-toggle ${task.completed ? "active" : ""}`;
    toggleBtn.dataset.action = "toggle";
    toggleBtn.textContent = task.completed ? "Batal" : "Selesai";

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

    actions.append(toggleBtn, editBtn, deleteBtn);
    li.append(content, actions);
  }

  return li;
}

// Render daftar tugas ke DOM
function render() {
  const data = pilihTasks();
  taskList.replaceChildren();

  // Gunakan DocumentFragment untuk efisiensi render DOM
  const fragment = document.createDocumentFragment();
  data.forEach((t) => fragment.append(buatTaskElement(t)));
  taskList.append(fragment);

  // Update jumlah tugas
  taskCount.textContent = data.length;

  // Sembunyikan/tampilkan empty state
  if (data.length === 0) {
    emptyState.hidden = false;
    emptyMessage.textContent =
      tasks.length === 0
        ? "Belum ada tugas."
        : "Tidak ada tugas yang sesuai filter.";
  } else {
    emptyState.hidden = true;
  }
}

// Submit Form (Tambah Tugas)
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const val = validasiJudul(taskInput.value);
  if (!val.valid) {
    tampilkanError(val.message);
    return;
  }
  tampilkanError("");
  tambahTask(val.value);
  taskInput.value = "";
});

// Bersihkan error saat pengguna mengetik ulang
taskInput.addEventListener("input", () => tampilkanError(""));

// Event pencarian (Live Search)
searchInput.addEventListener("input", (e) => {
  searchText = e.target.value.trim();
  render();
});

// Event klik filter status (Semua / Aktif / Selesai)
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filterButtons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    activeFilter = btn.dataset.filter;
    render();
  });
});

// Event Delegation untuk tombol aksi pada daftar tugas
taskList.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const item = btn.closest("[data-id]");
  if (!item) return;

  const id = item.dataset.id;
  const action = btn.dataset.action;

  if (action === "toggle") toggleTask(id);
  if (action === "delete") deleteTask(id);
  if (action === "edit") {
    editingTaskId = id;
    render();
  }
  if (action === "save-edit") {
    const input = item.querySelector('[data-action="edit-input"]');
    if (input) simpanEditTask(id, input.value);
  }
  if (action === "cancel-edit") {
    editingTaskId = null;
    render();
  }
});

// Inisialisasi tampilan pertama kali
render();
