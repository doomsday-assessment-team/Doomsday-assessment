import { loadTemplate } from "../utils/load-template.js";

export class HistoryOption extends HTMLElement {
  connectedCallback() {
    this.loadTemplate();
  }

  async loadTemplate() {
    const content = await loadTemplate('./templates/history-option.component.html');
    this.appendChild(content);
    this.dispatchEvent(new CustomEvent('ready'));
  }
  
}
customElements.define('history-option', HistoryOption);
