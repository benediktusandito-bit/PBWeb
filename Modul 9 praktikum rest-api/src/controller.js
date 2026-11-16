function createProductController(service) {
  return {
    list(req, res) {
      res.json({ data: service.list() });
    },
    find(req, res) {
      res.json({ data: service.find(res.locals.id) });
    },
    create(req, res) {
      const product = service.create(res.locals.fields);
      res.location("/api/products/" + product.id);
      res.status(201).json({ data: product });
    },
    replace(req, res) {
      const product = service.replace(res.locals.id, res.locals.fields);
      res.json({ data: product });
    },
    update(req, res) {
      const product = service.update(res.locals.id, res.locals.fields);
      res.json({ data: product });
    },
    remove(req, res) {
      service.remove(res.locals.id);
      res.status(204).end();
    },
  };
}

module.exports = { createProductController };
