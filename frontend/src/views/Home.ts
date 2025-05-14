import { App } from "../main.js";
import { loadTemplate } from "../utils/load-template.js";

export class HomeView extends HTMLElement {
    private shadowRootInstance: ShadowRoot;

    private form: HTMLFormElement | null = null;
    private scenarioSelect: HTMLSelectElement | null = null;
    private difficultyFieldset: HTMLFieldSetElement | null = null;
    private scenarioError: HTMLElement | null = null;
    private difficultyError: HTMLElement | null = null;

    constructor() {
        super();
        this.shadowRootInstance = this.attachShadow({ mode: 'open' });
        this.loadAndInit();
    }
    private nextButton: HTMLButtonElement | null = null;

    private async loadAndInit() {
        const content = await loadTemplate('./templates/home.view.html');
        if (content) {
            this.shadowRootInstance.appendChild(content);
            this.bindElements();
            this.addEventListeners();
        } else {
            this.shadowRootInstance.innerHTML = '<p>Error loading home view template.</p>';
        }
    }

    private bindElements() {
        this.form = this.shadowRootInstance.querySelector('form.test-selection');
        this.scenarioSelect = this.shadowRootInstance.querySelector('#scenario');
        this.difficultyFieldset = this.shadowRootInstance.querySelector('#difficulty-fieldset');
        this.scenarioError = this.shadowRootInstance.querySelector('#scenario-error');
        this.difficultyError = this.shadowRootInstance.querySelector('#difficulty-error');
    }

    private addEventListeners() {
        if (!this.form) {
            return;
        }
        
        this.form.addEventListener('submit', (event) => this.handleSubmit(event));

        this.scenarioSelect?.addEventListener('change', () => this.clearError(this.scenarioSelect, this.scenarioError));
        this.difficultyFieldset?.addEventListener('change', () => this.clearError(this.difficultyFieldset, this.difficultyError));

    }

    private handleSubmit(event: SubmitEvent) {
        event.preventDefault();

        if (this.validateForm()) {
            console.log("Form validation successful.");
            const scenario = this.scenarioSelect?.value;
            const selectedDifficultyInput = this.difficultyFieldset?.querySelector('input[name="difficulty"]:checked') as HTMLInputElement | null;
            const difficulty = selectedDifficultyInput?.value;

            if (scenario && difficulty) {
                const navigationPath = `/quiz?scenario=${encodeURIComponent(scenario)}&difficulty=${encodeURIComponent(difficulty)}`;
                App.navigate(navigationPath);
            } else {

            }
        } else {

        }
    }

    private validateForm(): boolean {
        let isValid = true;

        if (!this.scenarioSelect || this.scenarioSelect.value === "") {
            this.showError(this.scenarioSelect, this.scenarioError, "Please select a scenario.");
            isValid = false;
        } else {
            this.clearError(this.scenarioSelect, this.scenarioError);
        }

        const selectedDifficulty = this.difficultyFieldset?.querySelector('input[name="difficulty"]:checked');
        if (!selectedDifficulty) {
            this.showError(this.difficultyFieldset, this.difficultyError, "Please select a difficulty level.");
            isValid = false;
        } else {
            this.clearError(this.difficultyFieldset, this.difficultyError);
        }

        return isValid;
    }

    private showError(inputElement: HTMLElement | null, errorElement: HTMLElement | null, message: string) {
        if (errorElement) {
            errorElement.textContent = message;
        }
        inputElement?.classList.add('invalid');
        if (inputElement?.tagName === 'FIELDSET') {
            inputElement.classList.add('invalid');
        } else if (inputElement) {
            inputElement.classList.add('invalid');
        }
    }

    private clearError(inputElement: HTMLElement | null, errorElement: HTMLElement | null) {
        if (errorElement) {
            errorElement.textContent = '';
        }
        inputElement?.classList.remove('invalid');
        if (inputElement?.tagName === 'FIELDSET') {
            inputElement.classList.remove('invalid');
        } else if (inputElement) {
            inputElement.classList.remove('invalid');
        }
    }
    private butttonEventListener() {
        // const questionHeader = clone.querySelector('header h2')
    }
}

customElements.define('home-view', HomeView);
