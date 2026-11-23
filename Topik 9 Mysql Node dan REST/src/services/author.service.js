const pool = require("../config/db");

class AuthorService {
  async createAuthor(name, email) {
    const sql = "INSERT INTO authors (name, email) VALUES (?, ?)";
    const [result] = await pool.execute(sql, [name, email]);
    return result.insertId;
  }

  async deleteAuthor(id) {
    const sql = "DELETE FROM authors WHERE id = ?";
    const [result] = await pool.execute(sql, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = new AuthorService();
