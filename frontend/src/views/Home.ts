import { apiService, App } from "../main.js";
import { loadTemplate } from "../utils/load-template.js";

export interface Question {
    question_id: number;
    question_text: string;
    question_difficulty_id: number;
    question_difficulty_name?: string;
    difficulty_time?: number;
    scenario_id: number;

}
export interface Scenario {
    scenario_id: number;
    scenario_name: string;
    description?: string;
}

export interface Difficulty {
    question_difficulty_id: number;
    question_difficulty_name?: string;
    time: number
}

export class HomeView extends HTMLElement {
    private shadowRootInstance: ShadowRoot;

    private form: HTMLFormElement | null = null;
    private scenarioSelect: HTMLSelectElement | null = null;
    private difficultyFieldset: HTMLFieldSetElement | null = null;
    private scenarioError: HTMLElement | null = null;
    private difficultyError: HTMLElement | null = null;
    private difficultyOptionsList: HTMLUListElement | null = null;
    private scenarios: Scenario[] = [];

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

            this.populateScenarios();
            this.populateDifficulties();
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
        this.difficultyOptionsList = this.shadowRootInstance.querySelector('.difficulty-options');
    }

    private async populateScenarios() {
        if (!this.scenarioSelect) {
            console.error("HomeView: Scenario select element not found.");
            return;
        }

        try {
            const scenarios: Scenario[] = await apiService.get<Scenario[]>('/scenarios');


            while (this.scenarioSelect.options.length > 1) {
                this.scenarioSelect.remove(1);
            }
        
            scenarios.map((scenario, index: number) => {
                const optionElement = document.createElement('option');
                optionElement.value = String(scenario.scenario_id); // Use scenario_id as the value
                optionElement.textContent = scenario.scenario_name;
                // You could add the description as a title attribute for tooltips
                if (scenario.description) {
                    optionElement.title = scenario.description;
                }
                this.scenarioSelect?.appendChild(optionElement);
            });


        } catch (error) {
            if (this.scenarioError) {
                this.scenarioError.textContent = "Could not load scenarios. Please try again later.";
            }
            // Optionally disable the select or show a more prominent error
        }
    }

    private async populateDifficulties() {
        if (!this.difficultyOptionsList) {
            return;
        }

        try {
            const difficulties: Difficulty[] = await apiService.get<Difficulty[]>('/difficulties');
            this.difficultyOptionsList.innerHTML = ''; // Clear any static <li> elements

            console.log(difficulties);

            difficulties.forEach((difficulty, index) => {
                const li = document.createElement('li');
                const label = document.createElement('label');
                label.classList.add('difficulty-option');

                const input = document.createElement('input');
                input.type = 'radio';
                input.name = 'difficulty'; // All radio buttons share the same name
                input.value = String(difficulty.question_difficulty_id); // Use ID as value
                // Optionally set the first one as 'required' or handle it in validation
                if (index === 0) { // For example, make first one required if needed by validation logic
                    // input.required = true; // HTML5 validation, but we do custom
                }

                const em = document.createElement('em');
                em.classList.add('difficulty-label');
                // Add class based on difficulty name for styling (e.g., 'easy', 'medium', 'hard')
                // Ensure question_difficulty_name is not undefined or null
                const difficultyNameClass = difficulty.question_difficulty_name?.toLowerCase() || `difficulty-${difficulty.question_difficulty_id}`;
                em.classList.add(difficultyNameClass);
                em.textContent = difficulty.question_difficulty_name || `Level ${difficulty.question_difficulty_id}`;

                label.appendChild(input);
                label.appendChild(em);
                li.appendChild(label);
                this.difficultyOptionsList?.appendChild(li);
            });
            console.log("HomeView: Difficulties populated.");
        } catch (error) {
            console.error("HomeView: Failed to fetch or populate difficulties:", error);
            if (this.difficultyError) {
                this.difficultyError.textContent = "Could not load difficulty levels.";
            }
        }
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
