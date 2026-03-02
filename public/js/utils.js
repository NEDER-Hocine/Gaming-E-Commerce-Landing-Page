// Utility Functions
window.Utils = {
  // API Configuration
  API_URL: "http://localhost/E-commerce-website 1/backend/api",

  // Generic AJAX Request
  async ajax(endpoint, method = "GET", body = null) {
    const url = `${this.API_URL}${endpoint}`;
    
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      credentials: "include" // Important to send cookies for PHP sessions
    };

    // Add Authorization token if available
    const token = sessionStorage.getItem('authToken');
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(url, options);
      const data = await response.json();
      
      // Check for HTTP error codes
      if (!response.ok) {
        throw new Error(data.message || data.error || "Request failed");
      }
      
      return data;
    } catch (error) {
      console.error(`AJAX Error (${endpoint}):`, error);
      throw error;
    }
  },

  // Format currency
  formatPrice(price) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price)
  },

  // Format date
  formatDate(date) {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(date))
  },

  // Generate rating stars HTML
  generateStars(rating) {
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5
    let html = ""

    for (let i = 0; i < fullStars; i++) {
      html += "★"
    }
    if (hasHalfStar) {
      html += "⯨"
    }
    const emptyStars = 5 - Math.ceil(rating)
    for (let i = 0; i < emptyStars; i++) {
      html += "☆"
    }

    return html
  },

  // Slugify string
  slugify(text) {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-")
  },

  // Get URL parameters
  getUrlParams() {
    const params = new URLSearchParams(window.location.search)
    const result = {}
    for (const [key, value] of params) {
      result[key] = value
    }
    return result
  },

  // Debounce function
  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  // Local storage helpers
  storage: {
    get(key) {
      try {
        const item = localStorage.getItem(key)
        return item ? JSON.parse(item) : null
      } catch (e) {
        console.error("Error reading from localStorage:", e)
        return null
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value))
        return true
      } catch (e) {
        console.error("Error writing to localStorage:", e)
        return false
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(key)
        return true
      } catch (e) {
        console.error("Error removing from localStorage:", e)
        return false
      }
    },
  },

  // Toast helper (wraps global showToast if available)
  showToast(message, type = "info") {
    if (typeof window.showToast === "function") {
      window.showToast(message, type)
    } else {
      console.warn("Toast handler missing:", message)
    }
  },
}
