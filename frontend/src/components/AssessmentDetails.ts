import { loadTemplate } from "../utils/load-template.js";

export class AssessmentDetails extends HTMLElement {
  connectedCallback() {
    this.loadTemplate();
  }

  async loadTemplate() {
    const content = await loadTemplate('./templates/assessment-details.component.html');
    this.appendChild(content);
  }
  
}
customElements.define('assessment-details', AssessmentDetails);
