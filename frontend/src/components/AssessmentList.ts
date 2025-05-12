import { loadTemplate } from '../utils/load-template.js';
import './AssessmentItem.js';

export class AssessmentList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.loadTemplate();
  }
  
  async loadTemplate() {
    const content = await loadTemplate('./templates/assessment-list.component.html');
    if (content){
      this.shadowRoot?.appendChild(content);
    } else {
      // content is null
    }
  }
}

customElements.define('assessment-list', AssessmentList);
