import { loadTemplate } from '../utils/load-template.js';

export class QuestionsAndOptions extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.loadTemplate();
  }

  async loadTemplate() {
    const content = await loadTemplate('./templates/questions-and-options.view.html');

    if (content){
      this.shadowRoot?.appendChild(content);
    } else {
      // content is null
    }
  }

  private setupEventListeners(): void {
    const shadow = this.shadowRoot;
    if (!shadow) return;

    const scenarioFilter = shadow.getElementById('scenario-filter') as HTMLSelectElement;
    const difficultyFilter = shadow.getElementById('difficulty-filter') as HTMLSelectElement;
    const clearBtn = shadow.querySelector('button[type="reset"]') as HTMLButtonElement;

    scenarioFilter?.addEventListener('change', () => {
      console.log(`Scenario selected: ${scenarioFilter.value}`);
      this.filterQuestions();
    });

    difficultyFilter?.addEventListener('change', () => {
      console.log(`Difficulty selected: ${difficultyFilter.value}`);
      this.filterQuestions();
    });

    clearBtn?.addEventListener('click', () => {
      scenarioFilter.value = '';
      difficultyFilter.value = '';
      this.filterQuestions();
    });
  }

  private filterQuestions(): void {
    const shadow = this.shadowRoot;
    if (!shadow) return;

    const scenario = (shadow.getElementById('scenario-filter') as HTMLSelectElement).value;
    const difficulty = (shadow.getElementById('difficulty-filter') as HTMLSelectElement).value;

    console.log(`Filter selected: Scenario = ${scenario}, Difficulty = ${difficulty}`);
  }
}

customElements.define('questions-and-options', QuestionsAndOptions);
