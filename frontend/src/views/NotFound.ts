import { loadTemplate } from "../utils/load-template.js";

export class NotFound extends HTMLElement {
  connectedCallback() {
    this.loadTemplate();
  }

  async loadTemplate() {
    const content = await loadTemplate('./templates/not-found.view.html');
    this.appendChild(content);
  }
  
}
customElements.define('not-found', NotFound);
