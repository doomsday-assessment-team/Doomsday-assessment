import { loadTemplate } from '../utils/load-template.js';
import { apiService } from '../main.js';

interface Option {
  option_id: number;
  question_id : number;
  option_text: string;
  points: number;
}

interface Question {
  question_id: number;
  question_text: string;
  scenario_id: number;
  question_difficulty_id: number;
  options: { option_text: string; points: number }[];
}

interface Scenario {
  scenario_id: number;
  scenario_name: string;
}

interface Difficulty {
  question_difficulty_id: number;
  question_difficulty_name: string;
}

export class QuestionsAndOptions extends HTMLElement {
  private scenarioMap: Map<number, string> = new Map();
  private difficultyMap: Map<number, string> = new Map();
  private questions: Question[] = [];
  

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.loadTemplate();
  }

  private async loadTemplate() {
    try {
      const content = await loadTemplate('./templates/questions-and-options.view.html');
      if (content) {
        this.shadowRoot?.appendChild(content);
        await this.populateFilters();
        await this.fetchAndRenderQuestions();
        this.setupEventListeners();
        this.addDefaultOption();
      }
    } catch (error) {
      console.error('Failed to load template:', error);
    }
  }

  private async fetchAndRenderQuestions(): Promise<void> {
    try {
      this.questions = await apiService.get<Question[]>('/questions');
      this.renderQuestionBank(this.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  }

  private async populateFilters(): Promise<void> {
    try {
      const [scenarios, difficulties] = await Promise.all([
        apiService.get<Scenario[]>('/scenarios'),
        apiService.get<Difficulty[]>('/difficulties'),
      ]);

      const shadow = this.shadowRoot!;
      const scenarioSelects = shadow.querySelectorAll('select[data-type="scenario"]') as NodeListOf<HTMLSelectElement>;
      const difficultySelects = shadow.querySelectorAll('select[data-type="difficulty"]') as NodeListOf<HTMLSelectElement>;

      this.scenarioMap = new Map(scenarios.map(s => [s.scenario_id, s.scenario_name]));
      this.difficultyMap = new Map(difficulties.map(d => [d.question_difficulty_id, d.question_difficulty_name]));

      scenarioSelects.forEach(select => {
        this.populateSelect(select, scenarios, 'scenario_id', 'scenario_name', '-- Select Scenario --');
      });

      difficultySelects.forEach(select => {
        this.populateSelect(select, difficulties, 'question_difficulty_id', 'question_difficulty_name', '-- Select Difficulty --');
      });
    } catch (error) {
      console.error('Error loading filter data:', error);
    }
  }

  private populateSelect<T>(
    select: HTMLSelectElement,
    items: T[],
    valueKey: keyof T,
    textKey: keyof T,
    defaultLabel: string
  ) {
    select.innerHTML = '';
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = defaultLabel;
    select.appendChild(defaultOption);

    items.forEach(item => {
      const option = document.createElement('option');
      option.value = String(item[valueKey]);
      option.textContent = String(item[textKey]);
      select.appendChild(option);
    });
  }

  private setupEventListeners(): void {
    const shadow = this.shadowRoot!;
    const scenarioFilter = shadow.getElementById('scenario-filter') as HTMLSelectElement;
    const difficultyFilter = shadow.getElementById('difficulty-filter') as HTMLSelectElement;
    const clearBtn = shadow.querySelector('button[type="reset"]')!;
    const showAddBtn = shadow.getElementById('show-add-question') as HTMLButtonElement;
    const addSection = shadow.getElementById('add-question-section')!;

    scenarioFilter.addEventListener('change', () => this.filterQuestions());
    difficultyFilter.addEventListener('change', () => this.filterQuestions());

    clearBtn.addEventListener('click', e => {
      e.preventDefault();
      scenarioFilter.value = '';
      difficultyFilter.value = '';
      this.renderQuestionBank(this.questions);
    });

    showAddBtn.addEventListener('click', () => {
      addSection.classList.toggle('hidden');
    });

    const addOptionBtn = shadow.getElementById('add-option-button') as HTMLButtonElement;
    addOptionBtn.addEventListener('click', () => this.addOption());

    const submitBtn = shadow.querySelector('#add-question-section button[type="submit"]')!;
    submitBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      await this.handleNewQuestionSubmit();
    });
  }

  private addOption(): void {
    const shadow = this.shadowRoot!;
    const optionList = shadow.getElementById('dynamic-option-list') as HTMLUListElement;
    const index = optionList.children.length + 1;

    const li = document.createElement('li');

    const label = document.createElement('label');
    label.textContent = `Option ${index}:`;

    const inputText = document.createElement('input');
    inputText.type = 'text';
    inputText.placeholder = `Enter option ${index}`;

    const inputPoints = document.createElement('input');
    inputPoints.type = 'number';
    inputPoints.placeholder = 'Points';
    inputPoints.min = '0';

    li.appendChild(label);
    li.appendChild(inputText);
    li.appendChild(inputPoints);

    optionList.appendChild(li);
  }

  private addDefaultOption(): void {
    const shadow = this.shadowRoot!;
    const optionList = shadow.getElementById('dynamic-option-list') as HTMLUListElement;
    optionList.innerHTML = ''; // clear
    this.addOption(); // add first
  }

  private async handleNewQuestionSubmit(): Promise<void> {
    const shadow = this.shadowRoot!;
    const textInput = shadow.getElementById('new-question') as HTMLInputElement;
    const scenarioSelect = shadow.getElementById('new-scenario') as HTMLSelectElement;
    const difficultySelect = shadow.getElementById('new-difficulty') as HTMLSelectElement;
    const optionList = shadow.getElementById('dynamic-option-list') as HTMLUListElement;

    const questionText = textInput.value.trim();
    const scenario = scenarioSelect.value;
    const difficulty = difficultySelect.value;

    const options: { option_text: string; points: number }[] = [];
    optionList.querySelectorAll('li').forEach(li => {
      const inputs = li.querySelectorAll('input');
      const optionText = (inputs[0] as HTMLInputElement)?.value.trim();
      const pointsValue = parseInt((inputs[1] as HTMLInputElement)?.value.trim(), 10);
      if (optionText && !isNaN(pointsValue)) {
        options.push({ option_text: optionText, points: pointsValue });
      }
    });

    if (!questionText || !scenario || !difficulty || options.length === 0) {
      alert('Please fill all fields and add at least one valid option.');
      return;
    }

    try {
      await apiService.post('/questions', {
        question_text: questionText,
        scenario_id: Number(scenario),
        question_difficulty_id: Number(difficulty),
        options
      });

      await this.fetchAndRenderQuestions();

      textInput.value = '';
      scenarioSelect.value = '';
      difficultySelect.value = '';
      this.addDefaultOption();
    } catch (error) {
      console.error('Failed to submit new question:', error);
    }
  }

  private async deleteQuestion(id: number): Promise<void> {
    try {
      await apiService.delete(`/questions/${id}`);
      this.questions = this.questions.filter(q => q.question_id !== id);
      
      this.renderQuestionBank(this.questions);
    } catch (error) {
      console.error(`Failed to delete question ${id}:`, error);
    }
  }

 private renderQuestionBank(questions: Question[]): void {
    const container = this.shadowRoot!.getElementById('question-bank')!;
    container.textContent = '';

    questions.forEach(q => {
        const article = document.createElement('article');

        const header = document.createElement('header');
        const h4 = document.createElement('h4');
        h4.textContent = q.question_text;

        const p = document.createElement('p');
        const scenarioName = this.scenarioMap.get(q.scenario_id) ?? `Scenario ${q.scenario_id}`;
        const difficultyName = this.difficultyMap.get(q.question_difficulty_id) ?? `Difficulty ${q.question_difficulty_id}`;
        p.textContent = `Scenario: ${scenarioName} | Difficulty: ${difficultyName}`;
        header.appendChild(h4);
        header.appendChild(p);
        header.style.cursor = 'pointer';

        const section = document.createElement('section');
        section.hidden = true;

        const questionInput = document.createElement('input');
        questionInput.value = q.question_text;
        questionInput.hidden = true;

        const optionList = document.createElement('ul');
        q.options.forEach(opt => {
            const li = document.createElement('li');

            const textInput = document.createElement('input');
            textInput.type = 'text';
            textInput.value = opt.option_text;
            textInput.disabled = true;

            const pointInput = document.createElement('input');
            pointInput.type = 'number';
            pointInput.value = String(opt.points);
            pointInput.disabled = true;

            li.appendChild(textInput);
            li.appendChild(pointInput);
            optionList.appendChild(li);
        });

        header.addEventListener('click', () => {
            section.hidden = !section.hidden;
        });

        section.appendChild(questionInput);
        section.appendChild(optionList);

        article.appendChild(header);
        article.appendChild(section);
        container.appendChild(article);
    });
}

private filterQuestions(): void {
    const shadow = this.shadowRoot!;
    const scenarioVal = (shadow.getElementById('scenario-filter') as HTMLSelectElement).value;
    const difficultyVal = (shadow.getElementById('difficulty-filter') as HTMLSelectElement).value;

    const filtered = this.questions.filter(q => {
        const matchScenario = !scenarioVal || q.scenario_id.toString() === scenarioVal;
        const matchDifficulty = !difficultyVal || q.question_difficulty_id.toString() === difficultyVal;
        return matchScenario && matchDifficulty;
    });

    this.renderQuestionBank(filtered);
}
  }

customElements.define('questions-and-options', QuestionsAndOptions);