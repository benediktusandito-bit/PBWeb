// menentukan persentase nilai (Tugas 30%, UTS 30%, UAS 40%)
const BOBOT = { tugas: 0.3, uts: 0.3, uas: 0.4 };

//mengecek apakah total bobot pas 100% (1.0). Menggunakan Number.EPSILON agar aman dari error pembulatan angka desimal
function validasiBobot(bobot) {
  const total = Object.values(bobot).reduce((acc, curr) => acc + curr, 0);
  return Math.abs(total - 1) < Number.EPSILON;
}

//menghitung nilai akhir mahasiswa sesuai dengan persen bobotnya
function hitungNilaiAkhir(data, bobot) {
  if (!validasiBobot(bobot)) return null;
  return data.tugas * bobot.tugas + data.uts * bobot.uts + data.uas * bobot.uas;
}

//menghitung rata-rata biasa (tanpa persen bobot, semua dianggap sama beratnya)
function hitungRataRataSederhana(daftarNilai) {
  const total = daftarNilai.reduce((acc, curr) => acc + curr, 0);
  return total / daftarNilai.length;
}

//mengecek apakah input angka valid (harus berupa angka, tidak kosong, dan nilainya antara 0 sampai 100)
function validasiNilai(nilai) {
  return (
    typeof nilai === "number" && !isNaN(nilai) && nilai >= 0 && nilai <= 100
  );
}

//mengubah nilai angka menjadi huruf (A, B, C, D, atau E)
function tentukanKategori(nilai) {
  if (nilai === null || isNaN(nilai)) return "Invalid";
  if (nilai >= 85) return "A";
  if (nilai >= 75) return "B";
  if (nilai >= 65) return "C";
  if (nilai >= 50) return "D";
  return "E";
}

//menentukan kelulusan: A/B/C = Lulus, D/E = Remedial
function tentukanStatus(kategori) {
  if (["A", "B", "C"].includes(kategori)) return "Lulus";
  if (["D", "E"].includes(kategori)) return "Tidak Lulus";
  return "Invalid";
}

//BAGIAN UTAMA: Mengolah data 1 orang mahasiswa dari validasi nilai, hitung nilai, hingga dapat nilai huruf & status
function buatHasilMahasiswa(data) {
  const daftarNilai = [data.tugas, data.uts, data.uas];

  //jika ada salah satu nilai yang aneh/salah, langsung tandai sebagai "Error"
  const semuaValid = daftarNilai.every(validasiNilai);
  if (!semuaValid) {
    return {
      nama: data.nama,
      rataSederhana: "Error",
      nilaiBerbobot: "Error",
      kategoriSederhana: "-",
      kategoriBerbobot: "Invalid",
      status: "Invalid (0-100)",
    };
  }

  //jika semua nilai aman, hitung rata-rata dan berikan kategori
  const rataSederhana = hitungRataRataSederhana(daftarNilai);
  const nilaiBerbobot = hitungNilaiAkhir(data, BOBOT);

  const katSederhana = tentukanKategori(rataSederhana);
  const katBerbobot = tentukanKategori(nilaiBerbobot);

  return {
    nama: data.nama,
    rataSederhana: Number(rataSederhana.toFixed(2)), //dibulatkan 2 angka di belakang koma
    nilaiBerbobot: Number(nilaiBerbobot.toFixed(2)),
    kategoriSederhana: katSederhana,
    kategoriBerbobot: katBerbobot,
    status: tentukanStatus(katBerbobot),
  };
}

//menampilkan hasil perhitungan ke layar web berupa tabel dan kotak statistik
function tampilkanHasilKeLayar(hasilProses) {
  const containerHasil = document.getElementById("hasil");
  containerHasil.innerHTML = ""; // Bersihkan tampilan lama dulu

  //buat kepala tabel
  let htmlTabel = `
    <h2>Daftar Hasil Nilai Mahasiswa</h2>
    <table class="tabel-hasil">
      <thead>
        <tr>
          <th>Nama</th>
          <th>Rata Sederhana</th>
          <th>Kat. Sederhana</th>
          <th>Nilai Berbobot</th>
          <th>Kat. Berbobot</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
  `;

  //masukkan baris-baris data mahasiswa ke tabel + beri warna baris (Lulus/Remedial/Error)
  hasilProses.forEach((m) => {
    let rowClass = "";
    if (m.status === "Lulus") rowClass = "row-lulus";
    else if (m.status === "Tidak Lulus") rowClass = "row-tidaklulus";
    else rowClass = "row-error";

    htmlTabel += `
      <tr class="${rowClass}">
        <td>${m.nama}</td>
        <td>${m.rataSederhana}</td>
        <td>${m.kategoriSederhana}</td>
        <td>${m.nilaiBerbobot}</td>
        <td>${m.kategoriBerbobot}</td>
        <td>${m.status}</td>
      </tr>
    `;
  });

  htmlTabel += `</tbody></table>`;

  //mengumpulkan statistik satu kelas (khusus mahasiswa yang nilainya valid)
  const dataValid = hasilProses.filter(
    (m) => typeof m.nilaiBerbobot === "number",
  );

  if (dataValid.length > 0) {
    //cari nilai tertinggi, terendah, dan rata-rata sekelas
    const nilaiTertinggi = dataValid.reduce(
      (max, m) => (m.nilaiBerbobot > max ? m.nilaiBerbobot : max),
      dataValid[0].nilaiBerbobot,
    );
    const nilaiTerendah = dataValid.reduce(
      (min, m) => (m.nilaiBerbobot < min ? m.nilaiBerbobot : min),
      dataValid[0].nilaiBerbobot,
    );
    const totalNilaiKelas = dataValid.reduce(
      (acc, m) => acc + m.nilaiBerbobot,
      0,
    );
    const rataRataKelas = totalNilaiKelas / dataValid.length;
    const jumlahLulus = dataValid.filter((m) => m.status === "Lulus").length;
    const persentaseKelulusan = (
      (jumlahLulus / dataValid.length) *
      100
    ).toFixed(2);

    //cari siapa saja yang nilainya naik/turun huruf (misal dari B jadi A) gara-gara persentase bobot
    const mahasiswaBerubahKategori = dataValid.filter(
      (m) => m.kategoriSederhana !== m.kategoriBerbobot,
    );

    //buat tampilan kotak rangkuman statistik di bawah tabel
    htmlTabel += `
      <div class="ringkasan-box">
        <h3>Statistik Kelas</h3>
        <p>• <strong>Nilai Tertinggi:</strong> ${nilaiTertinggi}</p>
        <p>• <strong>Nilai Terendah:</strong> ${nilaiTerendah}</p>
        <p>• <strong>Rata-Rata Kelas:</strong> ${rataRataKelas.toFixed(2)}</p>
        <p>• <strong>Persentase Lulus:</strong> ${persentaseKelulusan}% (${jumlahLulus} dari ${dataValid.length} Mahasiswa)</p>
        <p>• <strong>Mahasiswa Berubah Kategori (Pembobotan):</strong> ${
          mahasiswaBerubahKategori.length > 0
            ? mahasiswaBerubahKategori
                .map(
                  (m) =>
                    `${m.nama} (${m.kategoriSederhana} →${m.kategoriBerbobot})`,
                )
                .join(", ")
            : "Tidak ada"
        }</p>
      </div>
    `;
  }

  //masukkan semua tampilan yang sudah dibuat ke layar web
  containerHasil.innerHTML = htmlTabel;
}

//saat tombol "Hitung" diklik oleh user
document.getElementById("tombolHitung").addEventListener("click", function () {
  const daftarElemenMahasiswa = document.querySelectorAll(".mahasiswa");

  //ambil data yang diketik user di form input
  const dataKelas = Array.from(daftarElemenMahasiswa).map((card, index) => {
    const nama =
      card.querySelector(".inputnama").value.trim() || `Mahasiswa ${index + 1}`;
    const rawTugas = card.querySelector(".inputtugas").value;
    const rawUts = card.querySelector(".inpututs").value;
    const rawUas = card.querySelector(".inputuas").value;

    return {
      nama: nama,
      tugas: rawTugas !== "" ? Number(rawTugas) : NaN,
      uts: rawUts !== "" ? Number(rawUts) : NaN,
      uas: rawUas !== "" ? Number(rawUas) : NaN,
    };
  });

  //jalankan proses perhitungan lalu tampilkan hasilnya di layar
  const hasilProses = dataKelas.map(buatHasilMahasiswa);
  tampilkanHasilKeLayar(hasilProses);
});
