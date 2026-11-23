const pool = require("./db");

// Mengambil ID penulis berdasarkan email jika sudah ada, atau insert baru jika belum ada
async function getOrCreateAuthor(name, email) {
  const [existing] = await pool.execute(
    "SELECT id FROM authors WHERE email = ?",
    [email],
  );

  if (existing.length > 0) {
    return existing[0].id;
  }

  const [result] = await pool.execute(
    "INSERT INTO authors (name, email) VALUES (?, ?)",
    [name, email],
  );
  return result.insertId;
}

// Operasi UPDATE: memperbarui judul buku berdasarkan id
async function updateBookTitle(bookId, newTitle) {
  const sql = "UPDATE books SET title = ? WHERE id = ?";
  const [result] = await pool.execute(sql, [newTitle, bookId]);
  console.log(
    `✏️ Update buku ID ${bookId}: ${result.affectedRows} baris terpengaruh.`,
  );
}

// Operasi DELETE: menghapus penulis berdasarkan id
async function deleteAuthorById(authorId) {
  const sql = "DELETE FROM authors WHERE id = ?";
  const [result] = await pool.execute(sql, [authorId]);
  console.log(
    `🗑️ Hapus penulis ID ${authorId}: ${result.affectedRows} baris terpengaruh.`,
  );
}

async function main() {
  try {
    // INSERT DATA PENULIS & BUKU (termasuk kolom stock)
    console.log("\n--- Menyiapkan Data Penulis ---");
    const authorId = await getOrCreateAuthor(
      "Tere Liye",
      "tereliye@example.com",
    );
    console.log(`✅ Penulis siap dengan ID: ${authorId}`);

    console.log("\n--- Menambahkan Data Buku ---");
    const insertBookSql =
      "INSERT INTO books (title, author_id, published_year, stock) VALUES (?, ?, ?, ?)";
    const [book1] = await pool.execute(insertBookSql, [
      "Bumi",
      authorId,
      2014,
      10,
    ]);
    await pool.execute(insertBookSql, ["Bulan", authorId, 2015, 5]);
    await pool.execute(insertBookSql, ["Matahari", authorId, 2016, 8]);
    console.log("✅ Buku-buku berhasil ditambahkan.");

    // SELECT DATA DENGAN JOIN
    console.log("\n--- Data Buku dan Penulis (Sebelum Update) ---");
    const selectJoinSql = `
      SELECT books.id, books.title, books.published_year, books.stock, authors.name AS author_name
      FROM books
      JOIN authors ON books.author_id = authors.id
    `;
    const [booksBeforeUpdate] = await pool.execute(selectJoinSql);
    console.table(booksBeforeUpdate);

    // UPDATE JUDUL BUKU BERDASARKAN ID
    console.log("\n--- Memperbarui Judul Buku ---");
    await updateBookTitle(book1.insertId, "Bumi (Edisi Revisi)");

    const [booksAfterUpdate] = await pool.execute(selectJoinSql);
    console.table(booksAfterUpdate);

    // FILTER AMAN BERDASARKAN TAHUN TERBIT
    console.log("\n--- Mencari Buku Berdasarkan Tahun Terbit ---");
    const searchYear = 2014;
    const [filteredBooks] = await pool.execute(
      "SELECT * FROM books WHERE published_year = ?",
      [searchYear],
    );
    console.log(`Buku yang terbit tahun ${searchYear}:`, filteredBooks);

    // DELETE PENULIS BERDASARKAN ID
    console.log("\n--- Menghapus Data Penulis ---");
    await deleteAuthorById(authorId);
    const [booksAfterDelete] = await pool.execute("SELECT * FROM books");
    console.table(booksAfterDelete);
  } catch (error) {
    console.error("❌ Terjadi kesalahan operasi database:", error);
  } finally {
    await pool.end();
    console.log("\n🔒 Koneksi database ditutup dengan aman.");
  }
}

main();
