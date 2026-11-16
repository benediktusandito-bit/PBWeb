const { Router } = require("express");
const { createProductController } = require("./controller");
const { validateId, validateProduct } = require("./validation");

function createProductRouter(service) {
  const router = Router();
  const controller = createProductController(service);

  router.get("/", controller.list);
  router.get("/:id", validateId, controller.find);
  router.post("/", validateProduct(), controller.create);
  router.put("/:id", validateId, validateProduct(), controller.replace);
  router.patch(
    "/:id",
    validateId,
    validateProduct({ partial: true }),
    controller.update,
  );
  router.delete("/:id", validateId, controller.remove);
  return router;
}

module.exports = { createProductRouter };
