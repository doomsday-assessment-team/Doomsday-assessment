import { loadTemplate } from "../utils/load-template.js";
export class AssessmentItem extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  async connectedCallback() {
    await this.loadTemplate();
    this.updateContent();
  }
  async loadTemplate() {
    const content = await loadTemplate('./templates/assessment-item.component.html');
    if (content) {
      this.shadowRoot?.appendChild(content);
    } else {
      // content is null
    }
  }
  updateContent() {
    const root = this.shadowRoot;
    if (!root) return;
    root.querySelector('.assessment-date')!.textContent = this.getAttribute('date') || '';
    root.querySelector('.assessment-user')!.textContent = this.getAttribute('user') || '';
    root.querySelector('.assessment-scenario')!.textContent = this.getAttribute('scenario') || '';
    root.querySelector('.assessment-difficulty')!.textContent = this.getAttribute('difficulty') || '';
    root.querySelector('.assessment-points')!.textContent = this.getAttribute('points') || '';
    root.querySelector('.assessment-feedback')!.textContent = this.getAttribute('feedback') || '';
    root.querySelector('.assessment-difficulty-class')!.textContent = this.getAttribute('difficulty')?.toLowerCase() || '';
    root.querySelector('.assessment-points-value')!.textContent = this.getAttribute('points') || '';
  }
}
customElements.define('assessment-item', AssessmentItem);
