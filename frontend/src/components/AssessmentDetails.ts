import { loadTemplate } from "../utils/load-template.js";
import './HistoryQuestion.js';
import './HistoryOption.js'

export class AssessmentDetails extends HTMLElement {
  connectedCallback() {
    this.loadTemplate();
  }

  hideDetails(){
    const modal = document.getElementById("detail-page");
    if (modal) {
      modal.style.display = "none";
    }
  }

  async loadTemplate() {
    const content = await loadTemplate('./templates/assessment-details.component.html');
    this.appendChild(content);
    const modal = document.getElementById("detail-page");
    if (modal) {
      modal.addEventListener("click", () => {
        this.hideDetails();
      });
    }
  }
  
}
customElements.define('assessment-details', AssessmentDetails);
