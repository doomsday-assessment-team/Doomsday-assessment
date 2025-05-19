import config from "../config.js";
import { App } from "../main.js";
import { AuthService } from "../utils/auth-service.js";
import { loadTemplate } from "../utils/load-template.js";

export class LoginView extends HTMLElement {
  private customSignInButton: HTMLButtonElement | null = null;

  connectedCallback() {
    const authService = new AuthService();
    if (authService.isLoggedIn()) {
      console.log("LoginView: User already authenticated, redirecting.");
      const redirectPath = sessionStorage.getItem("redirectAfterLogin") || "/";
      console.log(`Redirect path ${redirectPath}`);
      sessionStorage.removeItem("redirectAfterLogin");
      App.navigate(redirectPath);
    } else {
      this.loadTemplate();
    }
  }

  async loadTemplate() {
    const content = await loadTemplate("./templates/login.view.html");
    this.appendChild(content);
    this.setupFormAction();
  }

  private setupFormAction() {
    const form = this.querySelector<HTMLFormElement>("#google-login-form");
    if (form && config && config.apiBaseUrl) {
      form.action = `${config.apiBaseUrl}/auth/google`;
      console.log(`LoginView: Form action set to ${form.action}`);
    } else if (form) {
      console.warn(
        "LoginView: config.apiBaseUrl not found. Form action might be incorrect if not hardcoded in HTML."
      );
    }
  }
}
customElements.define("login-view", LoginView);
