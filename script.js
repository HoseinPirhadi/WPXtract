document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const themeToggle = document.getElementById("theme-toggle")
  const languageToggle = document.getElementById("language-toggle")
  const fetchBtn = document.getElementById("fetch-btn")
  const siteUrlInput = document.getElementById("site-url")
  const usersContainer = document.getElementById("users-container")
  const userCount = document.getElementById("user-count")
  const loadingContainer = document.querySelector(".loading-container")
  const errorContainer = document.querySelector(".error-container")
  const errorMessage = document.getElementById("error-message")
  const errorDismiss = document.getElementById("error-dismiss")
  const resultsContainer = document.querySelector(".results-container")
  const gridViewBtn = document.getElementById("grid-view")
  const listViewBtn = document.getElementById("list-view")
  const userModal = document.querySelector(".user-modal")
  const modalContent = document.querySelector(".modal-content")
  const modalClose = document.querySelector(".modal-close")
  const modalBody = document.querySelector(".modal-body")

  // State
  let currentLanguage = "en"
  let isDarkMode = false
  let currentView = "grid"
  let usersData = []

  // Initialize
  initTheme()
  initLanguage()
  addEventListeners()

  // Functions
  function initTheme() {
    // Check for saved theme preference
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme === "dark") {
      document.body.classList.add("dark-mode")
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>'
      isDarkMode = true
    }
  }

  function initLanguage() {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem("language")
    if (savedLanguage === "fa") {
      setLanguage("fa")
    }
  }

  function addEventListeners() {
    // Theme toggle
    themeToggle.addEventListener("click", toggleTheme)

    // Language toggle
    languageToggle.addEventListener("click", toggleLanguage)

    // Fetch button
    fetchBtn.addEventListener("click", fetchUsers)

    // Enter key in input
    siteUrlInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        fetchUsers()
      }
    })

    // Error dismiss button
    errorDismiss.addEventListener("click", () => {
      errorContainer.style.display = "none"
    })

    // View toggle buttons
    gridViewBtn.addEventListener("click", () => {
      setView("grid")
    })

    listViewBtn.addEventListener("click", () => {
      setView("list")
    })

    // Modal close button
    modalClose.addEventListener("click", closeModal)

    // Close modal when clicking outside content
    userModal.addEventListener("click", (e) => {
      if (e.target === userModal) {
        closeModal()
      }
    })

    // Escape key to close modal
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && userModal.classList.contains("active")) {
        closeModal()
      }
    })
  }

  function toggleTheme() {
    isDarkMode = !isDarkMode
    document.body.classList.toggle("dark-mode")

    if (isDarkMode) {
      themeToggle.innerHTML = '<i class="fas fa-sun"></i>'
      localStorage.setItem("theme", "dark")
    } else {
      themeToggle.innerHTML = '<i class="fas fa-moon"></i>'
      localStorage.setItem("theme", "light")
    }
  }

  function toggleLanguage() {
    const newLanguage = currentLanguage === "en" ? "fa" : "en"
    setLanguage(newLanguage)
  }

  function setLanguage(language) {
    currentLanguage = language
    document.body.classList.toggle("fa", language === "fa")

    // Update language toggle button text
    const langToggleText = languageToggle.querySelector("span")
    langToggleText.textContent = language === "en" ? "فارسی" : "English"

    // Update all translatable elements
    document.querySelectorAll("[data-en]").forEach((el) => {
      el.textContent = el.getAttribute(`data-${language}`)
    })

    // Update input placeholders
    document.querySelectorAll("input[data-en-placeholder]").forEach((input) => {
      input.placeholder = input.getAttribute(`data-${language}-placeholder`)
    })

    localStorage.setItem("language", language)
  }

  function setView(view) {
    currentView = view

    if (view === "grid") {
      usersContainer.className = "users-grid"
      gridViewBtn.classList.add("active")
      listViewBtn.classList.remove("active")
    } else {
      usersContainer.className = "users-list"
      listViewBtn.classList.add("active")
      gridViewBtn.classList.remove("active")
    }

    // Rerender users with new view
    if (usersData.length > 0) {
      displayUsers(usersData)
    }
  }

  async function fetchUsers() {
    const siteUrl = siteUrlInput.value.trim()

    if (!siteUrl) {
      showError(currentLanguage === "en" ? "Please enter a WordPress site URL" : "لطفا آدرس سایت وردپرس را وارد کنید")
      return
    }

    // Format URL
    let formattedUrl = siteUrl
    if (!formattedUrl.startsWith("http")) {
      formattedUrl = "https://" + formattedUrl
    }

    // Remove trailing slash if present
    if (formattedUrl.endsWith("/")) {
      formattedUrl = formattedUrl.slice(0, -1)
    }

    // Add API endpoint
    const apiUrl = `${formattedUrl}/wp-json/wp/v2/users`

    // Show loading
    showLoading()

    try {
      const response = await fetch(apiUrl)

      if (!response.ok) {
        throw new Error(
          currentLanguage === "en"
            ? `Failed to fetch users (Status: ${response.status})`
            : `خطا در دریافت کاربران (وضعیت: ${response.status})`,
        )
      }

      const users = await response.json()

      if (!Array.isArray(users) || users.length === 0) {
        throw new Error(
          currentLanguage === "en"
            ? "No users found or invalid response format"
            : "هیچ کاربری یافت نشد یا فرمت پاسخ نامعتبر است",
        )
      }

      // Store users data
      usersData = users

      // Display users
      displayUsers(users)
    } catch (error) {
      showError(error.message)
    } finally {
      hideLoading()
    }
  }

  function displayUsers(users) {
    // Clear previous results
    usersContainer.innerHTML = ""

    // Update user count
    userCount.textContent = users.length

    // Create user cards
    users.forEach((user) => {
      const userCard = createUserCard(user)
      usersContainer.appendChild(userCard)
    })

    // Show results container with animation
    resultsContainer.style.display = "block"
    errorContainer.style.display = "none"

    // Add animation class to each card with delay
    const cards = usersContainer.querySelectorAll(".user-card")
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = "1"
        card.style.transform = "translateY(0)"
      }, 50 * index)
    })
  }

  function createUserCard(user) {
    const card = document.createElement("div")
    card.className = `user-card ${currentView === "list" ? "list-view" : ""}`
    card.style.opacity = "0"
    card.style.transform = "translateY(20px)"
    card.style.transition = "opacity 0.3s ease, transform 0.3s ease"

    // Get avatar URL (use largest available)
    const avatarUrl =
      user.avatar_urls && user.avatar_urls["96"] ? user.avatar_urls["96"] : "/placeholder.svg?height=96&width=96"

    // User header with avatar and name
    const userHeader = `
      <div class="user-header">
        <div class="user-avatar">
          <img src="${avatarUrl}" alt="${user.name || "User"}" />
        </div>
        <div class="user-info">
          <h3 class="user-name">${user.name || "Unknown User"}</h3>
          <div class="user-slug">${user.slug || ""}</div>
        </div>
      </div>
    `

    // User details - limit to 2 items in card view
    const userDetails = `
      <div class="user-details">
        ${
          user.id
            ? `
          <div class="detail-item">
            <div class="detail-label">${currentLanguage === "en" ? "ID" : "شناسه"}</div>
            <div class="detail-value">${user.id}</div>
          </div>
        `
            : ""
        }
        
        ${
          user.url
            ? `
          <div class="detail-item">
            <div class="detail-label">${currentLanguage === "en" ? "URL" : "آدرس"}</div>
            <div class="detail-value">
              <a href="${user.url}" target="_blank" rel="noopener noreferrer">${user.url}</a>
            </div>
          </div>
        `
            : ""
        }
      </div>
    `

    // Combine all sections
    card.innerHTML = userHeader + userDetails

    // Add click event to open modal with full details
    card.addEventListener("click", () => {
      openUserModal(user)
    })

    return card
  }

  function openUserModal(user) {
    // Get avatar URL (use largest available)
    const avatarUrl =
      user.avatar_urls && user.avatar_urls["96"] ? user.avatar_urls["96"] : "/placeholder.svg?height=96&width=96"

    // Create modal content
    const modalContent = `
      <div class="modal-header">
        <div class="user-avatar">
          <img src="${avatarUrl}" alt="${user.name || "User"}" />
        </div>
        <h2 class="user-name">${user.name || "Unknown User"}</h2>
        <div class="user-slug">${user.slug || ""}</div>
      </div>
      
      <div class="modal-details">
        ${
          user.id
            ? `
          <div class="detail-item">
            <div class="detail-label">${currentLanguage === "en" ? "ID" : "شناسه"}</div>
            <div class="detail-value">${user.id}</div>
          </div>
        `
            : ""
        }
        
        ${
          user.url
            ? `
          <div class="detail-item">
            <div class="detail-label">${currentLanguage === "en" ? "URL" : "آدرس"}</div>
            <div class="detail-value">
              <a href="${user.url}" target="_blank" rel="noopener noreferrer">${user.url}</a>
            </div>
          </div>
        `
            : ""
        }
        
        ${
          user.link
            ? `
          <div class="detail-item">
            <div class="detail-label">${currentLanguage === "en" ? "Profile Link" : "لینک پروفایل"}</div>
            <div class="detail-value">
              <a href="${user.link}" target="_blank" rel="noopener noreferrer">${user.link}</a>
            </div>
          </div>
        `
            : ""
        }
        
        ${
          user.description
            ? `
          <div class="detail-item">
            <div class="detail-label">${currentLanguage === "en" ? "Description" : "توضیحات"}</div>
            <div class="detail-value">${user.description}</div>
          </div>
        `
            : ""
        }
      </div>
      
      ${
        user.meta && Object.keys(user.meta).length > 0
          ? `
        <div class="modal-meta">
          <h3 class="meta-title">${currentLanguage === "en" ? "Meta Data" : "متادیتا"}</h3>
          <div class="meta-items">
            ${Object.entries(user.meta)
              .map(
                ([key, value]) => `
                <div class="meta-item">
                  <div class="meta-key">${key}</div>
                  <div class="meta-value">${JSON.stringify(value)}</div>
                </div>
              `,
              )
              .join("")}
          </div>
        </div>
      `
          : ""
      }
    `

    // Set modal content
    modalBody.innerHTML = modalContent

    // Show modal with animation
    userModal.classList.add("active")
    document.body.style.overflow = "hidden" // Prevent scrolling
  }

  function closeModal() {
    userModal.classList.remove("active")
    document.body.style.overflow = "" // Restore scrolling
  }

  function showLoading() {
    loadingContainer.style.display = "flex"
    resultsContainer.style.display = "none"
    errorContainer.style.display = "none"
  }

  function hideLoading() {
    loadingContainer.style.display = "none"
  }

  function showError(message) {
    errorMessage.textContent = message
    errorContainer.style.display = "block"
    resultsContainer.style.display = "none"
  }
})

