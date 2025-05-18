import { loadTemplate } from "../utils/load-template.js";
import "./AssessmentDetails.js"

export class AssessmentDetailsModal extends HTMLElement {
  connectedCallback() {
    this.loadTemplate();
  }

  async loadTemplate() {
    const content = await loadTemplate('./templates/assessment-details-modal.component.html');
    this.appendChild(content);
  }
  
}
customElements.define('assessment-details-modal', AssessmentDetailsModal);