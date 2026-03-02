// Wishlist Manager — Backend Version
window.Wishlist = {
  items: [], // Stores full product objects

  // Fetch wishlist from backend
  async fetch() {
    const user = window.Auth.getCurrentUser();
    if (!user?.id) return;
    try {
      const data = await window.Utils.ajax(`/wishlist/list.php?user_id=${user.id}`);
      this.items = data;
      this.updateBadge();
      this.render(); // Optional: call render function to show wishlist products
    } catch (err) {
      console.error("Failed to fetch wishlist:", err);
    }
  },

  // Add item to wishlist
  async add(productId) {
    const user = window.Auth.getCurrentUser();
    if (!user?.id) return;
    try {
      const data = await window.Utils.ajax("/wishlist/add.php", "POST", { user_id: user.id, product_id: productId });
      window.Utils.showToast(data.message, "success");
      await this.fetch();
      return true;
    } catch (err) {
      console.error("Failed to add to wishlist:", err);
      // Optional: show error toast
      return false;
    }
  },

  // Remove item from wishlist
  async remove(productId) {
    const user = window.Auth.getCurrentUser();
    if (!user?.id) return;
    try {
      const data = await window.Utils.ajax("/wishlist/remove.php", "POST", { user_id: user.id, product_id: productId });
      window.Utils.showToast(data.message, "success");
      await this.fetch();
      return true;
    } catch (err) {
      console.error("Failed to remove from wishlist:", err);
      return false;
    }
  },

  // Check if a product is in wishlist
  has(productId) {
    return this.items.some(item => item.id === productId);
  },

  // Toggle wishlist item
  async toggle(productId) {
    if (this.has(productId)) {
      await this.remove(productId);
      return false;
    } else {
      await this.add(productId);
      return true;
    }
  },

  // Update badge count
  updateBadge() {
    const badge = document.getElementById("wishlistBadge");
    if (badge) {
      const count = this.items.length;
      badge.textContent = count;
      badge.style.display = count > 0 ? "flex" : "none";
    }
  },

  // Optional: render wishlist items in a page
  render() {
    const container = document.getElementById("wishlistContainer");
    if (!container) return;
    container.innerHTML = "";
    this.items.forEach(product => {
      const div = document.createElement("div");
      div.className = "wishlist-item";
      div.innerHTML = `
        <img src="${product.primary_image}" alt="${product.title}" />
        <h3>${product.title}</h3>
        <p>$${product.price.toFixed(2)}</p>
        <button onclick="Wishlist.remove('${product.id}')">Remove</button>
      `;
      container.appendChild(div);
    });
  }
};

// Initial fetch on page load
(function() {
  const currentUser = window.Auth.getCurrentUser();
  if (currentUser?.id) window.Wishlist.fetch();
})();

