// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
  // Update auth UI
  window.Auth.updateUI()

  // Update cart badge
  window.Cart.updateBadge()

  // Update wishlist badge
  window.Wishlist.updateBadge()

  // Setup user menu dropdown
  setupUserMenu()

  // Setup search
  setupSearch()

  // Load trending products on homepage
  if (document.getElementById("trendingProducts")) {
    loadTrendingProducts()
  }

  // Update category counts on homepage
  if (document.querySelector(".categories-grid")) {
    updateCategoryCounts()
  }
})

function setupUserMenu() {
  const userBtn = document.getElementById("userMenuBtn")
  const dropdown = document.getElementById("userDropdown")

  if (userBtn && dropdown) {
    userBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      dropdown.classList.toggle("active")
    })

    document.addEventListener("click", () => {
      dropdown.classList.remove("active")
    })
  }
}

function setupSearch() {
  const searchForm = document.getElementById("searchForm")
  const searchInput = document.getElementById("searchInput")

  if (searchForm) {
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault()
      const query = searchInput.value.trim()
      if (query) {
        window.location.href = `search.html?q=${encodeURIComponent(query)}`
      }
    })
  }
}

function loadTrendingProducts() {
  const container = document.getElementById("trendingProducts")
  if (!container) return

  // Wait for products to be loaded if they're not available yet
  if (!window.PRODUCTS) {
    // Retry after a short delay
    setTimeout(() => {
      loadTrendingProducts()
    }, 100)
    return
  }

  // Try to get featured products first
  let trendingProducts = window.PRODUCTS.filter((p) => p.featured).slice(0, 8)

  // If no featured products, show top 8 by rating instead
  if (trendingProducts.length === 0) {
    trendingProducts = [...window.PRODUCTS]
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 8)
  }

  // Mark all trending products as featured for display
  trendingProducts = trendingProducts.map(product => ({
    ...product,
    featured: true
  }))

  if (trendingProducts.length > 0) {
    container.innerHTML = trendingProducts.map((product) => window.createProductCard(product)).join("")
  }
}

function updateCategoryCounts() {
  // Wait for products to be loaded if they're not available yet
  if (!window.PRODUCTS) {
    // Retry after a short delay
    setTimeout(() => {
      updateCategoryCounts()
    }, 100)
    return
  }

  // Map database category slugs to display categories
  // Database has: 'gpu', 'mice', 'keyboards', 'monitors', 'cpu', 'consoles'
  // Display categories: 'consoles', 'processors', 'graphics', 'peripherals', 'monitors'
  const categoryMapping = {
    'consoles': ['consoles'],           // Gaming Consoles
    'processors': ['cpu'],              // Processors
    'graphics': ['gpu'],                // Graphics Cards
    'peripherals': ['keyboards', 'mice'], // Peripherals (keyboards + mice)
    'monitors': ['monitors']            // Monitors
  }

  // Count products for each display category
  Object.keys(categoryMapping).forEach(displayCategory => {
    const dbCategories = categoryMapping[displayCategory]
    const count = window.PRODUCTS.filter(p => 
      dbCategories.includes(p.category_slug)
    ).length
    
    // Find the category card by href attribute
    const categoryCard = document.querySelector(`a[href*="category=${displayCategory}"]`)
    if (categoryCard) {
      const countElement = categoryCard.querySelector('.category-count')
      if (countElement) {
        countElement.textContent = count === 1 ? '1 Product' : `${count} Products`
      }
    }
  })
}
window