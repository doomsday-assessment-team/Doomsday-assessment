import '../components/QuizQuestion.js';
import { QuizQuestion } from '../components/QuizQuestion.js';
import { apiService } from '../main.js';
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

export interface QuizAttemptPost {
    scenario_id: number,
    selected_options: QuizHistoryPost[]
}

export interface QuizHistoryPost {
    question_id: number,
    option_id: number
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
        // this.initializeQuiz();

    }

    connectedCallback() {
        console.log("QuizView connected to DOM. Reading attributes.");
        // Read attributes set by the router
        const scenarioIdAttr = this.getAttribute('data-param-scenario');
        const difficultyIdAttr = this.getAttribute('data-param-difficulty');

        // Parse them (they will be strings)
        this.scenarioId = scenarioIdAttr ? parseInt(scenarioIdAttr, 10) : null;
        this.difficultyId = difficultyIdAttr ? parseInt(difficultyIdAttr, 10) : null;

        if (isNaN(this.scenarioId as number)) this.scenarioId = null; // Handle if parseInt returns NaN
        if (isNaN(this.difficultyId as number)) this.difficultyId = null;

        console.log(`QuizView: Parsed scenarioId=${this.scenarioId}, difficultyId=${this.difficultyId}`);

        // Now that we have the params, initialize the quiz
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
            // if (this.scenarioError) {
            //     this.scenarioError.textContent = "Could not load scenarios. Please try again later.";
            // }
            // Optionally disable the select or show a more prominent error
        }
    }

    private async initializeQuiz() {
        await this.loadViewTemplate();
        this.fetchQuiz();
        // this.allQuestions = await fetchQuizQuestions();

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

    private handleTimerExpired(event: CustomEvent) {
        // const { questionId } = event.detail;
        console.log(event);

        this.proceedToNextOrSubmit(true); // Pass a flag indicating timer expiry
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
                if (validationMsgEl) validationMsgEl.textContent = "Please select an answer.";
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

    private proceedToNextOrSubmit(timerExpired: boolean = false) {
        if (this.currentQuestionElement) {
            const currentSelection = this.currentQuestionElement.getSelectedAnswer();
            const currentQuestionData = this.currentQuestionElement.data;
            if (currentQuestionData) {
                const answerIndex = this.collectedAnswers.findIndex(ans => ans.question_id === currentQuestionData.question_id);

                const currentAnswerRecord: Answer = {
                    question_id: currentQuestionData.question_id,
                    selected_option_id: currentSelection.optionId,
                    points_awarded: timerExpired && currentSelection.optionId === null ? currentSelection.points : 0,
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

    private async submitQuiz() {
        if (this.isQuizSubmitted) {
            console.log("QuizView: Quiz already submitted, preventing duplicate submission.");
            return; // Already submitted, do nothing
        }
        this.isQuizSubmitted = true;

        let totalPoints = 0;
        this.collectedAnswers.forEach(ans => totalPoints += ans.points_awarded);

        const snn = this.collectedAnswers.map<QuizHistoryPost>(ans => ({
            question_id: ans.question_id,
            option_id: ans.selected_option_id ?? -1
        }));

        const attept: QuizAttemptPost = {
            scenario_id: this.scenarioId ?? -1,
            selected_options: snn
        };

        if (this.questionContainer && this.nextButton) {
            this.questionContainer.innerHTML = `<h2>Quiz Complete!</h2><p>Your score: ${totalPoints} points.</p>`;
        }

        try {
            const result = await apiService.post<QuizAttemptResult>('/quiz/attempts', attept);
            console.info(result);
            if (this.questionContainer && this.nextButton) {
                this.questionContainer.innerHTML = `<h2>Quiz Complete!</h2><p>Your score: ${totalPoints} points.</p><p>Feedback: ${result.result_feedback} points.</p>`;
            }

        } catch (error) {

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