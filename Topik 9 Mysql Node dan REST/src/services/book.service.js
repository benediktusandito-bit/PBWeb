const pool = require("../config/db");

class BookService {
  async getAllBooks() {
    const sql = `
            SELECT books.id, books.title, books.published_year, books.stock, authors.name AS author_name 
            FROM books 
            JOIN authors ON books.author_id = authors.id
        `;
    const [rows] = await pool.execute(sql);
    return rows;
  }

  async createBook(title, author_id, published_year, stock) {
    const sql =
      "INSERT INTO books (title, author_id, published_year, stock) VALUES (?, ?, ?, ?)";
    const [result] = await pool.execute(sql, [
      title,
      author_id,
      published_year,
      stock,
    ]);
    return result.insertId;
  }

  async updateBookTitle(id, title) {
    const sql = "UPDATE books SET title = ? WHERE id = ?";
    const [result] = await pool.execute(sql, [title, id]);
    return result.affectedRows > 0;
  }
}

module.exports = new BookService();
