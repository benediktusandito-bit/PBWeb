const express = require("express");
const app = express();
const PORT = 3000;

// untuk membaca JSON dari body request
app.use(express.json());

// inisialisasi array kosong sebagai media penyimpanan sementara
let students = [];

// endpoint GET /api/siswa (menampilkan semua daftar siswa)
app.get("/api/siswa", (req, res) => {
  res.status(200).json({
    status: "success",
    data: students,
  });
});

// endpoint POST /api/siswa (menambahkan data siswa baru)
app.post("/api/siswa", (req, res) => {
  const { name, birthPlace, birthDate, activeAddress } = req.body;

  // validasi jika salah satu properti kosong atau tidak dikirimkan
  if (!name || !birthPlace || !birthDate || !activeAddress) {
    return res.status(400).json({
      status: "fail",
      message:
        "Semua properti (name, birthPlace, birthDate, activeAddress) wajib diisi!",
    });
  }

  // membuat ID otomatis dengan panjang array
  const newId = students.length > 0 ? students[students.length - 1].id + 1 : 1;

  const newStudent = {
    id: newId,
    name,
    birthPlace,
    birthDate,
    activeAddress,
  };

  students.push(newStudent);

  res.status(201).json({
    status: "success",
    message: "Data siswa berhasil ditambahkan",
    data: newStudent,
  });
});

// endpoint PUT /api/siswa/:id (mengubah nama atau alamat aktif siswa berdasarkan ID)
app.put("/api/siswa/:id", (req, res) => {
  const studentId = parseInt(req.params.id);
  const { name, activeAddress } = req.body;

  // cari index siswa berdasarkan ID
  const studentIndex = students.findIndex((s) => s.id === studentId);

  // jika ID tidak ditemukan, kembalikan HTTP Status Code 404 Not Found
  if (studentIndex === -1) {
    return res.status(404).json({
      status: "fail",
      message: `Siswa dengan ID ${studentId} tidak ditemukan`,
    });
  }

  // perbarui data jika dikirimkan oleh user (mempertahankan nilai lama jika tidak diubah)
  students[studentIndex] = {
    ...students[studentIndex],
    name: name !== undefined ? name : students[studentIndex].name,
    activeAddress:
      activeAddress !== undefined
        ? activeAddress
        : students[studentIndex].activeAddress,
  };

  res.status(200).json({
    status: "success",
    message: "Data siswa berhasil diperbarui",
    data: students[studentIndex],
  });
});

// endpoint DELETE /api/siswa/:id (menghapus data siswa berdasarkan ID)
app.delete("/api/siswa/:id", (req, res) => {
  const studentId = parseInt(req.params.id);

  // cari index siswa berdasarkan ID
  const studentIndex = students.findIndex((s) => s.id === studentId);

  // jika ID tidak ditemukan, kembalikan HTTP Status Code 404 Not Found
  if (studentIndex === -1) {
    return res.status(404).json({
      status: "fail",
      message: `Siswa dengan ID ${studentId} tidak ditemukan`,
    });
  }

  // hapus data dari array students menggunakan splice
  const deletedStudent = students.splice(studentIndex, 1)[0];

  res.status(200).json({
    status: "success",
    message: `Data siswa dengan ID ${studentId} berhasil dihapus`,
    data: deletedStudent,
  });
});

// untuk menjalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
