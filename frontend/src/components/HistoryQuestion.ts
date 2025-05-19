import { loadTemplate } from "../utils/load-template.js";

export class HistoryQuestion extends HTMLElement {
  connectedCallback() {
    this.loadTemplate();
  }

  async loadTemplate() {
    const content = await loadTemplate('./templates/history-question.component.html');
    this.appendChild(content);
    this.dispatchEvent(new CustomEvent('ready'));
  }
  
}
customElements.define('history-question', HistoryQuestion);
