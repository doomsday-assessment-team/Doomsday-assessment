import { loadTemplate } from "../utils/load-template.js"
import { apiService, App } from "../main.js"

export class HeaderComponent extends HTMLElement {
  connectedCallback() {
    this.loadTemplate()
  }

  async loadTemplate() {
    const content = await loadTemplate("./templates/header.component.html")
    this.appendChild(content)

    this.setupAvatarNavigation()
    this.loadUserInitials()
  }

  setupAvatarNavigation() {
    const userAvatar = this.querySelector(".user-avatar")

    if (userAvatar) {
      userAvatar.setAttribute("tabindex", "0")
      userAvatar.setAttribute("role", "button")
      userAvatar.setAttribute("aria-label", "View your profile")

      userAvatar.addEventListener("click", () => {
        App.navigate("/user-profile")
      })
    }
  }

  async loadUserInitials() {
    try {
      const response: UserResponse = await apiService.get("/users/me")
      const user = response.user

      if (user) {
        const initials = `${user.given_name.charAt(0)}${user.family_name.charAt(0).toUpperCase()}`

        const userAvatar = this.querySelector(".user-avatar")
        if (userAvatar) {
          userAvatar.textContent = initials
        }
      }
    } catch (error) {
      console.error("Failed to load user initials:", error)

      // Set a fallback initial if the API call fails
      const userAvatar = this.querySelector(".user-avatar")
      if (userAvatar) {
        userAvatar.textContent = "U"
      }
    }
  }
}

customElements.define("header-component", HeaderComponent)
