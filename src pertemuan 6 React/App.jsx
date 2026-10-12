/*Sebagai wadah atau halaman utama tempat menggabungkan dan merangkai semua komponen tugas yang sudah dibuat terpisah */
import React from "react";
import ProfilMahasiswa from "./ProfilMahasiswa";
import DaftarMatkul from "./DaftarMatkul";
import PenghitungKehadiran from "./PenghitungKehadiran";
import DaftarTugas from "./DaftarTugas";

function App() {
  return (
    <div
      style={{
        padding: "24px",
        maxWidth: "700px",
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Menampilkan Profil Mahasiswa */}
      <ProfilMahasiswa />
      <hr />

      {/* Menampilkan Daftar Mata Kuliah */}
      <DaftarMatkul />
      <hr />

      {/* Menampilkan Penghitung Kehadiran */}
      <PenghitungKehadiran />
      <hr />

      {/* Menampilkan Daftar Tugas Kuliah */}
      <DaftarTugas />
    </div>
  );
}

export default App;
