import React from "react";

// Sub-komponen Kartu Mata Kuliah yang menerima props
function KartuMatkul({ id, namaMatkul, sks, pengajar }) {
  return (
    <div
      style={{
        border: "1px solid #4CAF50",
        padding: "12px",
        margin: "8px 0",
        borderRadius: "6px",
      }}
    >
      <h4 style={{ margin: "0 0 8px 0" }}>{namaMatkul}</h4>
      <p style={{ margin: "4px 0" }}>SKS: {sks}</p>
      <p style={{ margin: "4px 0" }}>Dosen: {pengajar}</p>
    </div>
  );
}

// Komponen Utama
function DaftarMatkul() {
  // Array berisi data mata kuliah dengan id
  const listMatkul = [
    { id: "mk1", nama: "Pemrograman Berbasis Web", sks: 3, dosen: "Pak Puspa" },
    { id: "mk2", nama: "Struktur Data Linier", sks: 3, dosen: "Pak Wawan" },
    { id: "mk3", nama: "Daskomso", sks: 3, dosen: "Pak Puspa" },
    { id: "mk4", nama: "PBO", sks: 3, dosen: "Ibu Tatik" },
  ];

  return (
    <div>
      <h2>Daftar Mata Kuliah</h2>
      {/* Menggunakan map() untuk merender array menjadi daftar komponen kartu */}
      {listMatkul.map((item) => (
        <KartuMatkul
          key={item.id} // key wajib ada dan bernilai unik/stabil (id)
          namaMatkul={item.nama}
          sks={item.sks}
          pengajar={item.dosen}
        />
      ))}
    </div>
  );
}

export default DaftarMatkul;
