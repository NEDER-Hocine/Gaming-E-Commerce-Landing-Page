// Modal Manager
window.Modal = {
  open(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.classList.add("active")
      document.body.style.overflow = "hidden"
    }
  },

  close(modalId) {
    const modal = document.getElementById(modalId)
    if (modal) {
      modal.classList.remove("active")
      document.body.style.overflow = ""
    }
  },
}

// Close modal on overlay click
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal-overlay") || e.target.classList.contains("modal-close")) {
    const modal = e.target.closest(".modal")
    if (modal) {
      modal.classList.remove("active")
      document.body.style.overflow = ""
    }
  }
})
