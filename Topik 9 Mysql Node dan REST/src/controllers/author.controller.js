const AuthorService = require("../services/author.service");
const AppError = require("../utils/app-error.util");

class AuthorController {
  async createAuthor(req, res, next) {
    try {
      const { name, email } = req.body;
      const authorId = await AuthorService.createAuthor(name, email);
      res.status(201).json({ status: "success", data: { id: authorId } });
    } catch (error) {
      next(error);
    }
  }

  async deleteAuthor(req, res, next) {
    try {
      const { id } = req.params;
      const deleted = await AuthorService.deleteAuthor(id);
      if (!deleted)
        return next(new AppError("Data penulis tidak ditemukan", 404));
      res
        .status(200)
        .json({
          status: "success",
          message: "Penulis berhasil dihapus beserta bukunya",
        });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthorController();
