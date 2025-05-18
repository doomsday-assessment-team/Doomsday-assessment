import { loadTemplate } from "../utils/load-template.js";

export class StatsGrid extends HTMLElement {
  connectedCallback() {
    this.loadTemplate();
  }

  async loadTemplate() {
    const content = await loadTemplate('./templates/stats-grid.component.html');
    this.appendChild(content);
  }
  
}
customElements.define('stats-grid', StatsGrid);
