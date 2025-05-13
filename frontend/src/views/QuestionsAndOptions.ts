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
      this.setupEventListeners();
    } else {
      // content is null
    }
  }

  private questions = [
  {
    text: "What’s the best first move in a zombie apocalypse?",
    scenario: "zombie",
    difficulty: "medium",
    options: [
      "Find weapons",
      "Secure water",
      "Find allies",
      "Head to rural area",
      "Barricade your home"
    ]
  },
  {
    text: "How should you communicate with others during an alien invasion?",
    scenario: "alien",
    difficulty: "hard",
    options: [
      "Use coded messages",
      "Avoid all broadcasts",
      "Only use satellite phones",
      "Join government communication",
      "Send out distress beacons"
    ]
  },
  {
    text: "Where is the safest place during a nuclear disaster?",
    scenario: "nuclear",
    difficulty: "medium",
    options: [
      "Underground bunker",
      "Concrete basement",
      "Evacuate the area",
      "Inside a lead-lined room",
      "Near a large body of water"
    ]
  },
  {
    text: "What food should you prioritize in a climate catastrophe?",
    scenario: "climate",
    difficulty: "easy",
    options: [
      "Non-perishable canned goods",
      "Fresh vegetables",
      "Frozen meat",
      "Dairy products",
      "Bread and grains"
    ]
  },
  {
    text: "How do you protect your shelter in a zombie apocalypse?",
    scenario: "zombie",
    difficulty: "hard",
    options: [
      "Use steel reinforcements",
      "Set perimeter alarms",
      "Stay quiet and hidden",
      "Cover windows with wood",
      "Have an escape route"
    ]
  },
  {
    text: "What’s the best way to purify water during a climate crisis?",
    scenario: "climate",
    difficulty: "medium",
    options: [
      "Boiling",
      "Solar stills",
      "Chemical tablets",
      "Filtration pumps",
      "Rainwater collection"
    ]
  }
];



  private setupEventListeners(): void {
    const shadow = this.shadowRoot;
    if (!shadow) return;

    this.renderQuestionBank();

    const scenarioFilter = shadow.getElementById('scenario-filter') as HTMLSelectElement;
    const difficultyFilter = shadow.getElementById('difficulty-filter') as HTMLSelectElement;
    const clearBtn = shadow.querySelector('button[type="reset"]') as HTMLButtonElement;
    const addOptionBtn = shadow.getElementById('add-option-button') as HTMLButtonElement;
    const optionList = shadow.getElementById('dynamic-option-list') as HTMLUListElement;


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
  
    const showAddBtn = shadow.getElementById('show-add-question') as HTMLButtonElement | null;
    const addQuestionSection = shadow.getElementById('add-question-section') as HTMLElement | null;

    if (showAddBtn && addQuestionSection) {
      showAddBtn.addEventListener('click', () => {
        addQuestionSection.classList.toggle('hidden');
      });
    }

    if (addOptionBtn && optionList) {
  addOptionBtn.addEventListener('click', () => {
    const optionIndex = optionList.children.length + 1;

    const li = document.createElement('li');

    const label = document.createElement('label');
    label.textContent = `Option ${optionIndex}:`;

    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = `Enter option ${optionIndex}`;

    li.appendChild(label);
    li.appendChild(input);
    optionList.appendChild(li);
  });
}}

private renderQuestionBank(): void {
  const shadow = this.shadowRoot;
  if (!shadow) return;

  const container = shadow.getElementById('question-bank');
  if (!container) return;

  container.innerHTML = '';

  this.questions.forEach((q, index) => {
    const article = document.createElement('article');

    const header = document.createElement('header');
    const title = document.createElement('h4');
    title.textContent = q.text;

    const meta = document.createElement('p');
    meta.innerHTML = `<strong>Scenario:</strong> ${q.scenario} | <strong>Difficulty:</strong> ${q.difficulty}`;
    header.appendChild(title);
    header.appendChild(meta);
    header.style.cursor = 'pointer';

    const section = document.createElement('section');
    section.hidden = true;

    const questionInput = document.createElement('input');
    questionInput.type = 'text';
    questionInput.value = q.text;
    questionInput.hidden = true;

    const optionsList = document.createElement('ul');
    q.options.forEach(opt => {
      const li = document.createElement('li');
      const input = document.createElement('input');
      input.type = 'text';
      input.value = opt;
      input.disabled = true;
      li.appendChild(input);
      optionsList.appendChild(li);
    });

    const editBtn = document.createElement('button');
    editBtn.textContent = 'Edit';

    const saveBtn = document.createElement('button');
    saveBtn.textContent = 'Save';
    saveBtn.hidden = true;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';

    // Expand/collapse
    header.addEventListener('click', () => {
      section.hidden = !section.hidden;
    });

    editBtn.addEventListener('click', () => {
      questionInput.hidden = false;
      questionInput.value = q.text;
      optionsList.querySelectorAll('input').forEach(i => i.removeAttribute('disabled'));
      editBtn.hidden = true;
      saveBtn.hidden = false;
    });

    saveBtn.addEventListener('click', () => {
      q.text = questionInput.value;
      q.options = Array.from(optionsList.querySelectorAll('input')).map(i => i.value);
      this.renderQuestionBank();
    });

    deleteBtn.addEventListener('click', () => {
      this.questions.splice(index, 1);
      this.renderQuestionBank();
    });

    section.appendChild(questionInput);
    section.appendChild(optionsList);
    section.appendChild(editBtn);
    section.appendChild(saveBtn);
    section.appendChild(deleteBtn);

    article.appendChild(header);
    article.appendChild(section);
    container.appendChild(article);
  });
  }

  private renderQuestionBankFilter(questionsToRender: any[]): void {
  const shadow = this.shadowRoot;
  if (!shadow) return;

  const bankSection = shadow.querySelector('section:last-of-type');
  if (!bankSection) return;

  // Clear old content
  const oldArticles = bankSection.querySelectorAll('article');
  oldArticles.forEach(el => el.remove());

  for (const question of questionsToRender) {
    const article = document.createElement('article');

    const h4 = document.createElement('h4');
    h4.textContent = question.text;
    article.appendChild(h4);

    const p = document.createElement('p');
    p.innerHTML = `<strong>Scenario:</strong> ${question.scenario.charAt(0).toUpperCase() + question.scenario.slice(1)} | <strong>Difficulty:</strong> ${question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}`;
    article.appendChild(p);

    const editBtn = document.createElement('button');
    editBtn.textContent = "Edit";
    article.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = "Delete";
    article.appendChild(deleteBtn);

    const saveBtn = document.createElement('button');
    saveBtn.textContent = "Save";
    article.appendChild(saveBtn);

    const ul = document.createElement('ul');
    for (const opt of question.options) {
      const li = document.createElement('li');
      const input = document.createElement('input');
      input.value = opt;
      li.appendChild(input);
      ul.appendChild(li);
    }

    article.appendChild(ul);
    bankSection.appendChild(article);
  }
} 

  private filterQuestions(): void {
    const shadow = this.shadowRoot;
    if (!shadow) return;

    const scenario = (shadow.getElementById('scenario-filter') as HTMLSelectElement).value;
    const difficulty = (shadow.getElementById('difficulty-filter') as HTMLSelectElement).value;

    console.log(`Filter selected: Scenario = ${scenario}, Difficulty = ${difficulty}`);

    const filtered = this.questions.filter(q => {
    const matchesScenario = !scenario || q.scenario === scenario;
    const matchesDifficulty = !difficulty || q.difficulty === difficulty;
    return matchesScenario && matchesDifficulty;});
    this.renderQuestionBankFilter(filtered);
  }


  
}

customElements.define('questions-and-options', QuestionsAndOptions);
