import "../components/QuizQuestion.js"
import type { QuizQuestion } from "../components/QuizQuestion.js"
import { apiService, App } from "../main.js"
import { loadTemplate } from "../utils/load-template.js"

interface Option {
    option_id: number
    option_text: string
    points: number
}

interface Question {
    question_id: number
    question_text: string
    question_difficulty_id: number
    question_difficulty_name?: string
    difficulty_time?: number
    scenario_id: number
    scenario_name?: string
    options: Option[]
}

export interface Answer {
    question_id: number
    question_text: string
    selected_option_id: number | null
    option_text: string
    points_awarded: number
    scenario_id: number
}

export interface QuizAttemptPost {
    scenario_id: number
    selected_options: QuizHistoryPost[]
}

export interface QuizHistoryPost {
    question_id: number
    question_text: string
    option_id: number
    option_text: string
}

export interface QuizAttemptResult {
    history_id: number
    user_id: number
    timestamp: Date
    total_score: number
    scenario_id: number
    scenario_name?: string
    result_title: string
    result_feedback: string
}

export class QuizView extends HTMLElement {
    private shadowRootInstance: ShadowRoot
    private allQuestions: Question[] = []
    private currentQuestionIndex = -1
    private currentQuestionElement: QuizQuestion | null = null
    private collectedAnswers: Answer[] = []

    private questionContainer: HTMLElement | null = null
    private nextButton: HTMLButtonElement | null = null
    private progressBar: HTMLElement | null = null
    private progressText: HTMLElement | null = null

    private scenarioId: number | null = null
    private difficultyId: number | null = null
    private scenarioInfoElement: HTMLElement | null = null;


    private isQuizSubmitted = false
    private isLoading = false

    constructor() {
        super();
        this.shadowRootInstance = this.attachShadow({ mode: 'open' });

    }

    connectedCallback() {
        const scenarioIdAttr = this.getAttribute("data-param-scenario")
        const difficultyIdAttr = this.getAttribute("data-param-difficulty")

        this.scenarioId = scenarioIdAttr ? Number.parseInt(scenarioIdAttr, 10) : null
        this.difficultyId = difficultyIdAttr ? Number.parseInt(difficultyIdAttr, 10) : null

        if (isNaN(this.scenarioId as number)) this.scenarioId = null;
        if (isNaN(this.difficultyId as number)) this.difficultyId = null;


        this.initializeQuiz();
    }

    async fetchQuiz() {
        try {
            this.setLoading(true)

            const questions: Question[] = await apiService.get<Question[]>("/quiz/questions", {
                scenario_id: this.scenarioId?.toString() ?? "",
                question_difficulty_id: this.difficultyId?.toString() ?? "",
                limit: "10",
            })


            this.allQuestions = questions
            this.collectedAnswers = []

            if (this.allQuestions.length > 0) {
                this.currentQuestionIndex = 0;
                this.displayCurrentQuestion();
                this.updateProgressIndicators();
            } else {
                this.showNoQuestionsMessage();
            }
        } catch (error) {
            this.showErrorMessage("Failed to load quiz questions. Please try again later.")
        } finally {
            this.setLoading(false);
        }
    }

    private setLoading(isLoading: boolean) {
        this.isLoading = isLoading

        const loadingIndicator = this.shadowRootInstance.querySelector(".loading-indicator")
        if (loadingIndicator) {
            loadingIndicator.classList.toggle("hidden", !isLoading)
        }

        if (this.questionContainer) {
            this.questionContainer.classList.toggle("hidden", isLoading)
        }

        if (this.nextButton) {
            this.nextButton.disabled = isLoading
        }
    }

    private async initializeQuiz() {
        await this.loadViewTemplate();
        this.updateScenarioInfoDisplay();
        this.fetchQuiz();
    }

    private async loadViewTemplate() {
        try {
            const content = await loadTemplate('./templates/quiz.view.html');
            if (content) {
                this.shadowRootInstance.appendChild(content);

                this.questionContainer = this.shadowRootInstance.querySelector("#quiz-container");
                this.nextButton = this.shadowRootInstance.querySelector("#next-question-btn");
                this.progressBar = this.shadowRootInstance.querySelector(".progress-bar");
                this.progressText = this.shadowRootInstance.querySelector(".progress-text");
                this.scenarioInfoElement = this.shadowRootInstance.querySelector('#scenario-info');

                if (!this.shadowRootInstance.querySelector(".loading-indicator")) {
                    const loadingIndicator = document.createElement("div")
                    loadingIndicator.className = "loading-indicator hidden"
                    loadingIndicator.textContent = "Loading quiz..."
                    this.shadowRootInstance
                        .querySelector("main")
                        ?.insertBefore(loadingIndicator, this.shadowRootInstance.querySelector("article"))
                }

                if (!this.progressBar && !this.progressText) {
                    const progressContainer = document.createElement("div")
                    progressContainer.className = "progress-container"

                    this.progressText = document.createElement("div")
                    this.progressText.className = "progress-text"

                    this.progressBar = document.createElement("div")
                    this.progressBar.className = "progress-bar-container"
                    const progressBarInner = document.createElement("div")
                    progressBarInner.className = "progress-bar"
                    this.progressBar.appendChild(progressBarInner)

                    progressContainer.appendChild(this.progressText)
                    progressContainer.appendChild(this.progressBar)

                    const article = this.shadowRootInstance.querySelector("article")
                    if (article) {
                        article.insertBefore(progressContainer, article.firstChild)
                    }
                }

                if (this.nextButton) {
                    this.nextButton.addEventListener("click", () => this.validateAndProceed())
                    this.nextButton.disabled = true
                }

                document.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" && this.nextButton && !this.nextButton.disabled) {
                        this.validateAndProceed()
                    }
                });

                // this.setupFlickerEffect();

            } else {
                this.shadowRootInstance.innerHTML = "<p>Error: Quiz interface could not be loaded interface.</p>"
            }
        } catch (error) {
            this.shadowRootInstance.innerHTML = "<p>Error: Quiz interface could not be loaded.</p>"
        }
    }

    private setupFlickerEffect() {
        // Get the flicker overlay element
        const flickerOverlay = this.shadowRootInstance.querySelector(".flicker-overlay")
        if (!flickerOverlay) return

        // Add the basic flicker effect
        flickerOverlay.classList.add("flicker-effect")

        // Add event listener for the timer getting low
        this.addEventListener("timerlow", this.handleTimerLow.bind(this) as EventListener)

        // Add event listener for timer expiring
        this.addEventListener("timerexpired", this.handleTimerExpired.bind(this) as EventListener)

        // Add a toggle button for emergency mode
        const toggleButton = document.createElement("button")
        toggleButton.className = "emergency-toggle"
        toggleButton.textContent = "Toggle Emergency Mode"
        toggleButton.setAttribute("aria-label", "Toggle emergency visual effects")
        toggleButton.addEventListener("click", () => this.toggleEmergencyMode())

        const main = this.shadowRootInstance.querySelector("main")
        if (main) {
            main.parentNode?.insertBefore(toggleButton, main)
        }
    }

    private handleTimerLow(event: CustomEvent) {
        // Intensify flicker when timer is low
        const flickerOverlay = this.shadowRootInstance.querySelector(".flicker-overlay")
        if (flickerOverlay) {
            flickerOverlay.classList.remove("flicker-effect")
            flickerOverlay.classList.add("flicker-effect-intense")
        }

        // Add emergency mode class to main container
        const main = this.shadowRootInstance.querySelector("main")
        if (main) {
            main.classList.add("emergency-mode")
        }

        // Add text flicker to timer
        const timerDisplay = this.shadowRootInstance.querySelector(".timer-display")
        if (timerDisplay) {
            timerDisplay.classList.add("emergency-text-effect")
        }
    }

    private toggleEmergencyMode() {
        const main = this.shadowRootInstance.querySelector("main")
        if (main) {
            main.classList.toggle("emergency-mode")
        }

        const flickerOverlay = this.shadowRootInstance.querySelector(".flicker-overlay")
        if (flickerOverlay) {
            if (flickerOverlay.classList.contains("flicker-effect")) {
                flickerOverlay.classList.remove("flicker-effect")
                flickerOverlay.classList.add("flicker-effect-intense")
            } else {
                flickerOverlay.classList.remove("flicker-effect-intense")
                flickerOverlay.classList.add("flicker-effect")
            }
        }

        // Show notification
        this.showNotification("Emergency mode toggled", "info")
    }

    private handleTimerExpired(event: CustomEvent) {

        this.showNotification("Time's up! Moving to the next question.", "warning")

        setTimeout(() => {
            this.proceedToNextOrSubmit(true)
        }, 1500)
    }

    private updateScenarioInfoDisplay() {
        if (!this.scenarioInfoElement) return;

        let scenarioText = '';
        let difficultyText = '';

        if (this.allQuestions.length > 0) {
            const firstQuestion = this.allQuestions[0];

            scenarioText = `Scenario ID: ${firstQuestion.scenario_id}`;
            difficultyText = firstQuestion.question_difficulty_name
                ? `Difficulty: ${firstQuestion.question_difficulty_name}`
                : (this.difficultyId ? `Difficulty ID: ${this.difficultyId}` : 'Difficulty: N/A');
        } else if (this.scenarioId !== null) {
            scenarioText = `Scenario ID: ${this.scenarioId}`;
            difficultyText = this.difficultyId ? `Difficulty ID: ${this.difficultyId}` : 'Difficulty: N/A';
        }
        this.scenarioInfoElement.textContent = `${scenarioText} | ${difficultyText}`;
    }

    private showNotification(message: string, type: "info" | "warning" | "error" = "info") {
        let notification = this.shadowRootInstance.querySelector(".notification")
        if (!notification) {
            notification = document.createElement("div")
            notification.className = "notification"
            this.shadowRootInstance.querySelector("main")?.appendChild(notification)
        }

        notification.textContent = message
        notification.className = `notification ${type}`

        notification.classList.add("show")

        setTimeout(() => {
            notification.classList.remove("show")
        }, 3000)
    }

    private updateProgressIndicators() {
        if (!this.allQuestions.length) return

        const currentIndex = this.currentQuestionIndex + 1
        const total = this.allQuestions.length
        const percentage = (currentIndex / total) * 100

        if (this.progressText) {
            this.progressText.textContent = `Question ${currentIndex} of ${total}`
        }

        if (this.progressBar) {
            const bar = this.progressBar.querySelector(".progress-bar")
            if (bar) {
                bar.setAttribute("style", `width: ${percentage}%`)
            }
        }
    }

    private displayCurrentQuestion() {
        if (!this.questionContainer) {
            return
        }

        if (this.currentQuestionIndex < 0 || this.currentQuestionIndex >= this.allQuestions.length) {
            this.showQuizCompletion()
            return
        }

        const questionData = this.allQuestions[this.currentQuestionIndex]

        // Clean up previous question
        if (this.currentQuestionElement) {
            this.currentQuestionElement.removeEventListener(
                "answerselected",
                this.handleAnswerSelectedForValidation.bind(this) as EventListener,
            )
            this.currentQuestionElement.removeEventListener(
                "timerexpired",
                this.handleTimerExpired.bind(this) as EventListener,
            )
            this.currentQuestionElement.remove()
        }

        // Create new question element
        this.currentQuestionElement = document.createElement("quiz-question") as QuizQuestion
        this.currentQuestionElement.data = questionData

        // Add event listeners
        this.currentQuestionElement.addEventListener(
            "answerselected",
            this.handleAnswerSelectedForValidation.bind(this) as EventListener,
        )
        this.currentQuestionElement.addEventListener("timerexpired", this.handleTimerExpired.bind(this) as EventListener)

        // Add to DOM
        const existingQQ = this.questionContainer.querySelector("quiz-question")
        if (existingQQ) {
            this.questionContainer.replaceChild(this.currentQuestionElement, existingQQ)
        } else {
            this.questionContainer.insertBefore(this.currentQuestionElement, this.questionContainer.firstChild)
        }

        // Update button state
        this.updateNextButtonState()

        // Update scenario info
        const scenarioInfo = this.shadowRootInstance.querySelector(".scenario-info")
        if (scenarioInfo) {
            scenarioInfo.textContent = `Scenario: ${questionData.scenario_name || "General Preparedness"} | Difficulty: ${questionData.question_difficulty_name || "Easy"}`
        }

        // Update button text
        if (this.nextButton) {
            if (this.currentQuestionIndex === this.allQuestions.length - 1) {
                this.nextButton.textContent = "Submit Quiz"
            } else {
                this.nextButton.textContent = "Next Question"
            }
        }

        // Update progress indicators
        this.updateProgressIndicators()
    }

    private handleAnswerSelectedForValidation(event: CustomEvent) {
        this.handleAnswerSelected(event)
        this.updateNextButtonState()
    }

    private updateNextButtonState() {
        if (this.nextButton && this.currentQuestionElement) {
            const selection = this.currentQuestionElement.getSelectedAnswer()
            if (selection.optionId !== null) {
                this.nextButton.disabled = false
                this.nextButton.removeAttribute("aria-disabled")
            } else {
                this.nextButton.disabled = true
                this.nextButton.setAttribute("aria-disabled", "true")
            }
        } else if (this.nextButton) {
            if (this.currentQuestionIndex >= this.allQuestions.length - 1 && this.allQuestions.length > 0) {
                const selection = this.currentQuestionElement?.getSelectedAnswer()
                this.nextButton.disabled = selection?.optionId === null
            } else {
                this.nextButton.disabled = true
                this.nextButton.setAttribute("aria-disabled", "true")
            }
        }
    }

    private validateAndProceed() {
        if (this.currentQuestionElement) {
            const selection = this.currentQuestionElement.getSelectedAnswer()
            if (selection.optionId === null && this.currentQuestionIndex < this.allQuestions.length) {
                this.showNotification("Please select an answer before continuing.", "warning")
                return
            }
        }
        this.proceedToNextOrSubmit()
    }

    private handleAnswerSelected(event: CustomEvent) {
        const detail = event.detail
        const currentQuestionData = this.allQuestions.find((q) => q.question_id === detail.questionId)

        if (!currentQuestionData) {
            return
        }

        const answerIndex = this.collectedAnswers.findIndex((ans) => ans.question_id === detail.questionId)

        const question_text = currentQuestionData.question_text
        let option_text = ""
        if (detail.selectedOptionId !== null) {
            const selectedOption = currentQuestionData.options.find((opt) => opt.option_id === detail.selectedOptionId)
            if (selectedOption) {
                option_text = selectedOption.option_text
            } else {
            }
        }

        const newAnswer: Answer = {
            question_id: detail.questionId,
            question_text: question_text,
            selected_option_id: detail.selectedOptionId,
            option_text: option_text,
            points_awarded: detail.points,
            scenario_id: currentQuestionData.scenario_id,
        }

        if (answerIndex > -1) {
            this.collectedAnswers[answerIndex] = newAnswer
        } else {
            this.collectedAnswers.push(newAnswer)
        }
    }

    private proceedToNextOrSubmit(timerExpired = false) {
        // Ensure current answer is saved
        if (this.currentQuestionElement) {
            const currentSelection = this.currentQuestionElement.getSelectedAnswer()
            const currentQuestionData = this.currentQuestionElement.data

            if (currentQuestionData && currentSelection.optionId !== null) {
                const answerIndex = this.collectedAnswers.findIndex(
                    (ans) => ans.question_id === currentQuestionData.question_id,
                )

                const question_text = currentQuestionData.question_text
                let option_text = ""

                const selectedOptionObj = currentQuestionData.options.find((opt) => opt.option_id === currentSelection.optionId)
                if (selectedOptionObj) {
                    option_text = selectedOptionObj.option_text
                }

                const currentAnswerRecord: Answer = {
                    question_id: currentQuestionData.question_id,
                    question_text: question_text,
                    selected_option_id: currentSelection.optionId,
                    option_text: option_text,
                    points_awarded: currentSelection.points,
                    scenario_id: currentQuestionData.scenario_id,
                }

                if (answerIndex > -1) {
                    this.collectedAnswers[answerIndex] = currentAnswerRecord
                } else {
                    this.collectedAnswers.push(currentAnswerRecord)
                }
            }
        }

        // Move to next question or submit
        if (this.currentQuestionIndex < this.allQuestions.length - 1) {
            this.currentQuestionIndex++
            this.displayCurrentQuestion()
        } else {
            this.submitQuiz()
        }
    }

    private async submitQuiz() {
        if (this.isQuizSubmitted) {
            return
        }

        this.isQuizSubmitted = true
        this.setLoading(true)

        // Calculate total points
        let totalPoints = 0
        this.collectedAnswers.forEach((ans) => (totalPoints += ans.points_awarded))

        // Prepare data for submission
        const selectedOptionsForPost = this.collectedAnswers.map<QuizHistoryPost>((ans) => ({
            question_id: ans.question_id,
            option_id: ans.selected_option_id ?? -1,
            option_text: ans.option_text,
            question_text: ans.question_text,
        }))

        const attempt: QuizAttemptPost = {
            scenario_id: this.scenarioId ?? -1,
            selected_options: selectedOptionsForPost,
        }

        // Show submitting state
        if (this.questionContainer) {
            this.questionContainer.innerHTML = `
                <div class="submitting-container">
                    <h2>Submitting Quiz...</h2>
                    <p>Calculating your results.</p>
                    <div class="spinner"></div>
                </div>
            `
        }

        try {
            const result = await apiService.post<QuizAttemptResult>("/quiz/attempts", attempt)

            this.displayQuizResults(result)
        } catch (error) {
            this.showErrorMessage("Failed to submit your quiz. Please try again later.")
            this.isQuizSubmitted = false
        } finally {
            this.setLoading(false)
        }
    }

    private displayQuizResults(result: QuizAttemptResult) {
        if (!this.questionContainer) return

        // Clear container
        this.questionContainer.innerHTML = ""

        // Create results elements
        const resultsContainer = document.createElement("div")
        resultsContainer.className = "quiz-results"

        // Add heading
        const heading = document.createElement("h2")
        heading.textContent = "Quiz Complete!"
        heading.className = "results-heading"

        // Add title
        const titleParagraph = document.createElement("p")
        titleParagraph.className = "results-title"
        const titleStrong = document.createElement("strong")
        titleStrong.textContent = result.result_title || "Your Results"
        titleParagraph.appendChild(titleStrong)

        // Add score
        const scoreParagraph = document.createElement("p")
        scoreParagraph.className = "results-score"
        scoreParagraph.textContent = `Total Score: ${result.total_score} points`

        // Add feedback
        const feedbackParagraph = document.createElement("p")
        feedbackParagraph.className = "results-feedback"
        feedbackParagraph.textContent = result.result_feedback || "Thank you for completing the quiz."

        // Add answers review section
        const answersReview = document.createElement("div")
        answersReview.className = "answers-review"

        const reviewHeading = document.createElement("h3")
        reviewHeading.textContent = "Your Answers"
        reviewHeading.className = "review-heading"
        answersReview.appendChild(reviewHeading)

        // Add each answer
        this.collectedAnswers.forEach((answer, index) => {
            const question = this.allQuestions.find((q) => q.question_id === answer.question_id)
            if (!question) return

            // Find correct answer (highest points)
            const correctOption = question.options.reduce((prev, current) => (prev.points > current.points ? prev : current))

            const isCorrect = answer.selected_option_id === correctOption.option_id

            const answerItem = document.createElement("div")
            answerItem.className = `answer-review-item ${isCorrect ? "correct" : "incorrect"}`

            const questionNumber = document.createElement("div")
            questionNumber.className = "question-number"
            questionNumber.textContent = `Question ${index + 1}`

            const questionText = document.createElement("div")
            questionText.className = "question-text-review"
            questionText.textContent = question.question_text

            const yourAnswer = document.createElement("div")
            yourAnswer.className = "your-answer"
            yourAnswer.innerHTML = `<strong>Your answer:</strong> ${answer.option_text || "Not answered"}`

            const correctAnswer = document.createElement("div")
            correctAnswer.className = "correct-answer"
            correctAnswer.innerHTML = `<strong>Correct answer:</strong> ${correctOption.option_text}`

            answerItem.appendChild(questionNumber)
            answerItem.appendChild(questionText)
            answerItem.appendChild(yourAnswer)
            answerItem.appendChild(correctAnswer)

            answersReview.appendChild(answerItem)
        })

        // Add close button
        const closeButton = document.createElement("button")
        closeButton.id = "quiz-view-close-btn"
        closeButton.className = "continue-btn"
        closeButton.textContent = "Close"

        closeButton.addEventListener("click", () => {
            App.navigate("/")
            this.dispatchEvent(
                new CustomEvent("quizcompleted", {
                    bubbles: true,
                    composed: true,
                    detail: result,
                }),
            )
        })

        // Add restart button
        const restartButton = document.createElement("button")
        restartButton.id = "quiz-view-restart-btn"
        restartButton.className = "restart-btn"
        restartButton.textContent = "Take Another Quiz"

        restartButton.addEventListener("click", () => {
            this.resetQuiz()
        })

        // Add buttons container
        const buttonsContainer = document.createElement("div")
        buttonsContainer.className = "results-buttons"
        buttonsContainer.appendChild(restartButton)
        buttonsContainer.appendChild(closeButton)

        // Assemble results container
        resultsContainer.appendChild(heading)
        resultsContainer.appendChild(titleParagraph)
        resultsContainer.appendChild(scoreParagraph)
        resultsContainer.appendChild(feedbackParagraph)
        resultsContainer.appendChild(answersReview)
        resultsContainer.appendChild(buttonsContainer)

        // Add to DOM
        this.questionContainer.appendChild(resultsContainer)

        // Hide next button
        if (this.nextButton) {
            this.nextButton.style.display = "none"
        }

        // Hide scenario info
        const scenarioInfo: HTMLElement | null = this.shadowRootInstance.querySelector(".scenario-info")
        if (scenarioInfo) {
            scenarioInfo.style.display = "none"
        }
    }

    private resetQuiz() {
        // Reset state
        this.currentQuestionIndex = 0
        this.collectedAnswers = []
        this.isQuizSubmitted = false

        // Show next button
        if (this.nextButton) {
            this.nextButton.style.display = ""
            this.nextButton.disabled = true
        }

        // Show scenario info
        const scenarioInfo: HTMLElement | null = this.shadowRootInstance.querySelector(".scenario-info")
        if (scenarioInfo) {
            scenarioInfo.style.display = ""
        }

        // Display first question
        this.displayCurrentQuestion()
    }

    private showNoQuestionsMessage() {
        if (this.questionContainer) {
            this.questionContainer.innerHTML = `
                <div class="no-questions-message">
                    <h2>No Questions Available</h2>
                    <p>There are no quiz questions available for this scenario and difficulty level.</p>
                    <button class="continue-btn" id="back-button">Back to Home</button>
                </div>
            `

            const backButton = this.questionContainer.querySelector("#back-button")
            if (backButton) {
                backButton.addEventListener("click", () => {
                    App.navigate("/")
                })
            }
        }
    }

    private showErrorMessage(message: string) {
        if (this.questionContainer) {
            this.questionContainer.innerHTML = `
                <div class="error-message">
                    <h2>Error</h2>
                    <p>${message}</p>
                    <button class="continue-btn" id="retry-button">Retry</button>
                    <button class="secondary-btn" id="back-button">Back to Home</button>
                </div>
            `

            const retryButton = this.questionContainer.querySelector("#retry-button")
            if (retryButton) {
                retryButton.addEventListener("click", () => {
                    this.fetchQuiz()
                })
            }

            const backButton = this.questionContainer.querySelector("#back-button")
            if (backButton) {
                backButton.addEventListener("click", () => {
                    App.navigate("/")
                })
            }
        }
    }

    private showQuizCompletion() {
        // This is handled by submitQuiz now
    }
}

customElements.define("quiz-view", QuizView)
