const express = require("express");
const { createProductRouter } = require("./routes");
const { createProductService } = require("./service");
const { notFound, errorHandler } = require("./errors");

function createApp() {
  const app = express();
  app.use(express.json({ limit: "16kb" }));
  app.use("/api/products", createProductRouter(createProductService()));
  app.use(notFound);
  app.use(errorHandler);
  return app;
}

module.exports = { createApp };
