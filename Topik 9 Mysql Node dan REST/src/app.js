const express = require("express");
const AuthorController = require("./controllers/author.controller");
const BookController = require("./controllers/book.controller");
const { errorHandler } = require("./middlewares/error.middleware");
const { validate } = require("./middlewares/validate.middleware");
const { createAuthorSchema } = require("./schemas/author.schema");
const { createBookSchema, updateBookSchema } = require("./schemas/book.schema");
const AppError = require("./utils/app-error.util");

const app = express();
app.use(express.json());

app.get("/api/v1/books", BookController.getAllBooks);
app.post(
  "/api/v1/books",
  validate(createBookSchema),
  BookController.createBook,
);
app.patch(
  "/api/v1/books/:id",
  validate(updateBookSchema),
  BookController.updateBook,
);
app.post(
  "/api/v1/authors",
  validate(createAuthorSchema),
  AuthorController.createAuthor,
);
app.delete("/api/v1/authors/:id", AuthorController.deleteAuthor);

app.all("{*splat}", (req, res, next) => {
  next(new AppError(`Resource URL ${req.originalUrl} tidak ditemukan`, 404));
});

app.use(errorHandler);

module.exports = app;
