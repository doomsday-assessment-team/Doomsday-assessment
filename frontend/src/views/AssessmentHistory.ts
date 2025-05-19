import '../components/AssessmentFilters.js';
import '../components/AssessmentList.js';
import '../components/HeaderComponent.js'
import '../components/AssessmentDetailsModal.js'
import { loadTemplate } from '../utils/load-template.js';
export class AssessmentHistory extends HTMLElement {
  connectedCallback() {
    this.loadTemplate();
  }
  async loadTemplate() {
    const content = await loadTemplate('./templates/assessment-history.view.html');
    this.appendChild(content);
  }
}
customElements.define('assessment-history', AssessmentHistory);
