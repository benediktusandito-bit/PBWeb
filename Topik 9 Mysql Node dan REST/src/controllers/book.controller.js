const BookService = require("../services/book.service");
const AppError = require("../utils/app-error.util");

class BookController {
  async getAllBooks(req, res, next) {
    try {
      const books = await BookService.getAllBooks();
      res
        .status(200)
        .json({ status: "success", results: books.length, data: { books } });
    } catch (error) {
      next(error);
    }
  }

  async createBook(req, res, next) {
    try {
      const { title, author_id, published_year, stock } = req.body;
      const bookId = await BookService.createBook(
        title,
        author_id,
        published_year,
        stock,
      );
      res.status(201).json({ status: "success", data: { id: bookId } });
    } catch (error) {
      next(error);
    }
  }

  async updateBook(req, res, next) {
    try {
      const { id } = req.params;
      const { title } = req.body;
      const updated = await BookService.updateBookTitle(id, title);
      if (!updated) return next(new AppError("Buku tidak ditemukan", 404));
      res
        .status(200)
        .json({ status: "success", message: "Judul buku berhasil diperbarui" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new BookController();
