const { ApiError } = require("./errors");

function validateId(req, res, next) {
  const raw = req.params.id;
  const id = Number(raw);
  if (!/^[1-9][0-9]*$/.test(raw) || !Number.isSafeInteger(id)) {
    throw new ApiError(400, "INVALID_ID", "ID harus bilangan bulat positif.");
  }
  res.locals.id = id;
  next();
}

function validateProduct({ partial = false } = {}) {
  return (req, res, next) => {
    if (!req.is("application/json")) {
      throw new ApiError(
        415,
        "UNSUPPORTED_MEDIA_TYPE",
        "Gunakan Content-Type application/json dan kirim body.",
      );
    }

    const body = req.body;
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      throw new ApiError(400, "INVALID_INPUT", "Body harus objek JSON.");
    }

    const keys = Object.keys(body);
    const details = [];
    if (!keys.length) details.push("Kirim minimal satu field.");
    for (const key of keys) {
      // ini juga ditambahkan stock agar field stock bisa diterima
      if (!["name", "price", "stock"].includes(key)) {
        details.push("Field tidak dikenal: " + key);
      }
    }

    if (!partial || Object.hasOwn(body, "name")) {
      if (
        typeof body.name !== "string" ||
        !body.name.trim() ||
        body.name.trim().length > 80
      ) {
        details.push("name harus berisi 1 sampai 80 karakter.");
      }
    }
    if (!partial || Object.hasOwn(body, "price")) {
      if (!Number.isSafeInteger(body.price) || body.price < 0) {
        details.push("price harus berupa bilangan bulat nonnegatif.");
      }
    }

    // Validasi untuk stock
    if (!partial || Object.hasOwn(body, "stock")) {
      if (!Number.isSafeInteger(body.stock) || body.stock < 0) {
        details.push("stock harus berupa bilangan bulat nonnegatif.");
      }
    }

    if (details.length) {
      throw new ApiError(400, "INVALID_INPUT", "Validasi gagal.", details);
    }

    const fields = {};
    if (Object.hasOwn(body, "name")) fields.name = body.name.trim();
    if (Object.hasOwn(body, "price")) fields.price = body.price;
    if (Object.hasOwn(body, "stock")) fields.stock = body.stock; // Untuk simpan stock
    res.locals.fields = fields;
    next();
  };
}

module.exports = { validateId, validateProduct };
