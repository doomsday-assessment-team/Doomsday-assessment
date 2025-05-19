import { loadTemplate } from '../utils/load-template.js'; // Assuming this path is correct
import { apiService } from '../main.js'; // Assuming this path is correct

// Interfaces
interface OptionInput { // Matches backend OptionInput
  option_text: string;
  points: number;
}

interface Option extends OptionInput { // Frontend representation, includes IDs
  option_id: number;
  question_id: number; 
}

interface QuestionInput_BE { // Matches backend QuestionInput
  question_text: string;
  scenario_id: number;
  question_difficulty_id: number;
  options: OptionInput[];
}

interface Question { // Frontend representation of a full Question object
  question_id: number;
  question_text: string;
  scenario_id: number;
  question_difficulty_id: number;
  question_difficulty_name?: string; // From GET requests
  options: Option[]; // Array of full Option objects
}

interface Scenario {
  scenario_id: number;
  scenario_name: string;
  status?: string; 
}

interface Difficulty {
  question_difficulty_id: number;
  question_difficulty_name: string;
}

type ModalConfirmCallback = (formData?: any) => Promise<void> | void;

export class QuestionsAndOptions extends HTMLElement {
  private scenarios: Scenario[] = [];
  private questions: Question[] = [];
  private difficulties: Difficulty[] = [];

  private scenarioMap = new Map<number, string>();
  private difficultyMap = new Map<number, string>();

  private modalElement: HTMLElement | null = null;
  private modalTitleElement: HTMLElement | null = null;
  private modalBodyElement: HTMLElement | null = null;
  private modalConfirmButton: HTMLButtonElement | null = null;
  private modalCancelButton: HTMLButtonElement | null = null;
  private modalCloseButton: HTMLButtonElement | null = null;
  private currentModalConfirmCallback: ModalConfirmCallback | null = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.loadInitialTemplate();
  }

  private showMessage(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    let container = this.shadowRoot?.getElementById('message-container');
    if (!container && this.shadowRoot) { // Check if shadowRoot exists before trying to append
        const messageDiv = document.createElement('div');
        messageDiv.id = 'message-container';
        // It's better if #message-container and its styles are defined in your HTML template.
        // This is a fallback.
        messageDiv.style.position = 'fixed';
        messageDiv.style.bottom = '20px';
        messageDiv.style.left = '50%';
        messageDiv.style.transform = 'translateX(-50%)';
        messageDiv.style.padding = '1rem 1.5rem'; // Example padding
        messageDiv.style.borderRadius = '0.5rem'; // Example radius
        messageDiv.style.color = '#1a1a14'; // Example text color
        messageDiv.style.fontSize = '1rem'; // Example font size
        messageDiv.style.opacity = '0';
        messageDiv.style.display = 'none';
        messageDiv.style.transition = 'opacity 0.3s ease-in-out, transform 0.3s ease-in-out';
        messageDiv.style.zIndex = '10000';
        messageDiv.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
        messageDiv.style.minWidth = '250px';
        messageDiv.style.textAlign = 'center';
        this.shadowRoot.appendChild(messageDiv);
        container = messageDiv; 
    }
    
    if (!container) { // If still no container (e.g., shadowRoot was null)
        console.warn('Message container not found and could not be created. Message:', message);
        alert(message); // Ultimate fallback
        return;
    }
    
    container.textContent = message;
    // Ensure base class is applied if not already there from HTML template
    if (!container.classList.contains('message-toast')) {
        container.classList.add('message-toast');
    }
    
    // Remove previous type classes
    container.classList.remove('success', 'error', 'warning', 'active');

    if (type === 'success') container.classList.add('success');
    else if (type === 'error') container.classList.add('error');
    else if (type === 'warning') container.classList.add('warning');

    container.style.opacity = '1';
    container.style.display = 'block'; 
    container.classList.add('active');

    setTimeout(() => {
      container.style.opacity = '0';
      container.classList.remove('active');
      setTimeout(() => {
        container.style.display = 'none';
        container.classList.remove('success', 'error', 'warning'); 
      }, 300); 
    }, 3000); 
  }

  private async loadInitialTemplate() {
    try {
      const content = await loadTemplate('./templates/questions-and-options.view.html');
      if (content && this.shadowRoot) { // Ensure shadowRoot is available
        this.shadowRoot.appendChild(content.cloneNode(true));
        this.initializeModalElements(); 
        await this.loadData();
        this.updateStatCards();
        this.setupEventListeners();
      } else if (!this.shadowRoot) {
        console.error("Shadow DOM not available for template loading.");
        alert("Critical error: UI cannot be initialized.");
      }
    } catch (error) {
      this.showMessage('❌ Failed to load template.', 'error');
      console.error('Template load error:', error);
    }
  }

  private initializeModalElements() {
    if (!this.shadowRoot) return;
    this.modalElement = this.shadowRoot.getElementById('universal-modal') as HTMLElement;
    this.modalTitleElement = this.shadowRoot.getElementById('modal-title') as HTMLElement;
    this.modalBodyElement = this.shadowRoot.getElementById('modal-body') as HTMLElement;
    this.modalConfirmButton = this.shadowRoot.getElementById('modal-confirm-btn') as HTMLButtonElement;
    this.modalCancelButton = this.shadowRoot.getElementById('modal-cancel-btn') as HTMLButtonElement;
    this.modalCloseButton = this.shadowRoot.getElementById('modal-close-btn') as HTMLButtonElement;

    if(this.modalConfirmButton) this.modalConfirmButton.addEventListener('click', this.handleModalConfirm.bind(this));
    if(this.modalCancelButton) this.modalCancelButton.addEventListener('click', this.closeModal.bind(this));
    if(this.modalCloseButton) this.modalCloseButton.addEventListener('click', this.closeModal.bind(this));
    if(this.modalElement) {
        this.modalElement.addEventListener('click', (event) => { 
            if (event.target === this.modalElement) this.closeModal();
        });
    }
  }

  private openModal(
    title: string, 
    contentHTML: string, 
    confirmCallback: ModalConfirmCallback,
    confirmButtonText: string = "Confirm",
    isDeleteOperation: boolean = false 
  ) {
    if (!this.modalElement || !this.modalTitleElement || !this.modalBodyElement || !this.modalConfirmButton) {
        this.showMessage("Error: Modal UI components are missing.", "error"); return;
    }
    this.modalTitleElement.textContent = title;
    this.modalBodyElement.innerHTML = contentHTML; 
    this.currentModalConfirmCallback = confirmCallback;
    
    this.modalConfirmButton.textContent = confirmButtonText;
    this.modalConfirmButton.classList.remove('btn-primary', 'btn-danger'); // Clear previous states
    if (isDeleteOperation) {
        this.modalConfirmButton.classList.add('btn-danger'); 
    } else {
        this.modalConfirmButton.classList.add('btn-primary');
    }
    this.modalElement.classList.add('active');
  }

  private closeModal() {
    this.modalElement?.classList.remove('active');
    if(this.modalBodyElement) this.modalBodyElement.innerHTML = ''; 
    this.currentModalConfirmCallback = null;
    if (this.modalConfirmButton) {
        this.modalConfirmButton.classList.remove('btn-danger');
        this.modalConfirmButton.classList.add('btn-primary');
        this.modalConfirmButton.textContent = 'Confirm';
    }
  }

  private async handleModalConfirm() {
    if (this.currentModalConfirmCallback && this.modalBodyElement) {
        const form = this.modalBodyElement.querySelector('form');
        if (form) { 
            const formData = new FormData(form);
            const data: Record<string, any> = {};
            formData.forEach((value, key) => { data[key] = value; });
            if (this.validateModalForm(form)) {
                await this.currentModalConfirmCallback(data);
                // For forms, the callback (e.g., addScenario) should close the modal on success
            }
        } else { 
             await this.currentModalConfirmCallback();
             this.closeModal(); // Close modal for simple confirms (like delete)
        }
    }
  }
  
  private validateModalForm(form: HTMLFormElement): boolean {
    let isValid = true;
    form.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('[required]').forEach(input => {
        const parent = input.parentElement;
        parent?.querySelector('.error-message')?.remove(); // Clear previous error for this input
        input.style.borderColor = 'var(--border-color)';

        if (!input.value || (typeof input.value === 'string' && input.value.trim() === "")) {
            isValid = false;
            input.style.borderColor = 'var(--danger-color)'; 
            const errorSpan = document.createElement('span');
            errorSpan.className = 'error-message';
            errorSpan.style.color = 'var(--danger-color)';
            errorSpan.style.fontSize = 'var(--font-size-small)';
            errorSpan.style.display = 'block';
            errorSpan.style.marginTop = 'var(--spacing-xs)';
            const labelElement = parent?.querySelector('label[for="' + input.id + '"]');
            const fieldName = labelElement?.textContent?.replace(':','') || input.name || 'This field';
            errorSpan.textContent = `${fieldName} is required.`;
            parent?.appendChild(errorSpan);
        } else if (input.type === 'number' && isNaN(parseFloat(input.value))) {
            isValid = false;
            input.style.borderColor = 'var(--danger-color)';
            const errorSpan = document.createElement('span'); 
            errorSpan.className = 'error-message'; // Assign class for consistency
            errorSpan.style.color = 'var(--danger-color)';
            errorSpan.style.fontSize = 'var(--font-size-small)';
            errorSpan.style.display = 'block';
            errorSpan.style.marginTop = 'var(--spacing-xs)';
            const labelElement = parent?.querySelector('label[for="' + input.id + '"]');
            const fieldName = labelElement?.textContent?.replace(':','') || input.name || 'Field';
            errorSpan.textContent = `${fieldName} must be a valid number.`;
            parent?.appendChild(errorSpan);
        }
    });
    if (!isValid) this.showMessage("Please correct the errors in the form.", "warning");
    return isValid;
  }

  private async loadData() {
    try {
      const [scenarios, questionsData, difficulties] = await Promise.all([
        apiService.get<Scenario[]>('/scenarios'),
        apiService.get<Question[]>('/questions'), 
        apiService.get<Difficulty[]>('/difficulties'),
      ]);
      this.scenarios = scenarios;
      this.questions = questionsData.map(q => ({
          ...q,
          options: q.options || [] // Ensure options is always an array
      }));
      this.difficulties = difficulties;

      this.scenarioMap = new Map(this.scenarios.map(s => [s.scenario_id, s.scenario_name]));
      this.difficultyMap = new Map(this.difficulties.map(d => [d.question_difficulty_id, d.question_difficulty_name]));
      this.renderScenariosTable();
      this.renderQuestionsTable();
    } catch (error) {
      this.showMessage('⚠️ Failed to load initial data.', 'warning');
      console.error('Data load error:', error);
    }
  }

  private updateStatCards() {
    if (!this.shadowRoot) return;
    const scenariosCountEl = this.shadowRoot.getElementById('scenarios-count');
    if (scenariosCountEl) scenariosCountEl.textContent = this.scenarios.length.toString();
    const questionsCountEl = this.shadowRoot.getElementById('questions-count');
    if (questionsCountEl) questionsCountEl.textContent = this.questions.length.toString();
  }

  private setupEventListeners() {
    if (!this.shadowRoot) return;
    this.setupTabs();
    this.setupSearchFilters();
    this.shadowRoot.getElementById('create-scenario-btn')?.addEventListener('click', () => this.handleOpenAddScenarioModal());
    this.shadowRoot.getElementById('create-question-btn')?.addEventListener('click', () => this.handleOpenAddQuestionModal());
  }

  private setupTabs() { 
    if (!this.shadowRoot) return;
    const tabs = this.shadowRoot.querySelectorAll('.tabs button.tab');
    const tabContents = this.shadowRoot.querySelectorAll('.tab-content');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const tabName = tab.getAttribute('data-tab');
        tabContents.forEach(content => {
          content.id === `${tabName}-tab` ? content.classList.add('active') : content.classList.remove('active');
        });
      });
    });
  }
  private setupSearchFilters() { 
    if (!this.shadowRoot) return;
    const scenarioSearchInput = this.shadowRoot.getElementById('scenario-search-input') as HTMLInputElement;
    const questionSearchInput = this.shadowRoot.getElementById('question-search-input') as HTMLInputElement;
    
    scenarioSearchInput?.addEventListener('input', () => this.renderScenariosTable(scenarioSearchInput.value));
    questionSearchInput?.addEventListener('input', () => this.renderQuestionsTable(questionSearchInput.value));
  }
  private getQuestionCountForScenario(scenarioId: number): number { 
    return this.questions.filter(q => q.scenario_id === scenarioId).length;
  }
  private renderScenariosTable(filter: string = '') { 
    if (!this.shadowRoot) return;
    const table = this.shadowRoot.querySelector('#scenarios-tab .table');
    if (!table) { console.error('Scenarios table not found'); return; }
    let tbody = table.querySelector('tbody');
    if (!tbody) { tbody = document.createElement('tbody'); table.appendChild(tbody); }
    tbody.innerHTML = '';
    const filteredScenarios = this.scenarios.filter(s => s.scenario_name.toLowerCase().includes(filter.toLowerCase()));
    if (filteredScenarios.length === 0) {
      const r = tbody.insertRow(); r.insertCell().colSpan = 4; r.cells[0].textContent = 'No scenarios found.'; r.cells[0].style.textAlign = 'center'; return;
    }
    filteredScenarios.forEach(scenario => {
      const row = tbody!.insertRow();
      row.insertCell().textContent = scenario.scenario_name;
      const statusCell = row.insertCell();
      const statusBadge = document.createElement('span');
      statusBadge.className = 'badge';
      statusBadge.textContent = scenario.status || 'Active'; 
      statusBadge.style.backgroundColor = `var(--${(scenario.status || 'Active').toLowerCase()}-badge, var(--success-color))`;
      statusBadge.style.color = 'var(--dark-bg)';
      statusBadge.style.padding = 'var(--spacing-xs) var(--spacing-sm)';
      statusBadge.style.borderRadius = 'var(--border-radius-sm)';
      statusCell.appendChild(statusBadge);
      row.insertCell().textContent = this.getQuestionCountForScenario(scenario.scenario_id).toString();
      const actionCell = row.insertCell(); actionCell.className = 'table-actions';
      const editBtn = document.createElement('button'); editBtn.className = 'action-btn edit'; editBtn.innerHTML = '<i class="icon-edit"></i>';
      editBtn.setAttribute('aria-label', `Edit scenario ${scenario.scenario_name}`);
      editBtn.addEventListener('click', () => this.handleOpenEditScenarioModal(scenario)); actionCell.appendChild(editBtn);
      const deleteBtn = document.createElement('button'); deleteBtn.className = 'action-btn delete'; deleteBtn.innerHTML = '<i class="icon-delete"></i>';
      deleteBtn.setAttribute('aria-label', `Delete scenario ${scenario.scenario_name}`);
      deleteBtn.addEventListener('click', () => this.confirmAndDeleteScenario(scenario)); 
      actionCell.appendChild(deleteBtn);
    });
  }
  private renderQuestionsTable(filter: string = '') { 
    if (!this.shadowRoot) return;
    const table = this.shadowRoot.querySelector('#questions-tab .table');
    if (!table) { console.error('Questions table not found'); return; }
    let tbody = table.querySelector('tbody');
    if (!tbody) { tbody = document.createElement('tbody'); table.appendChild(tbody); }
    tbody.innerHTML = '';
    const filteredQuestions = this.questions.filter(q =>
      q.question_text.toLowerCase().includes(filter.toLowerCase()) ||
      (this.scenarioMap.get(q.scenario_id) || '').toLowerCase().includes(filter.toLowerCase()) ||
      (this.difficultyMap.get(q.question_difficulty_id) || '').toLowerCase().includes(filter.toLowerCase())
    );
    if (filteredQuestions.length === 0) {
      const r = tbody.insertRow(); r.insertCell().colSpan = 5; r.cells[0].textContent = 'No questions found.'; r.cells[0].style.textAlign = 'center'; return;
    }
    filteredQuestions.forEach(question => {
      const row = tbody!.insertRow();
      const questionCell = row.insertCell(); const details = document.createElement('details'); details.className = 'question-details';
      const summary = document.createElement('summary'); summary.textContent = question.question_text;
      const chevron = document.createElement('i'); chevron.className = 'summary-icon icon-chevron-down'; summary.appendChild(chevron); details.appendChild(summary);
      const detailsContent = document.createElement('section'); detailsContent.className = 'details-content';
      const optionsTitle = document.createElement('h4'); optionsTitle.textContent = 'Options:'; detailsContent.appendChild(optionsTitle);
      const optionsList = document.createElement('ul'); optionsList.className = 'question-options-list';
      (question.options || []).forEach(opt => { 
        const li = document.createElement('li'); li.className = 'question-option';
        li.innerHTML = `<section class="option-content">${this.escapeHTML(opt.option_text)}</section><section class="option-points">${opt.points} points</section>
                        <section class="option-actions">
                          <button class="action-btn edit" aria-label="Edit option"><i class="icon-edit"></i></button>
                          <button class="action-btn delete" aria-label="Delete option"><i class="icon-delete"></i></button>
                        </section>`;
        li.querySelector('.action-btn.edit')?.addEventListener('click', () => this.handleOpenEditOptionModal(opt, question.question_id));
        li.querySelector('.action-btn.delete')?.addEventListener('click', () => this.confirmAndDeleteOption(opt, question.question_id));
        optionsList.appendChild(li);
      });
      detailsContent.appendChild(optionsList);
      const addOptionBtn = document.createElement('button'); addOptionBtn.className = 'add-option-btn'; addOptionBtn.innerHTML = '<i class="icon-plus"></i> Add Option';
      addOptionBtn.addEventListener('click', () => this.handleOpenAddOptionModal(question.question_id)); detailsContent.appendChild(addOptionBtn);
      details.appendChild(detailsContent); questionCell.appendChild(details);
      row.insertCell().textContent = this.scenarioMap.get(question.scenario_id) || 'Unknown';
      const difficultyCell = row.insertCell(); const difficultyName = this.difficultyMap.get(question.question_difficulty_id) || 'Unknown';
      const difficultyBadge = document.createElement('span'); difficultyBadge.className = 'badge'; difficultyBadge.textContent = difficultyName;
      let badgeColorVar = '--medium-badge'; if (difficultyName.toLowerCase() === 'easy') badgeColorVar = '--easy-badge'; else if (difficultyName.toLowerCase() === 'hard') badgeColorVar = '--hard-badge';
      difficultyBadge.style.backgroundColor = `var(${badgeColorVar})`; difficultyBadge.style.color = 'var(--dark-bg)'; difficultyBadge.style.padding = 'var(--spacing-xs) var(--spacing-sm)'; difficultyBadge.style.borderRadius = 'var(--border-radius-sm)';
      difficultyCell.appendChild(difficultyBadge);
      row.insertCell().textContent = (question.options || []).length.toString(); 
      const actionCell = row.insertCell(); actionCell.className = 'table-actions';
      const editBtn = document.createElement('button'); editBtn.className = 'action-btn edit'; editBtn.innerHTML = '<i class="icon-edit"></i>';
      editBtn.setAttribute('aria-label', `Edit question ${question.question_text}`);
      editBtn.addEventListener('click', () => this.handleOpenEditQuestionModal(question)); actionCell.appendChild(editBtn);
      const deleteBtn = document.createElement('button'); deleteBtn.className = 'action-btn delete'; deleteBtn.innerHTML = '<i class="icon-delete"></i>';
      deleteBtn.setAttribute('aria-label', `Delete question ${question.question_text}`);
      deleteBtn.addEventListener('click', () => this.confirmAndDeleteQuestion(question)); 
      actionCell.appendChild(deleteBtn);
    });
  }

  // SCENARIOS
  private handleOpenAddScenarioModal() { 
    const formHTML = `
      <form id="add-scenario-form" novalidate>
        <div class="form-group">
          <label for="scenario-name-input" class="form-label">Scenario Name:</label>
          <input type="text" id="scenario-name-input" name="scenario_name" class="form-input" required>
        </div>
      </form>
    `;
    this.openModal('Add New Scenario', formHTML, async (formData) => {
      if (formData && formData.scenario_name) { 
        await this.addScenario({ scenario_name: formData.scenario_name.trim() });
        this.closeModal(); 
      } 
    });
  }
  private handleOpenEditScenarioModal(scenario: Scenario) { 
    const formHTML = `
      <form id="edit-scenario-form" novalidate>
        <div class="form-group">
          <label for="scenario-name-input" class="form-label">Scenario Name:</label>
          <input type="text" id="scenario-name-input" name="scenario_name" class="form-input" value="${this.escapeHTML(scenario.scenario_name)}" required>
        </div>
      </form>
    `;
    this.openModal(`Edit Scenario: ${this.escapeHTML(scenario.scenario_name)}`, formHTML, async (formData) => {
      if (formData && formData.scenario_name) {
        await this.updateScenario(scenario.scenario_id, { scenario_name: formData.scenario_name.trim() });
        this.closeModal(); 
      }
    });
  }
  private confirmAndDeleteScenario(scenario: Scenario) {
    const messageHTML = `<p>Are you sure you want to delete the scenario: <strong>"${this.escapeHTML(scenario.scenario_name)}"</strong>? This action cannot be undone and may affect associated questions.</p>`;
    this.openModal('Confirm Deletion', messageHTML, async () => { 
            await this.deleteScenario(scenario.scenario_id); 
        }, "Delete", true);
  }
  public async addScenario(scenarioData: Pick<Scenario, 'scenario_name'>) { 
    try {
      const newScenario = await apiService.post<Scenario>('/scenarios', scenarioData);
      this.scenarios.push(newScenario); // Add to local cache
      this.scenarioMap.set(newScenario.scenario_id, newScenario.scenario_name);
      this.renderScenariosTable(); this.updateStatCards();
      this.showMessage('✅ Scenario added successfully!', 'success');
    } catch (error) { this.showMessage('❌ Failed to add scenario.', 'error'); console.error("Add Scenario Error:", error); }
  }
  public async updateScenario(id: number, scenarioData: Partial<Scenario>) { 
    try {
      const updatedScenario = await apiService.put<Scenario>(`/scenarios/${id}`, scenarioData); 
      const index = this.scenarios.findIndex(s => s.scenario_id === id);
      if (index !== -1) {
        this.scenarios[index] = { ...this.scenarios[index], ...updatedScenario }; 
        this.scenarioMap.set(id, this.scenarios[index].scenario_name);
      } else { // If not found, it might have been added by another client, reload
          await this.loadData();
      }
      this.renderScenariosTable();
      this.showMessage('✅ Scenario updated successfully!', 'success');
    } catch (error) { this.showMessage('❌ Failed to update scenario.', 'error'); console.error("Update Scenario Error:", error); }
  }
  public async deleteScenario(id: number) { 
    try {
      await apiService.delete(`/scenarios/${id}`);
      this.scenarios = this.scenarios.filter(s => s.scenario_id !== id);
      this.scenarioMap.delete(id);
      this.questions = this.questions.filter(q => q.scenario_id !== id);
      this.renderScenariosTable(); this.renderQuestionsTable(); this.updateStatCards();
      this.showMessage('✅ Scenario deleted successfully.', 'success');
    } catch (error) { this.showMessage('❌ Failed to delete scenario. It might be in use.', 'error'); console.error("Delete Scenario Error:", error); }
  }

  // QUESTIONS
  private handleOpenAddQuestionModal() { 
    const scenarioOptions = this.scenarios.map(s => `<option value="${s.scenario_id}">${this.escapeHTML(s.scenario_name)}</option>`).join('');
    const difficultyOptions = this.difficulties.map(d => `<option value="${d.question_difficulty_id}">${this.escapeHTML(d.question_difficulty_name)}</option>`).join('');
    const formHTML = `
      <form id="add-question-form" novalidate>
        <div class="form-group">
          <label for="question-text-input" class="form-label">Question Text:</label>
          <textarea id="question-text-input" name="question_text" class="form-textarea" rows="3" required></textarea>
        </div>
        <div class="form-group">
          <label for="question-scenario-select" class="form-label">Scenario:</label>
          <select id="question-scenario-select" name="scenario_id" class="form-select" required>
            <option value="">-- Select Scenario --</option>
            ${scenarioOptions}
          </select>
        </div>
        <div class="form-group">
          <label for="question-difficulty-select" class="form-label">Difficulty:</label>
          <select id="question-difficulty-select" name="question_difficulty_id" class="form-select" required>
            <option value="">-- Select Difficulty --</option>
            ${difficultyOptions}
          </select>
        </div>
        </form>
    `;
    this.openModal('Add New Question', formHTML, async (formData) => {
      if (formData && formData.question_text && formData.scenario_id && formData.question_difficulty_id) {
        const questionPayload: QuestionInput_BE = { 
          question_text: formData.question_text.trim(), 
          scenario_id: parseInt(formData.scenario_id, 10), 
          question_difficulty_id: parseInt(formData.question_difficulty_id, 10),
          options: [] 
        };
        await this.addQuestion(questionPayload);
        this.closeModal();
      }
    });
  }

  private handleOpenEditQuestionModal(question: Question) {
    const scenarioOptions = this.scenarios.map(s => `<option value="${s.scenario_id}" ${s.scenario_id === question.scenario_id ? 'selected' : ''}>${this.escapeHTML(s.scenario_name)}</option>`).join('');
    const difficultyOptions = this.difficulties.map(d => `<option value="${d.question_difficulty_id}" ${d.question_difficulty_id === question.question_difficulty_id ? 'selected' : ''}>${this.escapeHTML(d.question_difficulty_name)}</option>`).join('');
    
    let optionsHTML = '<p>Options are managed via "Add Option" or by editing them in the table details below the question.</p>';
    if (question.options && question.options.length > 0) {
        optionsHTML = '<h4>Current Options (manage below question in table):</h4><ul>';
        question.options.forEach(opt => {
            optionsHTML += `<li>${this.escapeHTML(opt.option_text)} (${opt.points} pts)</li>`;
        });
        optionsHTML += '</ul>';
    }

    const formHTML = `
      <form id="edit-question-form" novalidate>
        <div class="form-group">
          <label for="question-text-input" class="form-label">Question Text:</label>
          <textarea id="question-text-input" name="question_text" class="form-textarea" rows="3" required>${this.escapeHTML(question.question_text)}</textarea>
        </div>
        <div class="form-group">
          <label for="question-scenario-select" class="form-label">Scenario:</label>
          <select id="question-scenario-select" name="scenario_id" class="form-select" required>${scenarioOptions}</select>
        </div>
        <div class="form-group">
          <label for="question-difficulty-select" class="form-label">Difficulty:</label>
          <select id="question-difficulty-select" name="question_difficulty_id" class="form-select" required>${difficultyOptions}</select>
        </div>
        <div class="form-group">
            ${optionsHTML}
        </div>
      </form>
    `;
    this.openModal(`Edit Question`, formHTML, async (formData) => { 
        if (formData && formData.question_text && formData.scenario_id && formData.question_difficulty_id) {
            const optionsToUpdate: OptionInput[] = (question.options || []).map(opt => ({
                option_text: opt.option_text,
                points: opt.points
            }));

            const updatedQuestionPayload: QuestionInput_BE = {
                question_text: formData.question_text.trim(),
                scenario_id: parseInt(formData.scenario_id, 10),
                question_difficulty_id: parseInt(formData.question_difficulty_id, 10),
                options: optionsToUpdate 
            };
            await this.updateQuestion(question.question_id, updatedQuestionPayload);
            this.closeModal();
        }
    });
  }
   private confirmAndDeleteQuestion(question: Question) { 
    const messageHTML = `<p>Are you sure you want to delete the question: <strong>"${this.escapeHTML(question.question_text)}"</strong>?</p>`;
    this.openModal('Confirm Deletion', messageHTML, async () => { await this.deleteQuestion(question.question_id); }, "Delete", true );
  }

  public async addQuestion(questionData: QuestionInput_BE) { 
    try {
      // Backend addQuestion returns only the ID. We need to re-fetch to get the full object.
      const newQuestionId = await apiService.post<number>(`/questions`, questionData);
      // To get the full question object including difficulty_name and any server-side processing:
      await this.loadData(); // Simplest way to ensure UI consistency
      this.showMessage('✅ Question added successfully!', 'success');
    } catch (error) { this.showMessage('❌ Failed to add question.', 'error'); console.error("Add Question Error:", error); }
  }

  public async updateQuestion(id: number, questionData: QuestionInput_BE) { 
    try {
      await apiService.put<void>(`/questions/${id}`, questionData); 
      await this.loadData(); 
      this.showMessage('✅ Question updated successfully!', 'success');
    } catch (error) { this.showMessage('❌ Failed to update question.', 'error'); console.error("Update Question Error:", error); }
  }
  public async deleteQuestion(id: number) { 
    try {
      await apiService.delete(`/questions/${id}`);
      this.questions = this.questions.filter(q => q.question_id !== id); 
      this.renderQuestionsTable(); this.updateStatCards();
      this.showMessage('✅ Question deleted successfully.', 'success');
    } catch (error) { this.showMessage('❌ Failed to delete question. It might be in use.', 'error'); console.error("Delete Question Error:", error); }
  }

  // OPTIONS - Refactored to update the parent question
  private async handleOpenAddOptionModal(questionId: number) {
    const question = this.questions.find(q => q.question_id === questionId);
    if (!question) {
        this.showMessage("Error: Question not found to add option.", "error"); return;
    }
    const formHTML = `
      <form id="add-option-form" novalidate>
        <div class="form-group">
          <label for="option-text-input" class="form-label">Option Text:</label>
          <input type="text" id="option-text-input" name="option_text" class="form-input" required>
        </div>
        <div class="form-group">
          <label for="option-points-input" class="form-label">Points:</label>
          <input type="number" id="option-points-input" name="points" class="form-input" required value="0">
        </div>
      </form>
    `;
    this.openModal('Add New Option', formHTML, async (formData) => {
      if (formData && formData.option_text && formData.points !== undefined) {
        const newOptionInput: OptionInput = {
            option_text: formData.option_text.trim(),
            points: parseInt(formData.points, 10)
        };
        const currentOptionsInput = (question.options || []).map(opt => ({
            option_text: opt.option_text, points: opt.points
        }));
        const updatedOptions = [...currentOptionsInput, newOptionInput];
        const questionUpdatePayload: QuestionInput_BE = {
            question_text: question.question_text, scenario_id: question.scenario_id,
            question_difficulty_id: question.question_difficulty_id, options: updatedOptions
        };
        await this.updateQuestion(questionId, questionUpdatePayload);
        this.closeModal();
      }
    });
  }

  private async handleOpenEditOptionModal(optionToEdit: Option, questionId: number) {
    const question = this.questions.find(q => q.question_id === questionId);
    if (!question) {
        this.showMessage("Error: Question not found to edit option.", "error"); return;
    }
    const formHTML = `
      <form id="edit-option-form" novalidate>
        <div class="form-group">
          <label for="option-text-input" class="form-label">Option Text:</label>
          <input type="text" id="option-text-input" name="option_text" class="form-input" value="${this.escapeHTML(optionToEdit.option_text)}" required>
        </div>
        <div class="form-group">
          <label for="option-points-input" class="form-label">Points:</label>
          <input type="number" id="option-points-input" name="points" class="form-input" value="${optionToEdit.points}" required>
        </div>
      </form>
    `;
    this.openModal(`Edit Option`, formHTML, async (formData) => { 
        if (formData && formData.option_text && formData.points !== undefined) {
            const updatedOptionsInput = (question.options || []).map(opt => {
                if (opt.option_id === optionToEdit.option_id) { // Compare with original option_id
                    return { option_text: formData.option_text.trim(), points: parseInt(formData.points, 10) };
                }
                return { option_text: opt.option_text, points: opt.points }; 
            });
            const questionUpdatePayload: QuestionInput_BE = {
                question_text: question.question_text, scenario_id: question.scenario_id,
                question_difficulty_id: question.question_difficulty_id, options: updatedOptionsInput
            };
            await this.updateQuestion(questionId, questionUpdatePayload);
            this.closeModal();
        }
    });
  }

  private confirmAndDeleteOption(optionToDelete: Option, questionId: number) {
    const question = this.questions.find(q => q.question_id === questionId);
    if (!question) {
        this.showMessage("Error: Question not found to delete option.", "error"); return;
    }
    const messageHTML = `<p>Are you sure you want to delete the option: <strong>"${this.escapeHTML(optionToDelete.option_text)}"</strong>?</p>`;
    this.openModal('Confirm Deletion', messageHTML, async () => {
        const updatedOptionsInput = (question.options || [])
            .filter(opt => opt.option_id !== optionToDelete.option_id) 
            .map(opt => ({ option_text: opt.option_text, points: opt.points })); 
        const questionUpdatePayload: QuestionInput_BE = {
            question_text: question.question_text, scenario_id: question.scenario_id,
            question_difficulty_id: question.question_difficulty_id, options: updatedOptionsInput
        };
        await this.updateQuestion(questionId, questionUpdatePayload);
    }, "Delete", true);
  }

  private escapeHTML(str: string): string {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
}
customElements.define('questions-and-options', QuestionsAndOptions);
