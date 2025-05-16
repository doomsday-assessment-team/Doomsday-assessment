import '../components/QuizQuestion.js';
import { QuizQuestion } from '../components/QuizQuestion.js';
import { apiService, App } from '../main.js';
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
    question_text: string;
    selected_option_id: number | null;
    option_text: string;
    points_awarded: number;
    scenario_id: number;
}

export interface QuizAttemptPost {
    scenario_id: number,
    selected_options: QuizHistoryPost[]
}

export interface QuizHistoryPost {
    question_id: number;
    question_text: string;
    option_id: number;
    option_text: string;
}

export interface QuizAttemptResult {
    history_id: number;
    user_id: number;
    timestamp: Date;
    total_score: number;
    scenario_id: number;
    scenario_name?: string;
    result_title: string;
    result_feedback: string;
}

export class QuizView extends HTMLElement {

    private shadowRootInstance: ShadowRoot;
    private allQuestions: Question[] = [];
    private currentQuestionIndex: number = -1;
    private currentQuestionElement: QuizQuestion | null = null;
    private collectedAnswers: Answer[] = [];

    private questionContainer: HTMLElement | null = null;
    private nextButton: HTMLButtonElement | null = null;

    private scenarioId: number | null = null;
    private difficultyId: number | null = null;

    private isQuizSubmitted: boolean = false;

    constructor() {
        super();
        this.shadowRootInstance = this.attachShadow({ mode: 'open' });

    }

    connectedCallback() {
        console.log("QuizView connected to DOM. Reading attributes.");
        const scenarioIdAttr = this.getAttribute('data-param-scenario');
        const difficultyIdAttr = this.getAttribute('data-param-difficulty');

        this.scenarioId = scenarioIdAttr ? parseInt(scenarioIdAttr, 10) : null;
        this.difficultyId = difficultyIdAttr ? parseInt(difficultyIdAttr, 10) : null;

        if (isNaN(this.scenarioId as number)) this.scenarioId = null;
        if (isNaN(this.difficultyId as number)) this.difficultyId = null;

        console.log(`QuizView: Parsed scenarioId=${this.scenarioId}, difficultyId=${this.difficultyId}`);

        this.initializeQuiz();
    }

    async fetchQuiz() {
        try {
            const question: Question[] = await apiService.get<Question[]>('/quiz/questions', {
                "scenario_id": this.scenarioId?.toString() ?? '',
                "question_difficulty_id": this.difficultyId?.toString() ?? '',
                "limit": "10"
            });

            console.info(question);

            this.allQuestions = question;
            this.collectedAnswers = [];
            if (this.allQuestions.length > 0) {
                this.currentQuestionIndex = 0;
                this.displayCurrentQuestion();
            } else {
                this.showNoQuestionsMessage();
            }
        } catch (error) {

            if (this.questionContainer) {
                this.questionContainer.innerHTML = "<p>Error loading quiz questions. Please try again later.</p>";
            }

        }
    }

    private async initializeQuiz() {
        await this.loadViewTemplate();
        this.fetchQuiz();

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
            this.shadowRootInstance.innerHTML = "<p>Error: Quiz interface could not be loaded.</p>";
        }
    }

    private handleTimerExpired(event: CustomEvent) {
        console.log("QuizView: Timer expired for question.", event);

        this.proceedToNextOrSubmit(true);
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
            this.currentQuestionElement.removeEventListener('answerselected', this.handleAnswerSelectedForValidation.bind(this) as EventListener);
            this.currentQuestionElement.removeEventListener('timerexpired', this.handleTimerExpired.bind(this) as EventListener);
            this.currentQuestionElement.remove();
        }

        this.currentQuestionElement = document.createElement('quiz-question') as QuizQuestion;
        this.currentQuestionElement.data = questionData;

        this.currentQuestionElement.addEventListener('answerselected', this.handleAnswerSelectedForValidation.bind(this) as EventListener);

        this.currentQuestionElement.addEventListener('timerexpired', this.handleTimerExpired.bind(this) as EventListener);


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
                if (validationMsgEl) {
                    validationMsgEl.textContent = "Please select an answer.";
                    validationMsgEl.setAttribute('role', 'alert');
                };
                return;
            }
        }
        this.proceedToNextOrSubmit();
    }

    private handleAnswerSelected(event: CustomEvent) {
        const detail = event.detail;
        const currentQuestionData = this.allQuestions.find(q => q.question_id === detail.questionId);

        if (!currentQuestionData) {
            console.error("QuizView: Could not find question data for answer:", detail);
            return;
        }

        const answerIndex = this.collectedAnswers.findIndex(ans => ans.question_id === detail.questionId);

        const question_text = currentQuestionData.question_text;
        let option_text = "";
        if (detail.selectedOptionId !== null) {
            const selectedOption = currentQuestionData.options.find(opt => opt.option_id === detail.selectedOptionId);
            if (selectedOption) {
                option_text = selectedOption.option_text;
            } else {
                console.warn(`QuizView: Selected option ID ${detail.selectedOptionId} not found in question ${detail.questionId}`);
            }
        }

        const newAnswer: Answer = {
            question_id: detail.questionId,
            question_text: question_text,
            selected_option_id: detail.selectedOptionId,
            option_text: option_text,
            points_awarded: detail.points,
            scenario_id: currentQuestionData.scenario_id
        };
        if (answerIndex > -1) {
            this.collectedAnswers[answerIndex] = newAnswer;
        } else {
            this.collectedAnswers.push(newAnswer);
        }
    }

    private proceedToNextOrSubmit(timerExpired: boolean = false) {
        if (this.currentQuestionElement) {
            const currentSelection = this.currentQuestionElement.getSelectedAnswer();
            const currentQuestionData = this.currentQuestionElement.data;
            const selection = this.currentQuestionElement.getSelectedAnswer();
            if (currentQuestionData) {
                const answerIndex = this.collectedAnswers.findIndex(ans => ans.question_id === currentQuestionData.question_id);

                const question_text = currentQuestionData.question_text;
                let option_text = "";
                if (selection.optionId !== null) {
                    const selectedOptionObj = currentQuestionData.options.find(opt => opt.option_id === selection.optionId);
                    if (selectedOptionObj) {
                        option_text = selectedOptionObj.option_text;
                    }
                }


                const currentAnswerRecord: Answer = {
                    question_id: currentQuestionData.question_id,
                    question_text: question_text,
                    selected_option_id: selection.optionId,
                    option_text: option_text,
                    points_awarded: selection.points,
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

        const validationMsgEl = this.shadowRootInstance.querySelector('.validation-message') as HTMLElement | null;
        if (validationMsgEl) validationMsgEl.textContent = "";


        if (this.currentQuestionIndex < this.allQuestions.length - 1) {
            this.currentQuestionIndex++;
            this.displayCurrentQuestion();
        } else {
            this.submitQuiz();
        }
    }

    private async submitQuiz() {
        if (this.isQuizSubmitted) {
            console.log("QuizView: Quiz already submitted, preventing duplicate submission.");
            return;
        }
        this.isQuizSubmitted = true;

        let totalPoints = 0;
        this.collectedAnswers.forEach(ans => totalPoints += ans.points_awarded);

        const selectedOptionsForPost = this.collectedAnswers.map<QuizHistoryPost>(ans => ({
            question_id: ans.question_id,
            option_id: ans.selected_option_id ?? -1,
            option_text: ans.option_text,
            question_text: ans.question_text
        }));

        const attept: QuizAttemptPost = {
            scenario_id: this.scenarioId ?? -1,
            selected_options: selectedOptionsForPost
        };

        if (this.questionContainer) {
            this.questionContainer.innerHTML = `<h2>Quiz Submitting...</h2><p>Calculating your results.</p>`;
        }

        try {
            console.log(attept);
            const result = await apiService.post<QuizAttemptResult>('/quiz/attempts', attept);
            console.info(result);
            if (this.questionContainer && this.nextButton) {
                this.questionContainer.innerHTML = `
                    <h2>Quiz Complete!</h2>
                    <p><strong>${result.result_title || 'Your Results'}</strong></p>
                    <p>Total Score: ${result.total_score} points.</p>
                    <p>${result.result_feedback || 'Thank you for completing the quiz.'}</p>
                    <button id="quiz-view-close-btn">Close</button> <!-- Example: Add a close button -->
                `;
                const closeButton = this.shadowRootInstance.querySelector('#quiz-view-close-btn');
                if (closeButton) {
                    closeButton.addEventListener('click', () => {
                        App.navigate('/');
                        this.dispatchEvent(new CustomEvent('quizcompleted', { bubbles: true, composed: true, detail: result }));
                    });
                }
            }

        } catch (error) {
            if (this.questionContainer) {
                this.questionContainer.innerHTML = `<h2>Quiz Submission Failed</h2><p>There was an error submitting your quiz. Please try again later.</p>`;
            }
            this.isQuizSubmitted = false;
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