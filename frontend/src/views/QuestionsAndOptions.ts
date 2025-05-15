import { loadTemplate } from '../utils/load-template.js';

export class QuestionsAndOptions extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.loadTemplate();
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

  async loadTemplate() {
    const content = await loadTemplate('./templates/questions-and-options.view.html');
    if (content) {
      this.shadowRoot?.appendChild(content);
      this.setupEventListeners();
      this.renderQuestionBank();
    }
  }

  private setupEventListeners(): void {
    const shadow = this.shadowRoot;
    if (!shadow) return;

    const scenarioFilter = shadow.getElementById('scenario-filter') as HTMLSelectElement;
    const difficultyFilter = shadow.getElementById('difficulty-filter') as HTMLSelectElement;
    const clearBtn = shadow.querySelector('button[type="reset"]') as HTMLButtonElement;
    const addOptionBtn = shadow.getElementById('add-option-button') as HTMLButtonElement;
    const optionList = shadow.getElementById('dynamic-option-list') as HTMLUListElement;
    const showAddBtn = shadow.getElementById('show-add-question') as HTMLButtonElement;
    const addQuestionSection = shadow.getElementById('add-question-section') as HTMLElement;

    // Add Option Button
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
    }

    // Show/Hide Add Section
    if (showAddBtn && addQuestionSection) {
      showAddBtn.addEventListener('click', () => {
        addQuestionSection.classList.toggle('hidden');
      });
    }

    // Filter change
    scenarioFilter?.addEventListener('change', () => this.filterQuestions());
    difficultyFilter?.addEventListener('change', () => this.filterQuestions());

    // Clear Filters
    clearBtn?.addEventListener('click', (e) => {
      e.preventDefault();
      scenarioFilter.value = '';
      difficultyFilter.value = '';
      this.filterQuestions();
    });

    // Save New Question
    const saveQuestionBtn = shadow.querySelector('#add-question-section button[type="submit"]') as HTMLButtonElement;
    const questionTextInput = shadow.getElementById('new-question') as HTMLInputElement;
    const scenarioSelect = shadow.getElementById('new-scenario') as HTMLSelectElement;
    const difficultySelect = shadow.getElementById('new-difficulty') as HTMLSelectElement;

    if (saveQuestionBtn && questionTextInput && scenarioSelect && difficultySelect && optionList) {
      saveQuestionBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const questionText = questionTextInput.value.trim();
        const scenario = scenarioSelect.value;
        const difficulty = difficultySelect.value;

        const optionInputs = optionList.querySelectorAll('input[type="text"]');
        const options = Array.from(optionInputs)
          .map(input => (input as HTMLInputElement).value.trim())
          .filter(val => val !== '');

        if (!questionText || !scenario || !difficulty || options.length === 0) {
          alert('Please fill out all fields and enter at least one option.');
          return;
        }

        const newQuestion = { text: questionText, scenario, difficulty, options };
        this.questions.push(newQuestion);
        this.renderQuestionBank();

        // Reset form
        questionTextInput.value = '';
        scenarioSelect.value = '';
        difficultySelect.value = '';
        optionList.innerHTML = '';
        const firstOption = document.createElement('li');
        firstOption.innerHTML = `
          <label>Option 1:</label>
          <input type="text" placeholder="Enter option 1">
        `;
        optionList.appendChild(firstOption);
      });
    }
  }

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

      header.addEventListener('click', () => {
        section.hidden = !section.hidden;
      });

      editBtn.addEventListener('click', () => {
        questionInput.hidden = false;
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

  private filterQuestions(): void {
    const shadow = this.shadowRoot;
    if (!shadow) return;

    const scenario = (shadow.getElementById('scenario-filter') as HTMLSelectElement).value;
    const difficulty = (shadow.getElementById('difficulty-filter') as HTMLSelectElement).value;

    const filtered = this.questions.filter(q => {
      const matchesScenario = !scenario || q.scenario === scenario;
      const matchesDifficulty = !difficulty || q.difficulty === difficulty;
      return matchesScenario && matchesDifficulty;
    });

    const container = shadow.getElementById('question-bank');
    if (!container) return;

    container.innerHTML = '';
    filtered.forEach((q, index) => {
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

      header.addEventListener('click', () => {
        section.hidden = !section.hidden;
      });

      editBtn.addEventListener('click', () => {
        questionInput.hidden = false;
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
}

customElements.define('questions-and-options', QuestionsAndOptions);
