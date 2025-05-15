import '../components/AssessmentFilters.js';
import '../components/AssessmentList.js';
import { AssessmentList } from '../components/AssessmentList.js';
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
      const filtersComponent = this.shadowRoot?.querySelector("assessment-filters");
      filtersComponent?.addEventListener("filters-changed", (event: Event) => {
        const customEvent = event as CustomEvent;
        const assessmentHistoryLists = this.shadowRoot?.querySelector("assessment-list") as AssessmentList;
        assessmentHistoryLists?.fetchHistory(customEvent.detail);
      });
    } else {
      // content is null
    }
  }
}
customElements.define('assessment-history', AssessmentHistory);
