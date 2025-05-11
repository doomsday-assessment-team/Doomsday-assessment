import { loadTemplate } from "../utils/load-template.js";

export class LoginView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.loadTemplate();
  }

  async loadTemplate() {
    const content = await loadTemplate('./templates/login.view.html');
    if (content){
      this.shadowRoot?.appendChild(content);
    } else {
      // content is null
    }
  }
  
}
customElements.define('login-view', LoginView);
