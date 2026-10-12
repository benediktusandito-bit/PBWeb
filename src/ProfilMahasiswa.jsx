import React from "react";

// Untuk menampilkan detail informasi profil
function DetailProfil({ nama, nim, prodi }) {
  return (
    <div
      style={{ padding: "10px", border: "1px solid #ccc", borderRadius: "8px" }}
    >
      {/* Mengakses nilai variabel/props menggunakan tanda kurung kurawal {} */}
      <p>
        <strong>Nama:</strong> {nama}
      </p>
      <p>
        <strong>NIM:</strong> {nim}
      </p>
      <p>
        <strong>Program Studi:</strong> {prodi}
      </p>
    </div>
  );
}

// Komponen Utama
function ProfilMahasiswa() {
  // Variabel penampung data mahasiswa sesuai permintaan soal
  const dataMahasiswa = {
    nama: "Benediktus Andito Wahyu Bagaskara",
    nim: "255314068",
    prodi: "Informatika",
  };

  return (
    <div>
      <h2>Profil Mahasiswa</h2>
      {/* Memanggil Sub-komponen DetailProfil dan mengirim data variabel via Props */}
      <DetailProfil
        nama={dataMahasiswa.nama}
        nim={dataMahasiswa.nim}
        prodi={dataMahasiswa.prodi}
      />
    </div>
  );
}

export default ProfilMahasiswa;
