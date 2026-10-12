import React, { useState } from "react";

function DaftarTugas() {
  // Menyimpan daftar seluruh tugas (state utama)
  const [tugasList] = useState([
    { id: 1, judul: "Praktikum React Pertemuan 6", selesai: true },
    { id: 2, judul: "Laporan Jaringan Komputer", selesai: false },
    { id: 3, judul: "Kuis Basis Data", selesai: false },
    { id: 4, judul: "Tugas Mandiri Struktur Data", selesai: true },
  ]);

  // Menyimpan status filter aktif ('Semua' | 'Aktif' | 'Selesai')
  const [filter, setFilter] = useState("Semua");

  // Logika Penyaringan: Menyaring daftar tugas TANPA mengubah data di state utama
  const tugasTampil = tugasList.filter((tugas) => {
    if (filter === "Aktif") return !tugas.selesai;
    if (filter === "Selesai") return tugas.selesai;
    return true; // Jika filter 'Semua', tampilkan seluruh tugas
  });

  return (
    <div>
      <h2>Daftar Tugas Kuliah</h2>

      {/* Tombol-tombol pilihan filter */}
      <div style={{ marginBottom: "12px", display: "flex", gap: "8px" }}>
        <button
          onClick={() => setFilter("Semua")}
          style={{ fontWeight: filter === "Semua" ? "bold" : "normal" }}
        >
          Semua
        </button>
        <button
          onClick={() => setFilter("Aktif")}
          style={{ fontWeight: filter === "Aktif" ? "bold" : "normal" }}
        >
          Aktif
        </button>
        <button
          onClick={() => setFilter("Selesai")}
          style={{ fontWeight: filter === "Selesai" ? "bold" : "normal" }}
        >
          Selesai
        </button>
      </div>

      {/* Menampilkan hasil filter */}
      <ul>
        {tugasTampil.map((item) => (
          <li
            key={item.id}
            style={{ textDecoration: item.selesai ? "line-through" : "none" }}
          >
            {item.judul} {item.selesai ? "(Selesai)" : "(Aktif)"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DaftarTugas;
