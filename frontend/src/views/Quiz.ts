import '../components/QuizQuestion.js';
import { QuizQuestion } from '../components/QuizQuestion.js';
import { loadTemplate } from "../utils/load-template.js";

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


async function fetchQuizQuestions(): Promise<Question[]> {
    // Simulate API call
    return new Promise(resolve => {
        setTimeout(() => {
            resolve([
                {
                    question_id: 101,
                    question_text: "Which of these is a primary color?",
                    question_difficulty_id: 1, scenario_id: 1,
                    options: [
                        { option_id: 1, option_text: "Green", points: 0 },
                        { option_id: 2, option_text: "Orange", points: 0 },
                        { option_id: 3, option_text: "Blue", points: 10 },
                        { option_id: 4, option_text: "Purple", points: 0 }
                    ]
                },
                {
                    question_id: 102,
                    question_text: "What is the chemical symbol for water?",
                    question_difficulty_id: 2, scenario_id: 1,
                    options: [
                        { option_id: 5, option_text: "O2", points: 0 },
                        { option_id: 6, option_text: "H2O", points: 10 },
                        { option_id: 7, option_text: "CO2", points: 0 },
                        { option_id: 8, option_text: "NaCl", points: 0 }
                    ]
                },
                {
                    question_id: 103,
                    question_text: "How many continents are there?",
                    question_difficulty_id: 1, scenario_id: 2,
                    options: [
                        { option_id: 9, option_text: "Five", points: 0 },
                        { option_id: 10, option_text: "Six", points: 0 },
                        { option_id: 11, option_text: "Seven", points: 10 },
                        { option_id: 12, option_text: "Eight", points: 0 }
                    ]
                }
            ]);
        }, 500);
    });
}

export class QuizView extends HTMLElement {

    private shadowRootInstance: ShadowRoot;
    private allQuestions: Question[] = [];
    private currentQuestionIndex: number = -1;
    private currentQuestionElement: QuizQuestion | null = null;
    private collectedAnswers: Answer[] = [];

    private questionContainer: HTMLElement | null = null;
    private nextButton: HTMLButtonElement | null = null;

    constructor() {
        super();
        this.shadowRootInstance = this.attachShadow({ mode: 'open' });
        this.initializeQuiz();
    }

    private async initializeQuiz() {
        await this.loadViewTemplate();
        this.allQuestions = await fetchQuizQuestions();
        this.collectedAnswers = [];
        if (this.allQuestions.length > 0) {
            this.currentQuestionIndex = 0;
            this.displayCurrentQuestion();
        } else {
            this.showNoQuestionsMessage();
        }
    }

    private async loadViewTemplate() {

        const content = await loadTemplate('./templates/quiz.view.html');
        if (content) {
            this.shadowRootInstance.appendChild(content);

            this.questionContainer = this.shadowRootInstance.querySelector('form');
            this.nextButton = this.shadowRootInstance.querySelector('#next-question-btn');

            if (this.nextButton) {
                this.nextButton.addEventListener('click', () => this.validateAndProceed());
            } else {
                
            }
        } else {
           
        }
    }

    private displayCurrentQuestion() {
        if (!this.questionContainer) {
            
            return;
        }
        if (this.currentQuestionIndex < 0 || this.currentQuestionIndex >= this.allQuestions.length) {
            this.showQuizCompletion();
            return;
        }

        const questionData = this.allQuestions[this.currentQuestionIndex];

        if (this.currentQuestionElement) {
            this.currentQuestionElement.remove();
        }

        this.currentQuestionElement = document.createElement('quiz-question') as QuizQuestion;
        this.currentQuestionElement.data = questionData;

        this.currentQuestionElement.addEventListener('answerselected', this.handleAnswerSelectedForValidation.bind(this) as EventListener);

        const existingQQ = this.questionContainer.querySelector('quiz-question');
        if (existingQQ) {
            this.questionContainer.replaceChild(this.currentQuestionElement, existingQQ);
        } else {
            this.questionContainer.insertBefore(this.currentQuestionElement, this.questionContainer.firstChild);
        }

        this.updateNextButtonState();


        if (this.nextButton) {
            if (this.currentQuestionIndex === this.allQuestions.length - 1) {
                this.nextButton.textContent = "Submit Quiz";
            } else {
                this.nextButton.textContent = "Next Question";
            }
        }
    }

    private handleAnswerSelectedForValidation(event: CustomEvent) {
        this.handleAnswerSelected(event);

        this.updateNextButtonState();
    }

    private updateNextButtonState() {
        if (this.nextButton && this.currentQuestionElement) {
            const selection = this.currentQuestionElement.getSelectedAnswer();
            if (selection.optionId !== null) {
                this.nextButton.disabled = false;
                this.nextButton.removeAttribute('aria-disabled');
            } else {
                this.nextButton.disabled = true;
                this.nextButton.setAttribute('aria-disabled', 'true');
            }
        } else if (this.nextButton) {
            
            if (this.currentQuestionIndex >= this.allQuestions.length - 1 && this.allQuestions.length > 0) {
                const selection = this.currentQuestionElement?.getSelectedAnswer();
                this.nextButton.disabled = selection?.optionId === null;
            } else {
                this.nextButton.disabled = true;
                this.nextButton.setAttribute('aria-disabled', 'true');
            }
        }
    }

    private validateAndProceed() {
        
        if (this.currentQuestionElement) {
            const selection = this.currentQuestionElement.getSelectedAnswer();
            if (selection.optionId === null && this.currentQuestionIndex < this.allQuestions.length) {
                 
                const validationMsgEl = this.shadowRootInstance.querySelector('.validation-message') as HTMLElement | null;
                if(validationMsgEl) validationMsgEl.textContent = "Please select an answer.";
                return;
            }
        }
        this.proceedToNextOrSubmit();
    }

    private handleAnswerSelected(event: CustomEvent) {
        const detail = event.detail;
        
        const answerIndex = this.collectedAnswers.findIndex(ans => ans.question_id === detail.questionId);
        const newAnswer: Answer = {
            question_id: detail.questionId,
            selected_option_id: detail.selectedOptionId,
            points_awarded: detail.points,
            scenario_id: detail.scenarioId
        };

        if (answerIndex > -1) {
            this.collectedAnswers[answerIndex] = newAnswer;
        } else {
            this.collectedAnswers.push(newAnswer);
        }
    }

    private proceedToNextOrSubmit() {
        if (this.currentQuestionElement) {
            const currentSelection = this.currentQuestionElement.getSelectedAnswer();
            const currentQuestionData = this.currentQuestionElement.data;
            if (currentQuestionData) {
                const answerIndex = this.collectedAnswers.findIndex(ans => ans.question_id === currentQuestionData.question_id);
                const currentAnswerRecord: Answer = {
                    question_id: currentQuestionData.question_id,
                    selected_option_id: currentSelection.optionId,
                    points_awarded: currentSelection.points,
                    scenario_id: currentQuestionData.scenario_id
                };
                if (answerIndex > -1) {
                    if (this.collectedAnswers[answerIndex].selected_option_id !== currentSelection.optionId) {
                        this.collectedAnswers[answerIndex] = currentAnswerRecord;
                    }
                } else if (currentSelection.optionId !== null) {
                    this.collectedAnswers.push(currentAnswerRecord);
                }
            }
        }


        if (this.currentQuestionIndex < this.allQuestions.length - 1) {
            this.currentQuestionIndex++;
            this.displayCurrentQuestion();
        } else {
            this.submitQuiz();
        }
    }

    private submitQuiz() {
        let totalPoints = 0;
        this.collectedAnswers.forEach(ans => totalPoints += ans.points_awarded);

        if (this.questionContainer && this.nextButton) {
            this.questionContainer.innerHTML = `<h2>Quiz Complete!</h2><p>Your score: ${totalPoints} points.</p>`;
        }
    }

    private showNoQuestionsMessage() {
        if (this.questionContainer) {
            this.questionContainer.innerHTML = "<p>No quiz questions available at the moment.</p>";
        }
    }

    private showQuizCompletion() {
       
    }

    async loadTemplate() {
        const content = await loadTemplate('./templates/quiz.view.html');
        if (content) {
            this.shadowRoot?.appendChild(content);
        } else {
            
        }
    }
}

customElements.define('quiz-view', QuizView);