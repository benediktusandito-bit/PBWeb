import React, { useState } from "react";

function PenghitungKehadiran() {
  // State untuk menyimpan nilai kehadiran
  const [jumlah, setJumlah] = useState(0);

  // Fungsi Tambah: Memastikan angka tidak lebih dari 30
  const tambah = () => {
    if (jumlah < 30) {
      setJumlah(jumlah + 1);
    }
  };

  // Fungsi Kurang: Memastikan angka tidak kurang dari 0
  const kurang = () => {
    if (jumlah > 0) {
      setJumlah(jumlah - 1);
    }
  };

  // Fungsi Reset: Mengembalikan nilai ke 0
  const reset = () => {
    setJumlah(0);
  };

  return (
    <div>
      <h2>Penghitung Kehadiran</h2>
      <p style={{ fontSize: "20px", fontWeight: "bold" }}>
        Jumlah Kehadiran: {jumlah} / 30 Pertemuan
      </p>

      {/* Pesan Peringatan Saat Mencapai Batas Minimum / Maksimum */}
      {jumlah === 30 && (
        <p style={{ color: "red" }}>
          Aturan: Kehadiran sudah mencapai batas maksimum (30)!
        </p>
      )}
      {jumlah === 0 && (
        <p style={{ color: "orange" }}>
          Aturan: Kehadiran tidak bisa kurang dari 0.
        </p>
      )}

      <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
        {/* Atribut disabled dipakai agar tombol mati otomatis saat menyentuh batas */}
        <button onClick={tambah} disabled={jumlah === 30}>
          Tambah (+)
        </button>
        <button onClick={kurang} disabled={jumlah === 0}>
          Kurang (-)
        </button>
        <button onClick={reset}>Reset</button>
      </div>
    </div>
  );
}

export default PenghitungKehadiran;
