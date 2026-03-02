// Toast Notifications
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container")
  if (!container) {
    console.warn("Toast container not found");
    return
  }

  const toast = document.createElement("div")
  toast.className = `toast ${type}`
  toast.textContent = message
  toast.style.opacity = "0";
  toast.style.transform = "translateX(100%)";

  container.appendChild(toast)

  // Trigger animation
  setTimeout(() => {
    toast.style.transition = "all 0.3s ease";
    toast.style.opacity = "1";
    toast.style.transform = "translateX(0)";
  }, 10)

  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove()
      }
    }, 300)
  }, 3000)
}
