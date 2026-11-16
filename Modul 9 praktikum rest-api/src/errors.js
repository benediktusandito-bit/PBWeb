class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function notFound(req, res, next) {
  next(new ApiError(404, "ROUTE_NOT_FOUND", "Rute tidak ditemukan."));
}

function errorHandler(err, req, res, next) {
  if (res.headersSent) return next(err);

  let error = err;
  if (err.type === "entity.parse.failed") {
    error = new ApiError(400, "INVALID_JSON", "JSON tidak valid.");
  } else if (err.type === "entity.too.large") {
    error = new ApiError(413, "BODY_TOO_LARGE", "Body melebihi batas.");
  } else if (err.status === 415) {
    error = new ApiError(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "Tipe atau encoding body tidak didukung.",
    );
  } else if (!(err instanceof ApiError) && err.status === 400) {
    error = new ApiError(400, "BAD_REQUEST", "Request tidak valid.");
  } else if (!(err instanceof ApiError)) {
    console.error(err);
    error = new ApiError(500, "INTERNAL_ERROR", "Terjadi kesalahan server.");
  }

  const { code, message, details } = error;
  return res.status(error.status).json({ error: { code, message, details } });
}

module.exports = { ApiError, notFound, errorHandler };
