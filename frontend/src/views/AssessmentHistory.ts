import '../components/AssessmentFilters.js';
import '../components/AssessmentList.js';
import { loadTemplate } from '../utils/load-template.js';
export class AssessmentHistory extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.loadTemplate();
  }
  async loadTemplate() {
    const content = await loadTemplate('./templates/assessment-history.view.html');
    if (content) {
      this.shadowRoot?.appendChild(content);
    } else {
      // content is null
    }
  }
}
customElements.define('assessment-history', AssessmentHistory);
