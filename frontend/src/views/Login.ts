import config from "../config.js";
import { App } from "../main.js";
import { AuthService } from "../utils/auth-service.js";
import { loadTemplate } from "../utils/load-template.js";

export class LoginView extends HTMLElement {

  private shadowRootInstance: ShadowRoot;
  private authServiceInstance: AuthService;
  private customSignInButton: HTMLButtonElement | null = null;


  constructor() {
    super();
    this.shadowRootInstance = this.attachShadow({ mode: 'open' });
    this.authServiceInstance = new AuthService();
    this.loadTemplate();
  }

  async loadTemplate() {
    const content = await loadTemplate('./templates/login.view.html');
    if (content) {
      this.shadowRoot?.appendChild(content);
      this.setupFormAction();
    } else {
      // content is null
    }
  }

  connectedCallback() {
    // We need an instance of AuthService to check isLoggedIn,
    // or make isLoggedIn static in your AuthService.
    // For now, let's assume you instantiate it or make it static.
    const authService = new AuthService(); // Or a shared singleton instance
    if (authService.isLoggedIn()) {
        console.log("LoginView: User already authenticated, redirecting.");
        const redirectPath = sessionStorage.getItem('redirectAfterLogin') || '/'; // Default to /profile
        console.log(`Redirect path ${redirectPath}`);
        sessionStorage.removeItem('redirectAfterLogin');
        App.navigate(redirectPath);
        // No return needed as the rest of the component just renders the button
    }
  }

  private setupFormAction() {
      const form = this.shadowRootInstance.querySelector<HTMLFormElement>('#google-login-form');
      if (form && config && config.apiBaseUrl) { // Ensure config and apiBaseUrl are available
          form.action = `${config.apiBaseUrl}/auth/google`;
          console.log(`LoginView: Form action set to ${form.action}`);
      } else if (form) {
          console.warn("LoginView: config.apiBaseUrl not found. Form action might be incorrect if not hardcoded in HTML.");
          // The action might already be hardcoded in the HTML, which is fine for a fixed backend URL.
      }
  }

}
customElements.define('login-view', LoginView);
