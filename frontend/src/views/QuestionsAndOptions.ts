import { loadTemplate } from '../utils/load-template.js'; // Assuming this path is correct
import { apiService } from '../main.js'; // Assuming this path is correct

// Interfaces
interface OptionInput { 
  option_text: string;
  points: number;
  question_id?: number; 
}

interface Option extends OptionInput { 
  option_id: number;
  question_id: number;
}


interface QuestionShellInput_FE { 
  question_text: string;
  scenario_id: number;
  question_difficulty_id: number;
}


interface QuestionShellUpdate_FE {
  question_text?: string;
  scenario_id?: number;
  question_difficulty_id?: number;
}


interface Question { 
  question_id: number;
  question_text: string;
  scenario_id: number;
  question_difficulty_id: number;
  question_difficulty_name?: string; 
  options: Option[]; 
}

interface Scenario {
  scenario_id: number;
  scenario_name: string;
  status?: string; 
}

interface Difficulty {
  question_difficulty_id: number;
  question_difficulty_name: string;
  time?: number; 
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
    if (!container && this.shadowRoot) {
        const messageDiv = document.createElement('div');
        messageDiv.id = 'message-container';
        this.shadowRoot.appendChild(messageDiv);
        container = messageDiv; 
    }
    
    if (!container) {
        console.warn('[FE] Message container not found. Message:', message);
        alert(message); 
        return;
    }
    
    container.textContent = message;
    if (!container.classList.contains('message-toast')) {
        container.classList.add('message-toast');
    }
    
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
      console.log('[FE] loadInitialTemplate: Attempting to load template...');
      const content = await loadTemplate('./templates/questions-and-options.view.html');
      if (content && this.shadowRoot) {
        this.shadowRoot.appendChild(content.cloneNode(true));
        console.log('[FE] loadInitialTemplate: Template loaded.');
        this.initializeModalElements(); 
        await this.loadData(); // Calls render methods, updateStatCards, and setupEventListeners
      } else { console.error("[FE] Template or Shadow DOM issue during loadInitialTemplate."); }
    } catch (error) {
      this.showMessage('❌ Failed to load page template.', 'error');
      console.error('[FE] Template load error:', error);
    }
  }

  private initializeModalElements() {
    if (!this.shadowRoot) { console.error("[FE] initializeModalElements: Shadow DOM not available."); return; }
    console.log("[FE] initializeModalElements: Initializing...");
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
    } else { console.warn("[FE] initializeModalElements: Main modal element #universal-modal not found."); }
    console.log("[FE] initializeModalElements: Done.");
  }

  private openModal( /* ... (no changes needed here, keep as is) ... */ 
    title: string, 
    contentHTML: string, 
    confirmCallback: ModalConfirmCallback,
    confirmButtonText: string = "Confirm",
    isDeleteOperation: boolean = false 
  ) {
    if (!this.modalElement || !this.modalTitleElement || !this.modalBodyElement || !this.modalConfirmButton) {
        this.showMessage("Error: Modal UI components are missing.", "error"); 
        console.error("[FE] openModal: Modal elements not fully initialized.");
        return;
    }
    this.modalTitleElement.textContent = title;
    this.modalBodyElement.innerHTML = contentHTML; 
    this.currentModalConfirmCallback = confirmCallback;
    
    this.modalConfirmButton.textContent = confirmButtonText;
    this.modalConfirmButton.classList.remove('btn-primary', 'btn-danger');
    if (isDeleteOperation) {
        this.modalConfirmButton.classList.add('btn-danger'); 
    } else {
        this.modalConfirmButton.classList.add('btn-primary');
    }
    this.modalElement.classList.add('active');
  }

  private closeModal() { /* ... (no changes needed here, keep as is) ... */ 
    this.modalElement?.classList.remove('active');
    if(this.modalBodyElement) this.modalBodyElement.innerHTML = ''; 
    this.currentModalConfirmCallback = null;
    if (this.modalConfirmButton) {
        this.modalConfirmButton.classList.remove('btn-danger');
        this.modalConfirmButton.classList.add('btn-primary');
        this.modalConfirmButton.textContent = 'Confirm';
    }
  }

  private async handleModalConfirm() { /* ... (no changes needed here, keep as is) ... */ 
    if (this.currentModalConfirmCallback && this.modalBodyElement) {
        const form = this.modalBodyElement.querySelector('form');
        if (form) { 
            const formData = new FormData(form);
            const data: Record<string, any> = {};
            formData.forEach((value, key) => { data[key] = value; });
            if (this.validateModalForm(form)) {
                await this.currentModalConfirmCallback(data);
            }
        } else { 
             await this.currentModalConfirmCallback();
             this.closeModal(); 
        }
    }
  }
  
  private validateModalForm(form: HTMLFormElement): boolean { /* ... (no changes needed here, keep as is) ... */ 
    let isValid = true;
    form.querySelectorAll<HTMLInputElement|HTMLSelectElement|HTMLTextAreaElement>('[required]').forEach(input => {
        const parent = input.parentElement;
        parent?.querySelector('.error-message')?.remove(); 
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
            errorSpan.className = 'error-message'; 
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
      console.log('[FE] loadData: Fetching data using /admin prefixed routes...');
      // **** API PATHS UPDATED TO /admin ****
      const scenariosPromise = apiService.get<Scenario[]>('/admin/scenarios');
      const questionsPromise = apiService.get<Question[]>('/admin/questions'); // Assumes this returns questions with options
      const difficultiesPromise = apiService.get<Difficulty[]>('/admin/difficulties'); // Or /admin/difficulty-levels

      const [scenariosData, questionsData, difficultiesData] = await Promise.all([
        scenariosPromise, questionsPromise, difficultiesPromise
      ]);

      console.log('[FE] loadData: Scenarios raw data:', JSON.stringify(scenariosData, null, 2));
      console.log('[FE] loadData: Questions raw data:', JSON.stringify(questionsData, null, 2));
      console.log('[FE] loadData: Difficulties raw data:', JSON.stringify(difficultiesData, null, 2));

      this.scenarios = Array.isArray(scenariosData) ? scenariosData : [];
      this.questions = (Array.isArray(questionsData) ? questionsData : []).map(q => ({
          ...q,
          // Ensure options array exists and each option has its question_id (if not already provided by backend)
          options: Array.isArray(q.options) ? q.options.map(opt => ({...opt, question_id: q.question_id })) : [] 
      }));
      this.difficulties = Array.isArray(difficultiesData) ? difficultiesData : [];

      this.scenarioMap = new Map(this.scenarios.map(s => [s.scenario_id, s.scenario_name]));
      this.difficultyMap = new Map(this.difficulties.map(d => [d.question_difficulty_id, d.question_difficulty_name]));
      
      console.log('[FE] loadData: Data processed. Calling render and UI update methods.');
      this.renderScenariosTable();
      this.renderQuestionsTable();
      this.updateStatCards(); 
      this.setupEventListeners();

    } catch (error) {
      this.showMessage('⚠️ Failed to load initial data. Check console.', 'warning');
      console.error('[FE] Data load error:', error); 
      if (error && typeof error === 'object' && 'response' in error) {
        console.error('[FE] API Error Response:', (error as any).response);
      }
    }
  }

  private updateStatCards() { /* ... (no changes needed here, keep as is) ... */ 
    if (!this.shadowRoot) return;
    console.log('[FE] updateStatCards: Called.');
    const scenariosCountEl = this.shadowRoot.getElementById('scenarios-count');
    if (scenariosCountEl) scenariosCountEl.textContent = this.scenarios.length.toString();
    const questionsCountEl = this.shadowRoot.getElementById('questions-count');
    if (questionsCountEl) questionsCountEl.textContent = this.questions.length.toString();
  }
  private setupEventListeners() { /* ... (no changes needed here, keep as is) ... */ 
    if (!this.shadowRoot) { console.error("[FE] setupEventListeners: Shadow DOM not available."); return; }
    console.log("[FE] setupEventListeners: Setting up general event listeners...");
    this.setupTabs();
    this.setupSearchFilters();
    this.shadowRoot.getElementById('create-scenario-btn')?.addEventListener('click', () => this.handleOpenAddScenarioModal());
    this.shadowRoot.getElementById('create-question-btn')?.addEventListener('click', () => this.handleOpenAddQuestionModal());
    console.log("[FE] setupEventListeners: General event listeners set up.");
  }
  private setupTabs() { /* ... (no changes needed here, keep as is) ... */ 
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
  private setupSearchFilters() { /* ... (no changes needed here, keep as is) ... */ 
    if (!this.shadowRoot) return;
    const scenarioSearchInput = this.shadowRoot.getElementById('scenario-search-input') as HTMLInputElement;
    const questionSearchInput = this.shadowRoot.getElementById('question-search-input') as HTMLInputElement;
    
    scenarioSearchInput?.addEventListener('input', () => this.renderScenariosTable(scenarioSearchInput.value));
    questionSearchInput?.addEventListener('input', () => this.renderQuestionsTable(questionSearchInput.value));
  }
  private getQuestionCountForScenario(scenarioId: number): number { /* ... (no changes needed here, keep as is) ... */ 
    return this.questions.filter(q => q.scenario_id === scenarioId).length;
  }
  private renderScenariosTable(filter: string = '') { /* ... (no changes needed here, keep as is) ... */ 
    if (!this.shadowRoot) { console.error("[FE] renderScenariosTable: Shadow DOM not available."); return; }
    console.log('[FE] renderScenariosTable: Called. Filter:', filter);
    const table = this.shadowRoot.querySelector('#scenarios-tab .table');
    if (!table) { console.error('[FE] Scenarios table not found in #scenarios-tab'); return; }
    let tbody = table.querySelector('tbody');
    if (!tbody) { tbody = document.createElement('tbody'); table.appendChild(tbody); }
    tbody.innerHTML = '';
    const filteredScenarios = this.scenarios.filter(s => s.scenario_name && s.scenario_name.toLowerCase().includes(filter.toLowerCase()));
    
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
  private renderQuestionsTable(filter: string = '') { /* ... (no changes needed here, keep as is) ... */ 
    if (!this.shadowRoot) { console.error("[FE] renderQuestionsTable: Shadow DOM not available."); return; }
    console.log('[FE] renderQuestionsTable: Called. Filter:', filter);
    const table = this.shadowRoot.querySelector('#questions-tab .table');
    if (!table) { console.error('[FE] Questions table not found in #questions-tab'); return; }
    let tbody = table.querySelector('tbody');
    if (!tbody) { tbody = document.createElement('tbody'); table.appendChild(tbody); }
    tbody.innerHTML = '';
    const filteredQuestions = this.questions.filter(q =>
      (q.question_text && q.question_text.toLowerCase().includes(filter.toLowerCase())) ||
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
  private handleOpenAddScenarioModal() { /* ... (no changes needed here, keep as is) ... */ 
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
  private handleOpenEditScenarioModal(scenario: Scenario) { /* ... (no changes needed here, keep as is) ... */ 
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
  private confirmAndDeleteScenario(scenario: Scenario) { /* ... (no changes needed here, keep as is) ... */ 
    const messageHTML = `<p>Are you sure you want to delete the scenario: <strong>"${this.escapeHTML(scenario.scenario_name)}"</strong>? This action cannot be undone and may affect associated questions.</p>`;
    this.openModal('Confirm Deletion', messageHTML, async () => { 
            await this.deleteScenario(scenario.scenario_id); 
        }, "Delete", true);
  }
  public async addScenario(scenarioData: Pick<Scenario, 'scenario_name'>) { 
    try {
      console.log("[FE] addScenario: Sending data:", scenarioData);
      // **** UPDATED API PATH ****
      const newScenario = await apiService.post<Scenario>('/admin/scenarios', scenarioData); 
      console.log("[FE] addScenario: Received response:", newScenario);
      if (newScenario && newScenario.scenario_id) {
        this.scenarios.push(newScenario); 
        this.scenarioMap.set(newScenario.scenario_id, newScenario.scenario_name);
        this.renderScenariosTable(); this.updateStatCards();
        this.showMessage('✅ Scenario added successfully!', 'success');
      } else { throw new Error("Invalid response from server after adding scenario."); }
    } catch (error) { this.showMessage('❌ Failed to add scenario.', 'error'); console.error("[FE] Add Scenario Error:", error); }
  }
  public async updateScenario(id: number, scenarioData: Partial<Scenario>) { 
    try {
      console.log(`[FE] updateScenario (ID: ${id}): Sending data:`, scenarioData);
      // **** UPDATED API PATH ****
      const updatedScenario = await apiService.put<Scenario>(`/admin/scenarios/${id}`, scenarioData);  
      console.log(`[FE] updateScenario (ID: ${id}): Received response:`, updatedScenario);
      if (updatedScenario && updatedScenario.scenario_id) {
        const index = this.scenarios.findIndex(s => s.scenario_id === id);
        if (index !== -1) {
          this.scenarios[index] = { ...this.scenarios[index], ...updatedScenario }; 
          this.scenarioMap.set(id, this.scenarios[index].scenario_name);
        } else { 
            console.warn(`[FE] updateScenario: Scenario with ID ${id} not found in local cache. Reloading data.`);
            await this.loadData(); 
        }
        this.renderScenariosTable();
        this.showMessage('✅ Scenario updated successfully!', 'success');
      } else { throw new Error("Invalid response from server after updating scenario."); }
    } catch (error) { this.showMessage('❌ Failed to update scenario.', 'error'); console.error(`[FE] Update Scenario Error (ID: ${id}):`, error); }
  }
  public async deleteScenario(id: number) { 
    try {
      console.log(`[FE] deleteScenario: Attempting to delete scenario ID: ${id}`);
      // **** UPDATED API PATH ****
      await apiService.delete(`/admin/scenarios/${id}`); 
      console.log(`[FE] deleteScenario: API call successful for ID: ${id}`);
      this.scenarios = this.scenarios.filter(s => s.scenario_id !== id);
      this.scenarioMap.delete(id);
      this.questions = this.questions.filter(q => q.scenario_id !== id);
      this.renderScenariosTable(); this.renderQuestionsTable(); this.updateStatCards();
      this.showMessage('✅ Scenario deleted successfully.', 'success');
    } catch (error) { this.showMessage('❌ Failed to delete scenario. It might be in use.', 'error'); console.error(`[FE] Delete Scenario Error (ID: ${id}):`, error); }
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
            <option value="">-- Select Scenario --</option> ${scenarioOptions}
          </select>
        </div>
        <div class="form-group">
          <label for="question-difficulty-select" class="form-label">Difficulty:</label>
          <select id="question-difficulty-select" name="question_difficulty_id" class="form-select" required>
            <option value="">-- Select Difficulty --</option> ${difficultyOptions}
          </select>
        </div>
      </form> 
    `;
    this.openModal('Add New Question', formHTML, async (formData) => {
      if (formData && formData.question_text && formData.scenario_id && formData.question_difficulty_id) {
        const questionShellPayload: QuestionShellInput_FE = { // Use new interface
          question_text: formData.question_text.trim(), 
          scenario_id: parseInt(formData.scenario_id, 10), 
          question_difficulty_id: parseInt(formData.question_difficulty_id, 10),
        };
        await this.addQuestion(questionShellPayload); 
        this.closeModal();
      }
    });
  }

  private handleOpenEditQuestionModal(question: Question) {
    const scenarioOptions = this.scenarios.map(s => `<option value="${s.scenario_id}" ${s.scenario_id === question.scenario_id ? 'selected' : ''}>${this.escapeHTML(s.scenario_name)}</option>`).join('');
    const difficultyOptions = this.difficulties.map(d => `<option value="${d.question_difficulty_id}" ${d.question_difficulty_id === question.question_difficulty_id ? 'selected' : ''}>${this.escapeHTML(d.question_difficulty_name)}</option>`).join('');
    
    let optionsHTML = '<p>Options are managed via "Add Option" or by editing them in the table details below the question.</p>';
    
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
        <div class="form-group"> ${optionsHTML} </div>
      </form>
    `;
    this.openModal(`Edit Question`, formHTML, async (formData) => { 
        if (formData && formData.question_text && formData.scenario_id && formData.question_difficulty_id) {
            const updatedQuestionShell: QuestionShellUpdate_FE = { // Use new interface
                question_text: formData.question_text.trim(),
                scenario_id: parseInt(formData.scenario_id, 10),
                question_difficulty_id: parseInt(formData.question_difficulty_id, 10),
            };
            // Options are not sent to PUT /admin/questions/:id
            await this.updateQuestion(question.question_id, updatedQuestionShell);
            this.closeModal();
        }
    });
  }
   private confirmAndDeleteQuestion(question: Question) { 
    const messageHTML = `<p>Are you sure you want to delete the question: <strong>"${this.escapeHTML(question.question_text)}"</strong>?</p>`;
    this.openModal('Confirm Deletion', messageHTML, async () => { await this.deleteQuestion(question.question_id); }, "Delete", true );
  }

  public async addQuestion(questionShellData: QuestionShellInput_FE) { 
    try {
      console.log("[FE] addQuestion: Sending shell data:", questionShellData);
      // **** UPDATED API PATH ****
      // admin.repository.addQuestion returns basic Question (id, text, scenario_id, difficulty_id)
      const newQuestionBase = await apiService.post<Question>(`/admin/questions`, questionShellData); 
      console.log("[FE] addQuestion: Received base question response:", newQuestionBase);

      if (newQuestionBase && newQuestionBase.question_id) {
        // Options are added separately. Refresh data to see the new question shell.
        await this.loadData(); 
        this.showMessage('✅ Question created! Add options using the "Add Option" button.', 'success');
      } else {
        throw new Error("Invalid response from server after adding question shell.");
      }
    } catch (error) { this.showMessage('❌ Failed to add question shell.', 'error'); console.error("[FE] Add Question Shell Error:", error); }
  }

  public async updateQuestion(id: number, questionShellData: QuestionShellUpdate_FE) { 
    try {
      console.log(`[FE] updateQuestion (ID: ${id}): Sending shell data:`, questionShellData);
      // **** UPDATED API PATH ****
      // admin.repository.updateQuestion does not handle options.
      await apiService.put<void>(`/admin/questions/${id}`, questionShellData); 
      console.log(`[FE] updateQuestion (ID: ${id}): API call successful for shell.`);
      await this.loadData(); 
      this.showMessage('✅ Question details updated! Manage options separately.', 'success');
    } catch (error) { this.showMessage('❌ Failed to update question details.', 'error'); console.error(`[FE] Update Question Shell Error (ID: ${id}):`, error); }
  }
  public async deleteQuestion(id: number) { 
    try {
      console.log(`[FE] deleteQuestion: Attempting to delete question ID: ${id}`);
      // **** UPDATED API PATH ****
      // This should call adminRepository.deleteQuestionAndOptions via service in admin.routes.ts
      await apiService.delete(`/admin/questions/${id}`); 
      console.log(`[FE] deleteQuestion: API call successful for ID: ${id}`);
      this.questions = this.questions.filter(q => q.question_id !== id); 
      this.renderQuestionsTable(); this.updateStatCards();
      this.showMessage('✅ Question and its options deleted.', 'success');
    } catch (error) { this.showMessage('❌ Failed to delete question. It might be in use.', 'error'); console.error(`[FE] Delete Question Error (ID: ${id}):`, error); }
  }

  // OPTIONS - Now makes direct calls to /admin/options
  private async handleOpenAddOptionModal(questionId: number) {
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
        const newOptionPayload: OptionInput & { question_id: number } = { 
            question_id: questionId, // This is needed for POST /admin/options
            option_text: formData.option_text.trim(),
            points: parseInt(formData.points, 10)
        };
        await this.addOptionDirectly(newOptionPayload); 
        this.closeModal();
      }
    });
  }

  private async addOptionDirectly(optionData: OptionInput & { question_id: number }) {
    try {
        console.log("[FE] addOptionDirectly: Sending data:", optionData);
        // **** API PATH FOR OPTIONS ****
        const newOption = await apiService.post<Option>('/admin/options', optionData);
        console.log("[FE] addOptionDirectly: Received response:", newOption);
        if (newOption && newOption.option_id) {
            const question = this.questions.find(q => q.question_id === optionData.question_id);
            if (question) {
                // Ensure the newOption from backend has question_id or add it if Option type requires
                const optionToAdd: Option = { 
                    ...newOption, 
                    question_id: optionData.question_id 
                };
                question.options.push(optionToAdd); 
                this.renderQuestionsTable(); 
            } else { await this.loadData(); }
            this.showMessage('✅ Option added successfully!', 'success');
        } else { throw new Error("Invalid response from server after adding option."); }
    } catch (error) {
        this.showMessage('❌ Failed to add option.', 'error');
        console.error("[FE] Add Option Directly Error:", error);
    }
  }

  private async handleOpenEditOptionModal(optionToEdit: Option, questionId: number) {
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
            const updatedOptionPayload: Partial<OptionInput> = { // Use Partial for update
                option_text: formData.option_text.trim(),
                points: parseInt(formData.points, 10)
            };
            await this.updateOptionDirectly(optionToEdit.option_id, updatedOptionPayload, questionId);
            this.closeModal();
        }
    });
  }

  private async updateOptionDirectly(optionId: number, optionData: Partial<OptionInput>, questionIdToUpdateUI: number) {
    try {
        console.log(`[FE] updateOptionDirectly (ID: ${optionId}): Sending data:`, optionData);
        // **** API PATH FOR OPTIONS ****
        // admin.repository.updateOption doesn't take question_id, so it's not in payload here
        const updatedOption = await apiService.put<Option>(`/admin/options/${optionId}`, optionData);
        console.log(`[FE] updateOptionDirectly (ID: ${optionId}): Received response:`, updatedOption);

        if (updatedOption && updatedOption.option_id) {
            const question = this.questions.find(q => q.question_id === questionIdToUpdateUI);
            if (question) {
                const optIndex = question.options.findIndex(o => o.option_id === optionId);
                if (optIndex !== -1) {
                    // Ensure the updatedOption from backend has question_id or add it
                    question.options[optIndex] = { 
                        ...question.options[optIndex], // Keep existing fields like question_id
                        ...updatedOption // Overwrite with updated fields
                    };
                } else { await this.loadData(); } 
                this.renderQuestionsTable();
            } else { await this.loadData(); } 
            this.showMessage('✅ Option updated successfully!', 'success');
        } else { throw new Error("Invalid response from server after updating option."); }
    } catch (error) {
        this.showMessage('❌ Failed to update option.', 'error');
        console.error(`[FE] Update Option Directly Error (ID: ${optionId}):`, error);
    }
  }

  private confirmAndDeleteOption(optionToDelete: Option, questionId: number) {
    const messageHTML = `<p>Are you sure you want to delete the option: <strong>"${this.escapeHTML(optionToDelete.option_text)}"</strong>?</p>`;
    this.openModal('Confirm Deletion', messageHTML, async () => {
        await this.deleteOptionDirectly(optionToDelete.option_id, questionId);
    }, "Delete", true);
  }

  private async deleteOptionDirectly(optionId: number, questionIdToUpdateUI: number) {
    try {
        console.log(`[FE] deleteOptionDirectly: Attempting to delete option ID: ${optionId}`);
        // **** API PATH FOR OPTIONS ****
        await apiService.delete(`/admin/options/${optionId}`);
        console.log(`[FE] deleteOptionDirectly: API call successful for ID: ${optionId}`);

        const question = this.questions.find(q => q.question_id === questionIdToUpdateUI);
        if (question) {
            question.options = question.options.filter(opt => opt.option_id !== optionId);
            this.renderQuestionsTable();
        } else { await this.loadData(); }
        this.showMessage('✅ Option deleted successfully!', 'success');
    } catch (error) {
        this.showMessage('❌ Failed to delete option.', 'error');
        console.error(`[FE] Delete Option Directly Error (ID: ${optionId}):`, error);
    }
  }

  private escapeHTML(str: string): string {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }
}
customElements.define('questions-and-options', QuestionsAndOptions);
