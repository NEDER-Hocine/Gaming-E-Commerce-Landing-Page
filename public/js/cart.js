// Cart Manager (Database-backed)
window.Cart = {
  items: [],

  // Fetch cart from backend
  async fetch() {
    const user = window.Auth.getCurrentUser();
    if (!user?.id) return

    try {
      const cartItems = await window.Utils.ajax(`/cart/list.php?user_id=${user.id}`);
      this.items = cartItems
      this.updateBadge()
      // If renderCart exists in global scope (from main.js or similar), call it
      if (typeof renderCart === 'function') {
        renderCart(cartItems)
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err)
    }
  },

  // Add item to cart
  async addItem(productId, quantity = 1) {
    const user = window.Auth.getCurrentUser();
    if (!user?.id) {
      window.Utils.showToast("Please log in to add items to cart", "error")
      // Redirect to login if needed: window.location.href = 'login.html';
      return
    }

    try {
      const data = await window.Utils.ajax("/cart/add.php", "POST", {
        user_id: user.id,
        product_id: productId,
        quantity: quantity
      });
      
      window.Utils.showToast(data.message || "Added to cart", "success")
      this.fetch() // refresh cart items
    } catch (err) {
      console.error("Failed to add to cart:", err)
      window.Utils.showToast("Failed to add to cart", "error")
    }
  },

  // Remove item from cart
  async removeItem(productId) {
    const user = window.Auth.getCurrentUser();
    if (!user?.id) return

    try {
      await window.Utils.ajax("/cart/remove.php", "POST", {
        user_id: user.id,
        product_id: productId
      });
      
      this.fetch();
    } catch (err) {
      console.error("Failed to remove item:", err);
      window.Utils.showToast("Failed to remove item", "error");
    }
  },

  // Update quantity
  async updateQuantity(productId, quantity) {
    const user = window.Auth.getCurrentUser();
    if (!user?.id) return

    try {
      await window.Utils.ajax("/cart/update.php", "POST", {
        user_id: user.id,
        product_id: productId,
        quantity: quantity
      });
      this.fetch();
    } catch (err) {
      console.error(err);
    }
  },

  // Clear cart
  async clear() {
    const user = window.Auth.getCurrentUser();
    if (!user?.id) return

    try {
      await window.Utils.ajax("/cart/clear.php", "POST", { user_id: user.id });
      this.fetch();
    } catch (err) {
      console.error(err);
    }
  },

  // Get total
  getTotal() {
    return this.items.reduce((total, item) => {
      const product = (window.PRODUCTS || []).find(p => `${p.id}` === `${item.product_id}`)
      return total + (product ? (parseFloat(product.price) || 0) * item.quantity : 0)
    }, 0)
  },

  // Accessor returning a normalized list for UI
  getItems() {
    return this.items.map(i => ({
      productId: i.product_id,
      quantity: i.quantity,
    }))
  },

  // Update badge count
  updateBadge() {
    const badge = document.getElementById("cartBadge")
    if (badge) {
      const count = this.items.reduce((sum, item) => sum + item.quantity, 0)
      badge.textContent = count
      badge.style.display = count > 0 ? "flex" : "none"
    }
  }
};

// Initial fetch on page load
(function() {
  const currentUser = window.Auth.getCurrentUser();
  if (currentUser?.id) window.Cart.fetch();
})();