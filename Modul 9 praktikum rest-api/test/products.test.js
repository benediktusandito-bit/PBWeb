const assert = require("node:assert/strict");
const { once } = require("node:events");
const { test, beforeEach, afterEach } = require("node:test");
const { createApp } = require("../src/app");

let server;
let base;
// Tambahkan stock pada objek produk dasar
const product = { name: "Mouse", price: 75000, stock: 10 };

beforeEach(async () => {
  server = createApp().listen(0, "127.0.0.1");
  await once(server, "listening");
  base = "http://127.0.0.1:" + server.address().port;
});

afterEach(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

function request(method, path = "", body) {
  const options = { method };
  if (body !== undefined) {
    options.headers = { "Content-Type": "application/json" };
    options.body = JSON.stringify(body);
  }
  return fetch(base + "/api/products" + path, options);
}

async function expectError(response, status, code) {
  assert.equal(response.status, status);
  const { error } = await response.json();
  assert.equal(error.code, code);
  return error;
}

async function seed() {
  const response = await request("POST", "", product);
  assert.equal(response.status, 201);
  assert.equal(response.headers.get("location"), "/api/products/1");
  assert.deepEqual(await response.json(), { data: { id: 1, ...product } });
}

test("GET membaca daftar kosong, daftar terisi, dan detail", async () => {
  const empty = await request("GET");
  assert.equal(empty.status, 200);
  assert.deepEqual(await empty.json(), { data: [] });
  await seed();
  const list = await request("GET");
  assert.equal(list.status, 200);
  assert.deepEqual(await list.json(), { data: [{ id: 1, ...product }] });
  const item = await request("GET", "/1");
  assert.equal(item.status, 200);
  assert.deepEqual(await item.json(), { data: { id: 1, ...product } });
});

test("POST membuat produk dan mengembalikan Location", seed);

test("PUT mengganti field lengkap dan menolak field yang kurang", async () => {
  await seed();
  const fields = { name: "Keyboard", price: 120000, stock: 5 };
  const response = await request("PUT", "/1", fields);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { data: { id: 1, ...fields } });
  await expectError(
    await request("PUT", "/1", { price: 1, stock: 5 }), // Kurang 'name'
    400,
    "INVALID_INPUT",
  );
  const item = await request("GET", "/1");
  assert.deepEqual(await item.json(), { data: { id: 1, ...fields } });
});

test("PATCH mengubah harga saja dan mempertahankan stock, serta menolak objek kosong", async () => {
  await seed();
  // Mengubah harga saja (stock: 10 sebelumnya harus tetap dipertahankan)
  const response = await request("PATCH", "/1", { price: 50000 });
  assert.equal(response.status, 200);
  const expected = { data: { id: 1, name: "Mouse", price: 50000, stock: 10 } };
  assert.deepEqual(await response.json(), expected);

  await expectError(await request("PATCH", "/1", {}), 400, "INVALID_INPUT");
  const item = await request("GET", "/1");
  assert.deepEqual(await item.json(), expected);
});

test("Stock dapat bernilai 0 dan nilai negatif ditolak", async () => {
  // Uji stock bernilai 0 (harus berhasil)
  const resZero = await request("POST", "", {
    name: "Pen",
    price: 3000,
    stock: 0,
  });
  assert.equal(resZero.status, 201);
  const resZeroJson = await resZero.json();
  assert.equal(resZeroJson.data.stock, 0);

  // Uji stock bernilai negatif (harus ditolak)
  const resNeg = await request("POST", "", {
    name: "Book",
    price: 5000,
    stock: -2,
  });
  await expectError(resNeg, 400, "INVALID_INPUT");
});

test("DELETE mengembalikan 204 dan produk tidak bisa dibaca lagi", async () => {
  await seed();
  const response = await request("DELETE", "/1");
  assert.equal(response.status, 204);
  assert.equal(await response.text(), "");
  await expectError(await request("GET", "/1"), 404, "PRODUCT_NOT_FOUND");
});

test("Input tidak valid, termasuk field tambahan, ditolak", async () => {
  const response = await request("POST", "", {
    id: 99,
    name: "   ",
    price: "75000",
    stock: 5,
  });
  const error = await expectError(response, 400, "INVALID_INPUT");
  assert.equal(error.details.length, 3);
  await expectError(await request("GET", "/1.5"), 400, "INVALID_ID");
});

test("JSON rusak, tipe body, dan batas ukuran ditangani", async () => {
  const url = base + "/api/products";
  const send = (type, body) =>
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": type },
      body,
    });
  await expectError(
    await send("application/json", '{"name":'),
    400,
    "INVALID_JSON",
  );
  await expectError(
    await send("text/plain", "Mouse"),
    415,
    "UNSUPPORTED_MEDIA_TYPE",
  );
  const large = JSON.stringify({ name: "x".repeat(17000), price: 1, stock: 1 });
  await expectError(
    await send("application/json", large),
    413,
    "BODY_TOO_LARGE",
  );
});

test("Produk dan rute yang tidak ditemukan memiliki kode berbeda", async () => {
  await expectError(await request("GET", "/999"), 404, "PRODUCT_NOT_FOUND");
  await expectError(
    await request("PUT", "/999", product),
    404,
    "PRODUCT_NOT_FOUND",
  );
  await expectError(
    await request("PATCH", "/999", { price: 1 }),
    404,
    "PRODUCT_NOT_FOUND",
  );
  await expectError(await request("DELETE", "/999"), 404, "PRODUCT_NOT_FOUND");
  await expectError(await fetch(base + "/api/unknown"), 404, "ROUTE_NOT_FOUND");
});
