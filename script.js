const API_URL = "http://localhost:3000/api/products";

let isEditMode = false;

// Load semua produk
async function loadProducts() {
  try {
    const res = await fetch(API_URL);
    const products = await res.json();

    const table = document.getElementById("productsTable");
    table.innerHTML = "";

    products.forEach(p => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td class="border p-2">${p.id}</td>
        <td class="border p-2">${p.name}</td>
        <td class="border p-2">Rp ${p.price}</td>
        <td class="border p-2 text-center space-x-1">
          <button onclick="startEdit(${p.id}, '${p.name}', ${p.price})"
            class="bg-yellow-400 hover:bg-yellow-500 text-white px-2 py-1 rounded text-sm">
            Edit
          </button>
          <button onclick="deleteProduct(${p.id})"
            class="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm">
            Hapus
          </button>
        </td>
      `;
      table.appendChild(row);
    });
  } catch (err) {
    console.error("Gagal load data:", err);
    alert("Gagal mengambil data dari server");
  }
}

// Tambah / Update produk
async function submitProduct(e) {
  e.preventDefault();

  const id = document.getElementById("productId").value;
  const name = document.getElementById("name").value.trim();
  const price = document.getElementById("price").value;

  if (!name || !price) {
    alert("Nama dan harga wajib diisi!");
    return;
  }

  try {
    if (isEditMode) {
      // UPDATE
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price)
        })
      });

      if (!res.ok) throw new Error("Gagal update");
    } else {
      // CREATE
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          price: Number(price)
        })
      });

      if (!res.ok) throw new Error("Gagal simpan");
    }

    resetForm();
    loadProducts();
  } catch (err) {
    console.error("Gagal submit:", err);
    alert("Gagal menyimpan perubahan");
  }
}

// Hapus produk
async function deleteProduct(id) {
  if (!confirm("Hapus produk ini?")) return;

  try {
    const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Gagal hapus");
    loadProducts();
  } catch (err) {
    console.error("Gagal hapus:", err);
    alert("Gagal menghapus produk");
  }
}

// Masuk mode edit
function startEdit(id, name, price) {
  isEditMode = true;

  document.getElementById("productId").value = id;
  document.getElementById("name").value = name;
  document.getElementById("price").value = price;

  document.getElementById("formTitle").innerText = "Edit Produk";
  document.getElementById("submitBtn").innerText = "Update";
  document.getElementById("cancelEditBtn").classList.remove("hidden");
}

// Reset form
function resetForm() {
  isEditMode = false;

  document.getElementById("productId").value = "";
  document.getElementById("productForm").reset();

  document.getElementById("formTitle").innerText = "Tambah Produk";
  document.getElementById("submitBtn").innerText = "Simpan";
  document.getElementById("cancelEditBtn").classList.add("hidden");
}

document
  .getElementById("productForm")
  .addEventListener("submit", submitProduct);

document
  .getElementById("cancelEditBtn")
  .addEventListener("click", resetForm);

// Load awal
loadProducts();
