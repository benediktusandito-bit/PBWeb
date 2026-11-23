const AppError = require("../utils/app-error.util");

module.exports = {
  validate: (schema) => (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");
      return next(new AppError(errorMessage, 400));
    }

    req.body = value;
    next();
  },
};
