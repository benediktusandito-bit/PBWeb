const mysql = require("mysql2/promise");
// Memuat variabel dari file .env
require("dotenv").config();

async function runMigration() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
  });

  console.log("🔄 Memulai proses migrasi...");

  await connection.query(
    `CREATE DATABASE IF NOT EXISTS \`${process.env.DB_NAME}\``,
  );

  await connection.changeUser({
    database: process.env.DB_NAME,
  });

  console.log(`✅ Database "${process.env.DB_NAME}" siap.`);
  await connection.query("DROP TABLE IF EXISTS books");
  await connection.query("DROP TABLE IF EXISTS authors");

  console.log("🗑️ Tabel lama dibersihkan.");

  const createAuthorsTable = `
    CREATE TABLE authors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL
    )
  `;

  await connection.query(createAuthorsTable);

  console.log("✅ Tabel authors berhasil dibuat.");

  // Membuat tabel 'books' sebagai tabel anak (child)
  // Kolom 'stock' bertipe INT dengan nilai bawaan 0
  // ON DELETE CASCADE membuat buku ikut terhapus otomatis jika penulisnya dihapus
  const createBooksTable = `
    CREATE TABLE books (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(150) NOT NULL,
      author_id INT,
      published_year INT,
      stock INT DEFAULT 0,
      FOREIGN KEY (author_id)
        REFERENCES authors(id)
        ON DELETE CASCADE
    )
  `;

  await connection.query(createBooksTable);

  console.log("✅ Tabel books berhasil dibuat.");

  await connection.end();

  console.log("🏁 Migrasi Selesai.");
}

runMigration().catch((err) => {
  console.error("❌ Migrasi Gagal:", err);
});
