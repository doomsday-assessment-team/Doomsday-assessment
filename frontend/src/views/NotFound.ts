import { loadTemplate } from "../utils/load-template.js";

export class NotFound extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.loadTemplate();
  }

  async loadTemplate() {
    const content = await loadTemplate('./templates/not-found.view.html');
    if (content){
      this.shadowRoot?.appendChild(content);
    } else {
      // content is null
    }
  }
  
}
customElements.define('not-found', NotFound);
