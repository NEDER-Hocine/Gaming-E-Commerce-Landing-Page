// Admin Dashboard Functions
window.Admin = {
  // =======================
  // Products
  // =======================
  async fetchProducts() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    try {
      const products = await window.Utils.ajax("/admin/products/list.php", "POST", { user });
      this.products = products;
      this.renderProducts();
    } catch (err) {
      console.error(err);
      Toasts.show("Failed to load products", "error");
    }
  },

  renderProducts() {
    const tbody = document.getElementById("adminProductsList");
    if (!tbody || !this.products) return;

    tbody.innerHTML = this.products.map(product => `
      <tr>
        <td>
          <div class="product-cell">
            <img src="../img_prod/${product.primary_image}" alt="${product.title}" class="product-thumb">
            <span>${product.title}</span>
          </div>
        </td>
        <td>${product.vendor_id || "N/A"}</td>
        <td>${product.category_slug}</td>
        <td>$${parseFloat(product.price).toFixed(2)}</td>
        <td>
          <span class="badge ${product.stock > 10 ? "badge-success" : "badge-warning"}">
            ${product.stock}
          </span>
        </td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="Admin.editProduct('${product.id}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="Admin.deleteProduct('${product.id}')">Delete</button>
        </td>
      </tr>
    `).join('');

    // Update total products
    const totalProductsEl = document.getElementById("totalProducts");
    if (totalProductsEl) totalProductsEl.textContent = this.products.length;
  },

  async deleteProduct(productId) {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const user = Auth.getCurrentUser();
    try {
      const data = await window.Utils.ajax("/admin/products/delete.php", "POST", { user, product_id: productId });
      if (data.message) {
        Toasts.show(data.message, "success");
        await this.fetchProducts(); // reload
      } else {
        Toasts.show("Failed to delete product", "error");
      }
    } catch (err) {
      console.error(err);
      Toasts.show("Error deleting product", "error");
    }
  },

  editProduct(productId) {
    Toasts.show("Edit product functionality coming soon", "info");
    console.log("Edit product ID:", productId);
  },

  // =======================
  // Users
  // =======================
  async fetchUsers() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    try {
      this.users = await window.Utils.ajax("/admin/users/list.php", "POST", { user });
      this.renderUsers();
    } catch (err) {
      console.error(err);
      Toasts.show("Failed to load users", "error");
    }
  },

  renderUsers() {
    const tbody = document.querySelector("#section-users tbody");
    if (!tbody || !this.users) return;

    tbody.innerHTML = this.users.map(u => `
      <tr>
        <td>${u.id}</td>
        <td>${u.display_name}</td>
        <td>${u.email}</td>
        <td><span class="badge badge-${u.role === 'admin' ? 'danger' : u.role === 'seller' ? 'warning' : 'info'}">${u.role}</span></td>
        <td>${u.created_at.split(" ")[0]}</td>
        <td><span class="badge badge-success">Active</span></td>
        <td>
          <button class="btn btn-sm btn-secondary" onclick="Admin.editUser('${u.id}')">Edit</button>
          ${u.role !== 'admin' ? `<button class="btn btn-sm btn-danger" onclick="Admin.deleteUser('${u.id}')">Ban</button>` : ''}
        </td>
      </tr>
    `).join('');
  },

  async deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const user = Auth.getCurrentUser();
    try {
      const data = await window.Utils.ajax("/admin/users/delete.php", "POST", { user, user_id: userId });
      if (data.message) {
        Toasts.show(data.message, "success");
        await this.fetchUsers(); // reload
      } else {
        Toasts.show("Failed to delete user", "error");
      }
    } catch (err) {
      console.error(err);
      Toasts.show("Error deleting user", "error");
    }
  },

  editUser(userId) {
    Toasts.show("Edit user functionality coming soon", "info");
    console.log("Edit user ID:", userId);
  },

  // =======================
  // Orders
  // =======================
  async fetchOrders() {
    const user = Auth.getCurrentUser();
    if (!user) return;

    try {
      this.orders = await window.Utils.ajax("/admin/orders/list.php", "POST", { user });
      this.renderOrders();
    } catch (err) {
      console.error(err);
      Toasts.show("Failed to load orders", "error");
    }
  },

  renderOrders() {
    const tbody = document.querySelector("#section-orders tbody");
    if (!tbody || !this.orders) return;

    tbody.innerHTML = this.orders.map(o => `
      <tr>
        <td>${o.id}</td>
        <td>${o.user_id}</td>
        <td>${o.vendor_id || "N/A"}</td>
        <td>${o.products.map(p => p.title).join(", ")}</td>
        <td>$${parseFloat(o.total_amount).toFixed(2)}</td>
        <td>${o.created_at.split(" ")[0]}</td>
        <td><span class="badge badge-${o.status === 'pending' ? 'warning' : o.status === 'completed' ? 'success' : 'info'}">${o.status}</span></td>
      </tr>
    `).join('');
  },

  // =======================
  // Stats
  // =======================
  async fetchStats() {
    await this.fetchUsers();
    await this.fetchOrders();
    await this.fetchProducts();

    const orders = this.orders || [];
    const users = this.users || [];
    const products = this.products || [];

    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_amount || 0), 0);
    const pendingOrders = orders.filter(o => o.status === "pending").length;

    document.getElementById("totalProducts").textContent = products.length;
    // You can add other stats like totalRevenue, totalUsers dynamically here
  }
};

// =======================
// Init
// =======================
document.addEventListener("DOMContentLoaded", async function () {
  const user = Auth.getCurrentUser();
  if (!user || user.role !== "admin") window.location.href = "login.html";
  document.getElementById("userName").textContent = user.display_name || user.name;

  // Fetch all data
  await window.Admin.fetchStats();

  // Sidebar navigation
  const sidebarLinks = document.querySelectorAll(".sidebar-link");
  const sections = document.querySelectorAll(".dashboard-section");

  function showSection(sectionName) {
    sections.forEach(section => {
      section.classList.remove("active");
      if (section.id === `section-${sectionName}`) section.classList.add("active");
    });
    sidebarLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("data-section") === sectionName) link.classList.add("active");
    });
  }

  sidebarLinks.forEach(link => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const section = this.getAttribute("data-section");
      showSection(section);
    });
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", function () {
    Auth.logout();
    window.location.href = "login.html";
  });

  // User menu toggle
  document.getElementById("userMenuBtn").addEventListener("click", function () {
    document.getElementById("userDropdown").classList.toggle("show");
  });
});