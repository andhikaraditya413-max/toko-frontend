const API_URL = "https://toko-backend-production.up.railway.app/api/products";
let isEditMode = false;

// 1. Load semua produk dengan animasi Fade In
async function loadProducts() {
  try {
    const res = await fetch(API_URL);
    const products = await res.json();

    const table = document.getElementById("productsTable");
    table.innerHTML = "";

    products.forEach((p, index) => {
      const row = document.createElement("tr");
      // Menambahkan delay sedikit tiap baris agar muncul bergantian
      row.style.animationDelay = `${index * 0.05}s`;
      row.className = "animate__animated animate__fadeInDown border-b border-green-100 hover:bg-white/30 transition-colors";
      
      row.innerHTML = `
        <td class="p-3 border-r border-green-100">${p.id}</td>
        <td class="p-3 font-medium">${p.name}</td>
        <td class="p-3 text-green-800 font-bold">Rp ${p.price.toLocaleString()}</td>
        <td class="p-3 text-center space-x-2">
          <button onclick="startEdit(${p.id}, '${p.name}', ${p.price})"
            class="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded shadow-sm transform active:scale-90 transition-all">
            Edit
          </button>
          <button onclick="deleteProduct(this, ${p.id})"
            class="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded shadow-sm transform active:scale-90 transition-all">
            Hapus
          </button>
        </td>
      `;
      table.appendChild(row);
    });
  } catch (err) {
    console.error("Gagal load data:", err);
  }
}

// 2. Tambah / Update dengan Notifikasi Toast
async function submitProduct(e) {
  e.preventDefault();

  const id = document.getElementById("productId").value;
  const name = document.getElementById("name").value.trim();
  const price = document.getElementById("price").value;

  if (!name || !price) return;

  try {
    let res;
    if (isEditMode) {
      res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price: Number(price) })
      });
    } else {
      res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, price: Number(price) })
      });
    }

    if (!res.ok) throw new Error("Gagal");

    // Notifikasi Sukses
    Swal.fire({
      icon: 'success',
      title: isEditMode ? 'Data diperbarui!' : 'Produk ditambahkan!',
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true
    });

    resetForm();
    loadProducts();
  } catch (err) {
    Swal.fire('Error', 'Gagal menyimpan data', 'error');
  }
}

// 3. Hapus dengan Animasi Slide Out
async function deleteProduct(btn, id) {
  const result = await Swal.fire({
    title: 'Hapus produk?',
    text: "Tindakan ini tidak bisa dibatalkan!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Hapus!',
    cancelButtonText: 'Batal'
  });

  if (result.isConfirmed) {
    try {
      const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Gagal hapus");

      // Animasi baris menghilang ke samping
      const row = btn.closest('tr');
      row.classList.remove('animate__fadeInDown');
      row.classList.add('animate__fadeOutRight');
      
      setTimeout(() => {
        loadProducts();
        Swal.fire({
          icon: 'success',
          title: 'Terhapus!',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 1500
        });
      }, 500);
    } catch (err) {
      Swal.fire('Error', 'Gagal menghapus produk', 'error');
    }
  }
}

// 4. Masuk mode edit dengan animasi Focus
function startEdit(id, name, price) {
  isEditMode = true;
  const formBox = document.getElementById("formTitle").parentElement;
  
  // Beri animasi getar/highlight pada form saat masuk mode edit
  formBox.classList.add('animate__animated', 'animate__pulse', 'ring-2', 'ring-blue-400');
  setTimeout(() => formBox.classList.remove('animate__pulse', 'ring-2', 'ring-blue-400'), 1000);

  document.getElementById("productId").value = id;
  document.getElementById("name").value = name;
  document.getElementById("price").value = price;

  document.getElementById("formTitle").innerText = "📝 Edit Produk";
  document.getElementById("submitBtn").innerText = "Update Data";
  document.getElementById("submitBtn").classList.replace("bg-blue-500", "bg-orange-500");
  document.getElementById("cancelEditBtn").classList.remove("hidden");
}

function resetForm() {
  isEditMode = false;
  document.getElementById("productId").value = "";
  document.getElementById("productForm").reset();
  document.getElementById("formTitle").innerText = "Tambah Produk";
  document.getElementById("submitBtn").innerText = "Simpan";
  document.getElementById("submitBtn").classList.replace("bg-orange-500", "bg-blue-500");
  document.getElementById("cancelEditBtn").classList.add("hidden");
}

document.getElementById("productForm").addEventListener("submit", submitProduct);
document.getElementById("cancelEditBtn").addEventListener("click", resetForm);

loadProducts();