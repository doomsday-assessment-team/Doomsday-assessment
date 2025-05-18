import { loadTemplate } from "../utils/load-template.js";

export class HeaderComponent extends HTMLElement {
  connectedCallback() {
    this.loadTemplate();
  }

  async loadTemplate() {
    const content = await loadTemplate('./templates/header.component.html');
    this.appendChild(content);
  }
  
}
customElements.define('header-component', HeaderComponent);
