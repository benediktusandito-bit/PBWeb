import { useEffect } from "react";
import {
  Link,
  NavLink,
  Route,
  Routes,
  useParams,
  useSearchParams,
} from "react-router";
import { useFavorites } from "./hooks/useFavorites";

const PRODUCTS = [
  { id: 1, name: "Buku React", price: 85000, category: "Buku" },
  { id: 2, name: "Buku Web", price: 70000, category: "Buku" },
  { id: 3, name: "Keyboard", price: 150000, category: "Elektronik" },
  { id: 4, name: "Mouse", price: 90000, category: "Elektronik" },
];

const rupiah = (value) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

export default function App() {
  const { ids, storageError } = useFavorites();
  return (
    <>
      <header>
        <h1>Katalog Praktikum</h1>
        <nav aria-label="Navigasi utama">
          <NavLink to="/" end>
            Beranda
          </NavLink>
          <NavLink to="/products">Produk</NavLink>
          <NavLink to="/favorites">Favorit ({ids.length})</NavLink>
          <NavLink to="/about">Tentang</NavLink>
        </nav>
      </header>
      <main>
        {storageError && <p role="alert">{storageError}</p>}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Catalog />} />
          <Route path="/products/:id" element={<Detail />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/about" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </>
  );
}

function usePageTitle(title) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}

function Home() {
  usePageTitle("Beranda Katalog");
  return (
    <section>
      <h2>Selamat datang</h2>
      <p>Pilih produk dan simpan sebagai favorit.</p>
      <Link to="/products">Buka katalog</Link>
    </section>
  );
}

function ProductCard({ product }) {
  const { ids, toggle } = useFavorites();
  const selected = ids.includes(product.id);
  return (
    <article className="card">
      <h3>
        <Link to={`/products/${product.id}`}>{product.name}</Link>
      </h3>
      <p>{rupiah(product.price)}</p>
      <p style={{ fontSize: "0.85rem", color: "#666" }}>
        Kategori: {product.category}
      </p>
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => toggle(product.id)}
      >
        {selected ? "Hapus favorit" : "Tambah favorit"}
      </button>
    </article>
  );
}

function Catalog() {
  usePageTitle("Katalog Produk");
  const [params, setParams] = useSearchParams();
  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";

  const filtered = PRODUCTS.filter((product) => {
    const matchName = product.name.toLowerCase().includes(q.toLowerCase());
    const matchCategory = category ? product.category === category : true;
    return matchName && matchCategory;
  });

  function updateParam(key, value, replace = true) {
    const next = new URLSearchParams(params);
    if (value) {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    setParams(next, { replace });
  }

  return (
    <section>
      <h2>Produk</h2>

      <div style={{ marginBottom: "15px", display: "flex", gap: "8px" }}>
        <span>Filter:</span>
        <button type="button" onClick={() => updateParam("category", "")}>
          Semua
        </button>
        <button type="button" onClick={() => updateParam("category", "Buku")}>
          Buku
        </button>
        <button
          type="button"
          onClick={() => updateParam("category", "Elektronik")}
        >
          Elektronik
        </button>
      </div>

      <label htmlFor="search">Cari produk</label>
      <input
        id="search"
        value={q}
        onChange={(event) => updateParam("q", event.target.value)}
        placeholder="Contoh Buku"
      />
      <button
        type="button"
        onClick={() => {
          const next = new URLSearchParams(params);
          next.delete("q");
          setParams(next, { replace: true });
        }}
      >
        Reset pencarian
      </button>

      <p>{filtered.length} produk ditemukan</p>
      <div className="grid">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {filtered.length === 0 && <p>Produk tidak ditemukan.</p>}
    </section>
  );
}

function Detail() {
  const { id } = useParams();
  const product = PRODUCTS.find((item) => String(item.id) === id);
  usePageTitle(product ? product.name : "Produk tidak ditemukan");
  return (
    <section>
      <h2>Detail produk</h2>
      {product ? (
        <ProductCard product={product} />
      ) : (
        <p>ID produk tidak tersedia.</p>
      )}
      <Link to="/products">Kembali ke katalog</Link>
    </section>
  );
}

function Favorites() {
  usePageTitle("Produk Favorit");
  const { ids, toggle } = useFavorites();
  const selected = PRODUCTS.filter((item) => ids.includes(item.id));

  return (
    <section>
      <h2>Produk favorit</h2>

      {selected.length > 0 && (
        <div style={{ marginBottom: "15px" }}>
          <button
            type="button"
            onClick={() => {
              ids.forEach((id) => toggle(id));
            }}
            style={{
              backgroundColor: "#dc3545",
              color: "white",
              padding: "8px 12px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Hapus Semua Favorit
          </button>
        </div>
      )}

      <div className="grid">
        {selected.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {selected.length === 0 && <p>Belum ada produk favorit.</p>}
    </section>
  );
}

function About() {
  usePageTitle("Tentang Aplikasi");
  return (
    <section>
      <h2>Tentang Aplikasi</h2>
      <p>Aplikasi ini menggunakan React, Vite, dan React Router.</p>
      <p>
        Fiturnya adalah penyimpanan LocalStorage, filter pencarian, serta
        pengelolaan produk favorit.
      </p>
      <p>
        <Link to="/">Kembali ke beranda</Link>
      </p>
    </section>
  );
}

function NotFound() {
  usePageTitle("Halaman tidak ditemukan");
  return (
    <section>
      <h2>Halaman tidak ditemukan</h2>
      <Link to="/">Kembali ke beranda</Link>
    </section>
  );
}
