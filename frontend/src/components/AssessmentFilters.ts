import { loadTemplate } from "../utils/load-template.js";
export class AssessmentFilters extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.loadTemplate();
  }
  async loadTemplate() {
    const content = await loadTemplate('./templates/assessment-filters.component.html');
    if (content) {
      this.shadowRoot?.appendChild(content);
    } else {
      // content is null
    }
  }
}
customElements.define('assessment-filters', AssessmentFilters);

