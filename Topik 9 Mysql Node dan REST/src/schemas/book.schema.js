const Joi = require("joi");

const createBookSchema = Joi.object({
  title: Joi.string().max(150).required(),
  author_id: Joi.number().integer().required(),
  published_year: Joi.number()
    .integer()
    .min(1000)
    .max(new Date().getFullYear()),
  stock: Joi.number().integer().min(0).default(0),
});

const updateBookSchema = Joi.object({
  title: Joi.string().max(150).required(),
});

module.exports = { createBookSchema, updateBookSchema };
