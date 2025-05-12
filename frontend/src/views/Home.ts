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
        const content = await loadTemplate('./templates/home.view.html'); // Adjust path
        if (content) {
            this.shadowRootInstance.appendChild(content);
            this.bindElements();
            this.addEventListeners();
            console.log("HomeView initialized and listeners added.");
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
            console.error("HomeView: Form element not found.");
            return;
        }
        // Use arrow function to maintain 'this' context
        this.form.addEventListener('submit', (event) => this.handleSubmit(event));

        // Optional: Clear errors on input change for better UX
        this.scenarioSelect?.addEventListener('change', () => this.clearError(this.scenarioSelect, this.scenarioError));
        this.difficultyFieldset?.addEventListener('change', () => this.clearError(this.difficultyFieldset, this.difficultyError));

    }

    private handleSubmit(event: SubmitEvent) {
        event.preventDefault(); // Prevent default page reload
        console.log("Form submission attempt.");

        if (this.validateForm()) {
            console.log("Form validation successful.");
            const scenario = this.scenarioSelect?.value;
            // Find the checked difficulty radio button
            const selectedDifficultyInput = this.difficultyFieldset?.querySelector('input[name="difficulty"]:checked') as HTMLInputElement | null;
            const difficulty = selectedDifficultyInput?.value;

            if (scenario && difficulty) {
                // Construct the path with query parameters
                const navigationPath = `/quiz?scenario=${encodeURIComponent(scenario)}&difficulty=${encodeURIComponent(difficulty)}`;
                console.log(`Navigating to: ${navigationPath}`);
                App.navigate(navigationPath); /// Use your App router's navigate method
            } else {
                 // This case should ideally not be reached if validation passes, but good for safety
                 console.error("Validation passed but couldn't retrieve valid scenario or difficulty.");
            }
        } else {
            console.log("Form validation failed.");
        }
    }

    private validateForm(): boolean {
        let isValid = true;

        // --- Validate Scenario ---
        if (!this.scenarioSelect || this.scenarioSelect.value === "") {
            this.showError(this.scenarioSelect, this.scenarioError, "Please select a scenario.");
            isValid = false;
        } else {
            this.clearError(this.scenarioSelect, this.scenarioError);
        }

        // --- Validate Difficulty ---
        // Find the checked radio button within the fieldset
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
        // Add error class for styling (e.g., red border)
        inputElement?.classList.add('invalid');
        // If it's the fieldset, add class there
         if (inputElement?.tagName === 'FIELDSET') {
            inputElement.classList.add('invalid');
         } else if (inputElement) {
             inputElement.classList.add('invalid');
         }
    }

    private clearError(inputElement: HTMLElement | null, errorElement: HTMLElement | null) {
        if (errorElement) {
            errorElement.textContent = ''; // Clear the message
        }
        // Remove error class
        inputElement?.classList.remove('invalid');
         if (inputElement?.tagName === 'FIELDSET') {
            inputElement.classList.remove('invalid');
         } else if (inputElement) {
             inputElement.classList.remove('invalid');
         }
    }

    // async loadTemplate() {
    //     const content = await loadTemplate('./templates/home.view.html');
    //     if (content){
    //         this.shadowRoot?.appendChild(content);

    //         this.nextButton = this.shadowRootInstance.querySelector('.start-button');
    //     } else {
    //         // content is null
    //     }
        
    // }

    private butttonEventListener() {
        // const questionHeader = clone.querySelector('header h2')
    }
}

customElements.define('home-view', HomeView);
