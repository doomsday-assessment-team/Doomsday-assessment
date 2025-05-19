import config from "../config.js"
import { App } from "../main.js"
import { AuthService } from "../utils/auth-service.js"
import { loadTemplate } from "../utils/load-template.js"
import { NotificationService } from "../utils/notification-service.js"

export class LoginView extends HTMLElement {
  private customSignInButton: HTMLButtonElement | null = null
  private notificationService: NotificationService

  constructor() {
    super()
    this.notificationService = new NotificationService()
  }

  connectedCallback() {
    const authService = new AuthService()
    if (authService.isLoggedIn()) {
      console.log("LoginView: User already authenticated, redirecting.")
      const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/"
      console.log(`Redirect path ${redirectPath}`)
      sessionStorage.removeItem("redirectAfterLogin")
      App.navigate(redirectPath)
    } else {
      this.loadTemplate()
      this.setupFormAction()
      // Check if we were redirected here due to auth issues
      this.checkForRedirectReason()
    }
  }

  async loadTemplate() {
    const content = await loadTemplate("./templates/login.view.html")
    this.appendChild(content)
  }

  private setupFormAction() {
    const form = this.querySelector<HTMLFormElement>("#google-login-form")
    if (form && config && config.apiBaseUrl) {
      form.action = `${config.apiBaseUrl}/auth/google`
      console.log(`LoginView: Form action set to ${form.action}`)
    } else if (form) {
      console.warn("LoginView: config.apiBaseUrl not found. Form action might be incorrect if not hardcoded in HTML.")
    }
  }

  private checkForRedirectReason() {
    const redirectReason = sessionStorage.getItem("authRedirectReason")
    if (redirectReason) {
      // Clear the reason so it doesn't show again
      sessionStorage.removeItem("authRedirectReason")

      switch (redirectReason) {
        case "SESSION_EXPIRED":
          this.notificationService.showNotification({
            type: "warning",
            title: "SESSION EXPIRED",
            message: "Your authentication session has expired. Please log in again to continue.",
            duration: 5000,
          })
          break
        case "ACCESS_DENIED":
          this.notificationService.showNotification({
            type: "error",
            title: "ACCESS DENIED",
            message: "You do not have permission to access the requested resource.",
            duration: 5000,
          })
          break
        case "FIRST_LOGIN":
          // Don't show any notification for first-time visitors
          break
        default:
          this.notificationService.showNotification({
            type: "info",
            title: "AUTHENTICATION REQUIRED",
            message: "Please log in to access this system.",
            duration: 5000,
          })
      }
    }
  }
}
customElements.define("login-view", LoginView)
