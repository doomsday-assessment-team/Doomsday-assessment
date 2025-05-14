import { loadTemplate } from '../utils/load-template.js';

interface Option {
    option_id: number;
    option_text: string;
    points: number;
}

interface Question {
    question_id: number;
    question_text: string;
    question_difficulty_id: number;
    question_difficulty_name?: string;
    difficulty_time?: number;
    scenario_id: number;
    options: Option[];
}

export interface Answer {
    question_id: number;
    selected_option_id: number | null;
    points_awarded: number;
    scenario_id: number;
}



// Sample Quiz Data using your model
const sampleQuestions: Question[] = [ // Use your Question interface
    {
        question_id: 101,
        question_text: "Which of these is a primary color?",
        question_difficulty_id: 1,
        question_difficulty_name: "Easy",
        difficulty_time: 30,
        scenario_id: 1,
        options: [
            { option_id: 1, option_text: "Green", points: 0 },
            { option_id: 2, option_text: "Orange", points: 0 },
            { option_id: 3, option_text: "Blue", points: 10 }, // Blue is primary
            { option_id: 4, option_text: "Purple", points: 0 }
        ]
    },
    {
        question_id: 102,
        question_text: "What is the chemical symbol for water?",
        question_difficulty_id: 2,
        question_difficulty_name: "Medium",
        scenario_id: 1,
        options: [
            { option_id: 5, option_text: "O2", points: 0 },
            { option_id: 6, option_text: "H2O", points: 10 },
            { option_id: 7, option_text: "CO2", points: 0 },
            { option_id: 8, option_text: "NaCl", points: 0 }
        ]
    }
];

export class QuizQuestion extends HTMLElement {
    private _data: Question | null = null;
    private shadowRootInstance: ShadowRoot;
    constructor() {
        super();
        this.shadowRootInstance = this.attachShadow({ mode: 'open' });
    }

    set data(questionData: Question) { // Expects your Question type
        this._data = questionData;
        this.render();
    }

    get data(): Question | null {
        return this._data;
    }

    private async render() {
        if (!this.shadowRootInstance || !this._data) return;

        const templateContent = await loadTemplate('./templates/quiz-question.component.html'); // Path relative to quiz-question.ts or utils
        if (!templateContent) {
            this.shadowRootInstance.innerHTML = "<p>Error loading question template.</p>";
            return;
        }
        const clone = templateContent.cloneNode(true) as DocumentFragment;

        const questionHeader = clone.querySelector('header h2');
        if (questionHeader) questionHeader.textContent = this._data.question_text;

        const optionsList = clone.querySelector('ul');
        if (optionsList) {
            optionsList.innerHTML = '';
            this._data.options.forEach(option => {
                const li = document.createElement('li');
                const label = document.createElement('label');
                const input = document.createElement('input');
                input.type = 'radio';
                input.name = `answer-q${this._data?.question_id}`;
                input.value = String(option.option_id);
                label.appendChild(input);
                label.appendChild(document.createTextNode(` ${option.option_text}`));
                li.appendChild(label);
                optionsList.appendChild(li);
            });
        }
        this.shadowRootInstance.innerHTML = '';
        this.shadowRootInstance.appendChild(clone);
        this.addEventListeners();
    }

    private addEventListeners() {
        this.shadowRootInstance.querySelectorAll('input[type="radio"]').forEach(radio => {
            radio.addEventListener('change', (event) => {
                const selectedInput = event.target as HTMLInputElement;
                const selectedOptionId = parseInt(selectedInput.value, 10);
                const selectedOption = this._data?.options.find(opt => opt.option_id === selectedOptionId);
                this.dispatchEvent(new CustomEvent('answerselected', {
                    bubbles: true,
                    composed: true,
                    detail: {
                        questionId: this._data?.question_id,
                        selectedOptionId: selectedOptionId,
                        selectedOptionText: selectedOption?.option_text,
                        points: selectedOption?.points || 0,
                        scenarioId: this._data?.scenario_id
                    }
                }));
            });
        });
    }
    
    public getSelectedAnswer(): { optionId: number | null, points: number } {
        const checkedRadio = this.shadowRootInstance.querySelector('input[type="radio"]:checked') as HTMLInputElement | null;
        if (checkedRadio) {
            const selectedOptionId = parseInt(checkedRadio.value, 10);
            const selectedOption = this._data?.options.find(opt => opt.option_id === selectedOptionId);
            return { optionId: selectedOptionId, points: selectedOption?.points || 0 };
        }
        return { optionId: null, points: 0 };
    }
}

customElements.define('quiz-question', QuizQuestion);