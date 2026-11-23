const Joi = require("joi");

const createAuthorSchema = Joi.object({
  name: Joi.string().max(100).required(),
  email: Joi.string().email().max(100).required(),
});

module.exports = { createAuthorSchema };
