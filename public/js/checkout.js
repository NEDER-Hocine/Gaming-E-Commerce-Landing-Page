// Checkout Manager
async function placeOrder(shippingAddress, paymentInfo) {
  const user = window.Auth.getCurrentUser();
  if (!user?.id) {
    window.Utils.showToast("Please log in to place an order", "error");
    return;
  }

  const cartItems = window.Cart.items.map(item => ({
    product_id: item.product_id,
    quantity: item.quantity
  }));

  try {
    const data = await window.Utils.ajax("/orders/create.php", "POST", {
      user_id: user.id,
      cart_items: cartItems,
      shipping_address: shippingAddress,
      payment_info: paymentInfo
    });

    if (data.order_id) {
      window.Utils.showToast("Order placed successfully", "success");
      // Optionally refresh cart here if needed
      window.location.href = `order-confirmation.html?order_id=${data.order_id}`;
    } else {
      window.Utils.showToast(data.error || "Failed to place order", "error");
    }
  } catch (err) {
    console.error("Error placing order:", err);
    window.Utils.showToast(err.message || "Failed to place order", "error");
  }
}

// Optional: attach to form submission
const checkoutForm = document.getElementById("checkoutForm");
if (checkoutForm) {
  checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const shippingAddress = {
      full_name: document.getElementById("fullName").value,
      address: document.getElementById("address").value,
      city: document.getElementById("city").value,
      zip: document.getElementById("zip").value,
      country: document.getElementById("country").value,
      phone: document.getElementById("phone").value
    };
    const paymentInfo = {
      method: document.querySelector('input[name="paymentMethod"]:checked')?.value || "card",
      card_number: document.getElementById("cardNumber")?.value,
      expiry: document.getElementById("cardExpiry")?.value,
      cvc: document.getElementById("cardCVC")?.value
    };
    await placeOrder(shippingAddress, paymentInfo);
  });
}
window