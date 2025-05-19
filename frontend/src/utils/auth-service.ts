import config from "../config.js";
import { NotificationService } from "./notification-service.js"
import { App } from "../main.js";

const TOKEN_STORAGE_KEY = 'appAuthToken';

export class AuthService {
    private token: string | null = null;

  constructor() {
    const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedToken) {
      this.setToken(storedToken);
    }
    this.handleLoginCallback();
  }

  public loginWithGoogle(): void {
    const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/"
    const redirectParam = encodeURIComponent(redirectPath)

    const separator = config.apiBaseUrl.includes("?") ? "&" : "?"
    window.location.href = `${config.apiBaseUrl}/auth/google${separator}redirect=${redirectParam}`;
  }

  private handleLoginCallback(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    const redirectFromUrl = urlParams.get('redirect');

    if (tokenFromUrl) {
      this.setToken(tokenFromUrl);

      // Mark that the user has logged in before
      sessionStorage.setItem("hasLoggedInBefore", "true")
      localStorage.setItem("hasLoggedInBefore", "true")

      if (redirectFromUrl) {
        sessionStorage.setItem("redirectAfterLogin", decodeURIComponent(redirectFromUrl))
      }

      window.history.replaceState({}, document.title, window.location.pathname)

      // Navigate to the redirect path if we're on the login page
      if (window.location.pathname.includes("/login")) {
        const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/"
        setTimeout(() => {
          App.navigate(redirectPath)
          // Only remove after successfully navigating
          sessionStorage.removeItem("redirectAfterLogin")
        }, 100)
      }
    }
  }

  public setToken(token: string): void {
    this.token = token;
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    // Mark that the user has logged in before
    sessionStorage.setItem("hasLoggedInBefore", "true")
    localStorage.setItem("hasLoggedInBefore", "true")
  }

  public getToken(): string | null {
    if (this.token) {
      return this.token;
    }
    const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedToken && storedToken !== "undefined" && storedToken !== "null") {
      this.setToken(storedToken);
      return this.token;
    }
    return null;
  }

  public isLoggedIn(): boolean {
    const currentToken = this.getToken();

    if (!this.token) {
      return false;
    } else {
      return true;
    }
  }

  public logout(): void {
    this.token = null;
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  public handleApiError(error: any): void {
    if (error && (error.status === 401 || error.message?.includes("Unauthorized"))) {

      this.logout()

      // Show notification
      const notificationService = new NotificationService()
      notificationService.showNotification({
        type: "warning",
        title: "SESSION EXPIRED",
        message: "Your authentication session has expired. Please log in again to continue.",
        duration: 5000,
      })

      // Store redirect reason
      sessionStorage.setItem("authRedirectReason", "SESSION_EXPIRED")

      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = "/login"
      }, 1000)
    }
  }
}
