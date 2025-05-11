import template from '../components/questions and options.html';

export class QuestionsAndOptions {
  private template: string;

  constructor() {
    this.template = template;
  }

  public render(container: HTMLElement): void {
    container.innerHTML = this.template;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    const scenarioFilter = document.getElementById('scenario-filter') as HTMLSelectElement;
    const difficultyFilter = document.getElementById('difficulty-filter') as HTMLSelectElement;
    const clearFiltersBtn = document.querySelector('button[type="reset"]');

    if (scenarioFilter) {
      scenarioFilter.addEventListener('change', () => {
        console.log(`Scenario selected: ${scenarioFilter.value}`);
        this.filterQuestions();
      });
    }

    if (difficultyFilter) {
      difficultyFilter.addEventListener('change', () => {
        console.log(`Difficulty selected: ${difficultyFilter.value}`);
        this.filterQuestions();
      });
    }

    if (clearFiltersBtn) {
      clearFiltersBtn.addEventListener('click', () => {
        scenarioFilter.value = '';
        difficultyFilter.value = '';
        this.filterQuestions();
      });
    }

    this.setupActionButtons();
  }

  private setupActionButtons(): void {
    const editButtons = document.querySelectorAll('button:contains("Edit")');
    const deleteButtons = document.querySelectorAll('button:contains("Delete")');

    editButtons.forEach((btn) =>
      btn.addEventListener('click', () => {
        console.log('Edit clicked');
      })
    );

    deleteButtons.forEach((btn) =>
      btn.addEventListener('click', () => {
        console.log('Delete clicked');
      })
    );
  }

  private filterQuestions(): void {
    const scenario = (document.getElementById('scenario-filter') as HTMLSelectElement).value;
    const difficulty = (document.getElementById('difficulty-filter') as HTMLSelectElement).value;

    console.log(`Filtering by: Scenario=${scenario}, Difficulty=${difficulty}`);
  }

  public getTemplate(): string {
    return this.template;
  }
}
