import React from "react";
import ReactDOM from "react-dom/client"; // Mengimpor ReactDOM
import App from "./App.jsx"; // Mengimpor App.jsx yang berisi gabungan seluruh tugas

// Menghubungkan React ke elemen HTML <div id="root"> yang ada di file index.html
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    {/* Menampilkan komponen utama (App) di dalam layar browser */}
    <App />
  </React.StrictMode>,
);
