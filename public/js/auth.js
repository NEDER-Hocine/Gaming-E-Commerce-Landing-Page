// Authentication Manager (Backend-connected)
window.Auth = {
  // Check if user is logged in
  isAuthenticated() {
    return !!sessionStorage.getItem("currentUser")
  },

  // Get current user
  getCurrentUser() {
    const user = sessionStorage.getItem("currentUser")
    return user ? JSON.parse(user) : null
  },

  // Login (API)
  async login(email, password) {
    try {
      const data = await window.Utils.ajax("/auth/login.php", "POST", { 
        email, 
        password 
      });

      // Save user session and token
      sessionStorage.setItem("currentUser", JSON.stringify(data.user))
      if (data.token) {
        sessionStorage.setItem("authToken", data.token)
      }

      return { success: true, user: data.user }
    } catch (error) {
      return { success: false, message: error.message || "Login failed" }
    }
  },

  // Register (API)
  async register(name, email, phone = null, password, role = "buyer") {
    try {
      await window.Utils.ajax("/auth/register.php", "POST", {
        display_name: name,
        email,
        phone,
        password,
        role
      });

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || "Registration failed" };
    }
  },


  // Logout
  async logout() {
    try {
      // Notify backend to destroy session
      await window.Utils.ajax("/auth/logout.php", "POST");
    } catch (error) {
      console.warn("Server logout failed, clearing local session anyway");
    }
    
    sessionStorage.removeItem("currentUser")
    sessionStorage.removeItem("authToken")
    window.location.href = "index.html"
  },

  // Update UI based on auth state
  updateUI() {
    const user = this.getCurrentUser()
    const loginLink = document.getElementById("loginLink")
    const registerLink = document.getElementById("registerLink")
    const dashboardLink = document.getElementById("dashboardLink")
    const adminLink = document.getElementById("adminLink")
    const logoutBtn = document.getElementById("logoutBtn")

    if (user) {
      if (loginLink) loginLink.style.display = "none"
      if (registerLink) registerLink.style.display = "none"

      if (user.role === "seller" && dashboardLink) {
        dashboardLink.style.display = "block"
      }

      if (user.role === "admin" && adminLink) {
        adminLink.style.display = "block"
      }

      if (logoutBtn) {
        logoutBtn.style.display = "block"
        logoutBtn.onclick = (e) => {
          e.preventDefault(); 
          this.logout();
        }
      }
    }
  },
}