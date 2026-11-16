const { createApp } = require("./app");

createApp().listen(3000, "127.0.0.1", () => {
  console.log("API aktif di http://127.0.0.1:3000/api/products");
});
