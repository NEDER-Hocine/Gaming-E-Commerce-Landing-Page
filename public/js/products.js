// Fetch products from backend
window.Utils.ajax("/products/list.php")
  .then(products => {
    window.PRODUCTS = products; // Store globally for quickView and other functions
    // Trigger any rendering logic if needed, e.g. renderProducts(products) if that function exists
    if (typeof renderProducts === 'function') {
      renderProducts(products);
    } else if (typeof initializeProducts === 'function') {
      initializeProducts();
    }
  })
  .catch(err => {
    console.error("Failed to fetch products:", err);
    // Mark error state so the page can stop waiting and show a message
    window.PRODUCTS = [];
    window.PRODUCTS_ERROR = err?.message || "Failed to load products";
  });

// Map database filenames to actual image filenames
function getImageFilename(dbImage, productTitle) {
  // If it's already a full URL (http/https), return as-is
  if (dbImage && typeof dbImage === 'string' && dbImage.match(/^https?:\/\//)) {
    return dbImage;
  }

  const title = (productTitle || '').toLowerCase();

  // Direct mapping based on product title keywords
  const imageMap = [
    { keywords: ['logitech', 'superlight'], image: 'Logitech G Pro X Superlight.jpg' },
    { keywords: ['asus', 'rog', 'pg27aqdm'], image: 'ASUS ROG Swift PG27AQDM.jpg' },
    { keywords: ['asus', 'rog', 'pg27aqdp'], image: 'ASUS ROG Swift PG27AQDP.jpg' },
    { keywords: ['asus', 'rog', 'swift'], image: 'ASUS ROG Swift PG27AQDM.jpg' },
    { keywords: ['ryzen', '7950'], image: 'AMD Ryzen 9 7950X.jpg' },
    { keywords: ['amd', 'ryzen'], image: 'AMD Ryzen 9 7950X.jpg' },
    { keywords: ['playstation 5', 'ps5'], image: 'Sony PlayStation 5 Console.jpg' },
    { keywords: ['playstation', '5'], image: 'Sony PlayStation 5 Console.jpg' },
    { keywords: ['playstation 4', 'ps4'], image: 'Sony PlayStation 4 Slim 1TB.jpg' },
    { keywords: ['playstation', '4'], image: 'Sony PlayStation 4 Slim 1TB.jpg' },
    { keywords: ['playstation 3', 'ps3'], image: 'Sony PlayStation 3 Super Slim 500GB.jpg' },
    { keywords: ['playstation', '3'], image: 'Sony PlayStation 3 Super Slim 500GB.jpg' },
    { keywords: ['xbox', 'series', 'x'], image: 'Xbox Series X.jpg' },
    { keywords: ['xbox', 'one'], image: 'Xbox One S 1TB.jpg' },
    { keywords: ['xbox', '360'], image: 'Xbox 360 E 250GB.jpg' },
    { keywords: ['rtx', '4090'], image: 'NVIDIA GeForce RTX 4090 24GB.jpg' },
    { keywords: ['nvidia', 'geforce'], image: 'NVIDIA GeForce RTX 4090 24GB.jpg' },
    { keywords: ['keychron', 'q1'], image: 'Keychron Q1 Pro QMK.jpg' },
    { keywords: ['intel', 'i9', '14900'], image: 'Intel Core i9-14900K.jpg' },
    { keywords: ['intel', 'core'], image: 'Intel Core i9-14900K.jpg' },
    { keywords: ['radeon', '7900'], image: 'AMD Radeon RX 7900 XTX 24GB.jpg' },
    { keywords: ['amd', 'radeon'], image: 'AMD Radeon RX 7900 XTX 24GB.jpg' },
    { keywords: ['corsair', 'k70'], image: 'Corsair K70 RGB TKL.jpg' },
    { keywords: ['razer', 'deathadder'], image: 'Razer DeathAdder V3 Pro.jpg' },
    { keywords: ['samsung', 'odyssey'], image: 'Samsung Odyssey G9.jpg' },
    { keywords: ['nintendo', 'switch'], image: 'Nintendo Switch – OLED Model.jpg' },
  ];

  // Find matching image based on title keywords
  for (const mapping of imageMap) {
    const allMatch = mapping.keywords.every(kw => title.includes(kw));
    if (allMatch) {
      return mapping.image;
    }
  }

  // Handle uploaded images (img_*.jpg format) - return as-is
  if (dbImage) {
    let filename = String(dbImage);
    
    // Remove any leading path (e.g., /pic/, pic/, etc.)
    filename = filename.replace(/^\/?(pic|images?|uploads?)\//, '');
    
    // Also handle generic path separators
    if (filename.includes('/')) filename = filename.split('/').pop();
    if (filename.includes('\\')) filename = filename.split('\\').pop();
    
    // Check if this is an uploaded image (img_ prefix) or has valid extension
    if (filename.startsWith('img_') || 
        (filename && (filename.endsWith('.jpg') || filename.endsWith('.png') || filename.endsWith('.webp')))) {
      return filename;
    }
  }

  // Default placeholder
  return '';
}

// Product Functions
function createProductCard(product) {
  const isInWishlist = window.Wishlist && window.Wishlist.has ? window.Wishlist.has(product.id) : false;

  // Get the correct image filename
  // Check both image_url (standard) and primary_image (legacy/alternate)
  const dbImage = product.image_url || product.primary_image || product.image;
  let imagePath = getImageFilename(dbImage, product.title || product.name);

  // Handle URL encoding for local files only
  if (imagePath) {
    // If it's a full URL (http/https), use as-is
    if (imagePath.match(/^https?:\/\//)) {
      // Keep as-is for external URLs
    } else {
      // For local files, encode them
      imagePath = encodeURIComponent(imagePath);
    }
  } else {
    imagePath = "placeholder.jpg";
  }

  // Handle missing data safely
  const title = product.title || product.name || 'Untitled Product';
  const category = product.category_slug || product.category || '';
  const rating = parseFloat(product.rating) || 0;
  const reviewCount = product.reviewCount || product.review_count || 0;
  const price = parseFloat(product.price) || 0;

  // Determine image source path
  const imageSrc = imagePath.match(/^https?:\/\//) 
    ? imagePath 
    : `../img_prod/${imagePath}`;

  return `
    <div class="product-card">
        <div class="product-image-wrapper">
            <img src="${imageSrc}" alt="${title}" class="product-image" onerror="this.onerror=null;this.src='https://placehold.co/400x300?text=No+Image';">
            ${product.featured ? '<span class="product-featured-badge">Featured</span>' : ""}
            <div class="product-actions">
                <button class="action-btn ${isInWishlist ? "active" : ""}" onclick="toggleWishlist('${product.id}', this)">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="${isInWishlist ? "currentColor" : "none"}" stroke="currentColor">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </button>
                <button class="action-btn" onclick="quickView('${product.id}')">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                </button>
            </div>
        </div>
        <div class="product-content">
            <div class="product-category">${category}</div>
            <h3 class="product-name">${title}</h3>
            <div class="product-rating">
                <div class="stars">${window.Utils.generateStars(rating)}</div>
                <span class="rating-count">(${reviewCount})</span>
            </div>
            <div class="product-footer">
                <div class="product-price">${window.Utils.formatPrice(price)}</div>
                <button class="btn btn-primary btn-sm product-cart-btn" onclick="addToCart('${product.id}')">
                    Add to Cart
                </button>
            </div>
        </div>
    </div>
  `;
}
// Add to cart handler used by inline buttons
function addToCart(productId) {
  if (!window.Cart || !window.Cart.addItem) {
    console.error("Cart module not loaded");
    return;
  }
  window.Cart.addItem(productId);
}

// Wishlist toggle handler used by inline buttons
async function toggleWishlist(productId, buttonEl) {
  if (!window.Wishlist || !window.Wishlist.toggle) {
    console.error("Wishlist module not loaded");
    return;
  }

  // Optimistically toggle UI while awaiting backend
  if (buttonEl) {
    buttonEl.classList.toggle("active");
  }

  const added = await window.Wishlist.toggle(productId);

  // Ensure UI reflects final state
  if (buttonEl) {
    if (added) {
      buttonEl.classList.add("active");
    } else {
      buttonEl.classList.remove("active");
    }
  }
}

// Quick view modal handler
function quickView(productId) {
  const product = (window.PRODUCTS || []).find(p => `${p.id}` === `${productId}`);
  if (!product) {
    console.warn("Product not found for quick view", productId);
    return;
  }

  const dbImage = product.image_url || product.primary_image || product.image;
  const imagePath = getImageFilename(dbImage, product.title || product.name);
  const price = window.Utils ? window.Utils.formatPrice(parseFloat(product.price) || 0) : `$${product.price}`;
  const rating = window.Utils ? window.Utils.generateStars(parseFloat(product.rating) || 0) : "";

  // Determine image source path
  const imageSrc = imagePath.match(/^https?:\/\//) 
    ? imagePath 
    : `../img_prod/${encodeURIComponent(imagePath || "placeholder.jpg")}`;

  const modal = document.getElementById("quickViewModal");
  const content = document.getElementById("quickViewContent");
  if (!modal || !content) return;

  content.innerHTML = `
      <div class="quick-view">
        <div class="quick-view-image">
          <img src="${imageSrc}" alt="${product.title || product.name}" onerror="this.onerror=null;this.src='https://placehold.co/400x300?text=No+Image';">
        </div>
        <div class="quick-view-details">
          <h2>${product.title || product.name || "Untitled Product"}</h2>
          <p class="quick-view-price">${price}</p>
          <div class="quick-view-rating">${rating}</div>
          <p class="quick-view-description">${product.description || "No description provided."}</p>
          <div class="quick-view-actions">
            <button class="btn btn-primary" onclick="addToCart('${product.id}')">Add to Cart</button>
            <button class="btn btn-secondary" onclick="toggleWishlist('${product.id}')">${window.Wishlist && window.Wishlist.has(product.id) ? "Remove from Wishlist" : "Add to Wishlist"}</button>
          </div>
        </div>
      </div>
    `;

  if (window.Modal && window.Modal.open) {
    window.Modal.open("quickViewModal");
  } else {
    modal.classList.add("active");
  }
}

// Expose helpers globally for inline handlers
window.createProductCard = createProductCard;
window.addToCart = addToCart;
window.toggleWishlist = toggleWishlist;
window.quickView = quickView;
window.getImageFilename = getImageFilename;
