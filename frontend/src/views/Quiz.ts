import "../components/QuizQuestion.js"
import "../components/SurvivalScore.js"
import "../components/DynamicBackground.js"
import "../components/RewardAnimation.js"
import type { QuizQuestion } from "../components/QuizQuestion.js"
import type { SurvivalScore } from "../components/SurvivalScore.js"
import type { DynamicBackground } from "../components/DynamicBackground.js"
import type { RewardAnimation } from "../components/RewardAnimation.js"
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
    private scenarioInfoElement: HTMLElement | null = null

    private isQuizSubmitted = false
    private isLoading = false

    // Game elements
    private survivalScore: SurvivalScore | null = null
    private dynamicBackground: DynamicBackground | null = null
    private rewardAnimation: RewardAnimation | null = null
    private correctAnswerStreak = 0
    private questionStartTime = 0
    private difficultyMultiplier = 1

    constructor() {
        super()
        this.shadowRootInstance = this.attachShadow({ mode: "open" })
    }

    connectedCallback() {
        const scenarioIdAttr = this.getAttribute("data-param-scenario")
        const difficultyIdAttr = this.getAttribute("data-param-difficulty")

        this.scenarioId = scenarioIdAttr ? Number.parseInt(scenarioIdAttr, 10) : null
        this.difficultyId = difficultyIdAttr ? Number.parseInt(difficultyIdAttr, 10) : null

        if (isNaN(this.scenarioId as number)) this.scenarioId = null
        if (isNaN(this.difficultyId as number)) this.difficultyId = null

        this.initializeQuiz()
    }

    async fetchQuiz() {
        try {
            this.setLoading(true)

            const questions: Question[] = await apiService.get<Question[]>("/quiz/questions", {
                scenario_id: this.scenarioId?.toString() ?? "",
                question_difficulty_id: this.difficultyId?.toString() ?? "",
                limit: "10",
            })

            console.log("Fetched questions:", questions)

            // Ensure each question has an options array
            this.allQuestions = questions.map((q) => {
                if (!q.options) {
                    q.options = []
                    console.warn("Question had no options, adding empty array:", q)
                }
                return q
            })

            this.collectedAnswers = []

            if (this.allQuestions.length > 0) {
                this.currentQuestionIndex = 0
                this.displayCurrentQuestion()
                this.updateProgressIndicators()

                // Set difficulty multiplier based on selected difficulty
                if (this.difficultyId) {
                    switch (this.difficultyId) {
                        case 3: // Hard
                            this.difficultyMultiplier = 3
                            break
                        case 2: // Medium
                            this.difficultyMultiplier = 2
                            break
                        default: // Easy or unknown
                            this.difficultyMultiplier = 1
                    }
                }
            } else {
                this.showNoQuestionsMessage()
            }
        } catch (error) {
            console.error("Error fetching quiz questions:", error)
            this.showErrorMessage("Failed to load quiz questions. Please try again later.")
        } finally {
            this.setLoading(false)
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
        await this.loadViewTemplate()
        this.createDustParticles()
        this.updateScenarioInfoDisplay()
        this.setupFlickerEffect()
        this.initializeGameElements()
        this.handleResponsiveLayout() // Add this line
        this.fetchQuiz()

        // Add event listener for window resize
        window.addEventListener("resize", () => {
            this.handleResponsiveLayout()
        })
    }

    private initializeGameElements() {
        // Create survival score component
        this.survivalScore = document.createElement("survival-score") as SurvivalScore
        this.shadowRootInstance
            .querySelector("article")
            ?.insertBefore(this.survivalScore, this.shadowRootInstance.querySelector(".progress-container"))

        // Create dynamic background
        this.dynamicBackground = document.createElement("dynamic-background") as DynamicBackground
        this.shadowRootInstance.appendChild(this.dynamicBackground)

        // Create reward animation
        this.rewardAnimation = document.createElement("reward-animation") as RewardAnimation
        this.shadowRootInstance.appendChild(this.rewardAnimation)
    }

    private async loadViewTemplate() {
        try {
            const content = await loadTemplate("./templates/quiz.view.html")
            if (content) {
                this.shadowRootInstance.appendChild(content)

                this.questionContainer = this.shadowRootInstance.querySelector("#quiz-container")
                this.nextButton = this.shadowRootInstance.querySelector("#next-question-btn")
                this.progressBar = this.shadowRootInstance.querySelector(".progress-bar")
                this.progressText = this.shadowRootInstance.querySelector(".progress-text")
                this.scenarioInfoElement = this.shadowRootInstance.querySelector("#scenario-info")

                if (!this.shadowRootInstance.querySelector(".loading-indicator")) {
                    const loadingIndicator = document.createElement("div")
                    loadingIndicator.className = "loading-indicator"
                    loadingIndicator.textContent = "Loading survival assessment"
                    this.shadowRootInstance
                        .querySelector("main")
                        ?.insertBefore(loadingIndicator, this.shadowRootInstance.querySelector("article"))
                }

                if (this.nextButton) {
                    this.nextButton.addEventListener("click", () => this.validateAndProceed())
                    this.nextButton.disabled = true
                }

                document.addEventListener("keydown", (e) => {
                    if (e.key === "Enter" && this.nextButton && !this.nextButton.disabled) {
                        this.validateAndProceed()
                    }
                })
            } else {
                this.shadowRootInstance.innerHTML = "<p>Error: Quiz interface could not be loaded interface.</p>"
            }
        } catch (error) {
            this.shadowRootInstance.innerHTML = "<p>Error: Quiz interface could not be loaded.</p>"
        }
    }

    private createDustParticles() {
        const dustContainer = this.shadowRootInstance.querySelector(".dust-particles")
        if (!dustContainer) return

        // Clear existing particles
        dustContainer.innerHTML = ""

        // Create new particles
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement("div")
            particle.className = "dust-particle"

            // Random position
            const x = Math.random() * 100
            const y = Math.random() * 100

            // Random size
            const size = 1 + Math.random() * 2

            // Random animation duration
            const duration = 20 + Math.random() * 40

            particle.style.left = `${x}%`
            particle.style.top = `${y}%`
            particle.style.width = `${size}px`
            particle.style.height = `${size}px`
            particle.style.animationDuration = `${duration}s`

            dustContainer.appendChild(particle)
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

        // Change background theme
        if (this.dynamicBackground) {
            this.dynamicBackground.setTheme("danger")
            this.dynamicBackground.pulse(2000)
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

        // Reset streak
        this.correctAnswerStreak = 0
        if (this.survivalScore) {
            this.survivalScore.resetStreak()
        }

        // Change background theme
        if (this.dynamicBackground) {
            this.dynamicBackground.setTheme("danger")
            this.dynamicBackground.pulse(2000)
        }

        setTimeout(() => {
            this.proceedToNextOrSubmit()
        }, 0)
    }

    private updateScenarioInfoDisplay() {
        if (!this.scenarioInfoElement) return

        let scenarioText = ""
        let difficultyText = ""

        if (this.allQuestions.length > 0) {
            const firstQuestion = this.allQuestions[0]

            scenarioText = firstQuestion.scenario_name
                ? `SCENARIO: ${firstQuestion.scenario_name}`
                : `SCENARIO ID: ${firstQuestion.scenario_id}`

            difficultyText = firstQuestion.question_difficulty_name
                ? `THREAT LEVEL: ${firstQuestion.question_difficulty_name}`
                : this.difficultyId
                    ? `THREAT LEVEL: ${this.difficultyId}`
                    : "THREAT LEVEL: UNKNOWN"
        } else if (this.scenarioId !== null) {
            scenarioText = `SCENARIO ID: ${this.scenarioId}`
            difficultyText = this.difficultyId ? `THREAT LEVEL: ${this.difficultyId}` : "THREAT LEVEL: UNKNOWN"
        }

        this.scenarioInfoElement.textContent = `${scenarioText} | ${difficultyText}`
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
            this.progressBar.style.width = `${percentage}%`
        }
    }

    private displayCurrentQuestion() {
        if (!this.questionContainer) {
            console.error("Question container not found")
            return
        }

        if (this.currentQuestionIndex < 0 || this.currentQuestionIndex >= this.allQuestions.length) {
            this.showQuizCompletion()
            return
        }

        const questionData = this.allQuestions[this.currentQuestionIndex]
        console.log("Displaying question:", questionData)

        // Store question start time for timing calculations
        this.questionStartTime = performance.now()

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

        // Make sure the data is properly set
        if (!questionData.options) {
            questionData.options = []
            console.error("Question has no options:", questionData)
        }

        // Set the data on the element
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
            scenarioInfo.textContent = `SCENARIO: ${questionData.scenario_name || "UNKNOWN"} | THREAT LEVEL: ${questionData.question_difficulty_name || "STANDARD"}`
        }

        // Update button text
        if (this.nextButton) {
            if (this.currentQuestionIndex === this.allQuestions.length - 1) {
                this.nextButton.textContent = "SUBMIT ASSESSMENT"
            } else {
                this.nextButton.textContent = "NEXT QUESTION"
            }
        }

        // Update progress indicators
        this.updateProgressIndicators()

        // Reset background to default theme for new question
        if (this.dynamicBackground) {
            this.dynamicBackground.setTheme("default")
        }
    }

    private handleAnswerSelectedForValidation(event: CustomEvent) {
        this.handleAnswerSelected(event)
        this.updateNextButtonState()

        // Calculate response time
        const responseTime = performance.now() - this.questionStartTime

        // Get the selected option and check if it's the best answer
        const detail = event.detail
        const currentQuestion = this.allQuestions[this.currentQuestionIndex]
        const selectedOption = currentQuestion.options.find((opt) => opt.option_id === detail.selectedOptionId)

        if (selectedOption) {
            // Find the highest point option (best answer)
            const bestOption = currentQuestion.options.reduce((prev, current) =>
                prev.points > current.points ? prev : current,
            )

            const isCorrect = selectedOption.points > 0
            const isPerfect = selectedOption.option_id === bestOption.option_id

            // Award points based on answer quality and timing
            let pointsToAward = selectedOption.points

            // Apply difficulty multiplier
            pointsToAward *= this.difficultyMultiplier

            // Add time bonus for quick answers (if correct)
            if (isCorrect) {
                const maxTime = currentQuestion.difficulty_time || 60
                const timeBonus = Math.floor(((maxTime - responseTime / 1000) / maxTime) * 10)

                // Only add time bonus if positive
                if (timeBonus > 0) {
                    pointsToAward += timeBonus
                }

                // Update streak for correct answers
                this.correctAnswerStreak++

                // Show streak animation at milestones
                if (this.correctAnswerStreak === 3 || this.correctAnswerStreak === 5) {
                    this.rewardAnimation?.showStreak(this.correctAnswerStreak)
                }

                // Show perfect answer animation
                if (isPerfect) {
                    this.rewardAnimation?.showPerfectAnswer()
                }
            } else {
                // Reset streak on wrong answers
                this.correctAnswerStreak = 0

                // Change background to danger theme
                if (this.dynamicBackground) {
                    this.dynamicBackground.setTheme("danger")
                    this.dynamicBackground.pulse(1000)
                }
            }

            // Update survival score
            if (this.survivalScore) {
                this.survivalScore.addPoints(pointsToAward, isCorrect)
            }

            // Change background to success theme for correct answers
            if (isCorrect && this.dynamicBackground) {
                this.dynamicBackground.setTheme("success")
                this.dynamicBackground.pulse(1000)
            }
        }
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
                this.showNotification("SELECT AN OPTION BEFORE PROCEEDING", "warning")
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

                const selectedOptionObj = currentQuestionData.options.find((opt: { option_id: any }) => opt.option_id === currentSelection.optionId)
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
          <h2>CALCULATING SURVIVAL SCORE...</h2>
          <p>Analyzing your decisions and survival potential.</p>
          <div class="spinner"></div>
        </div>
      `
        }

        try {
            const result = await apiService.post<QuizAttemptResult>("/quiz/attempts", attempt)
            this.displayQuizResults(result)
        } catch (error) {
            this.showErrorMessage(
                "COMMUNICATION FAILURE: Unable to submit your assessment. Try again when conditions improve.",
            )
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
        const resultsContainer = document.createElement("article")
        resultsContainer.className = "quiz-results"

        // Add heading
        const heading = document.createElement("h2")
        heading.textContent = "ASSESSMENT COMPLETE"
        heading.className = "results-heading"

        // Add title
        const titleParagraph = document.createElement("h3")
        titleParagraph.className = "results-title"
        titleParagraph.textContent = result.result_title || "SURVIVAL ANALYSIS"

        // Add score
        const scoreParagraph = document.createElement("output")
        scoreParagraph.className = "results-score"
        scoreParagraph.textContent = `SURVIVAL SCORE: ${result.total_score} POINTS`

        // Add feedback
        const feedbackParagraph = document.createElement("p")
        feedbackParagraph.className = "results-feedback"
        feedbackParagraph.textContent =
            result.result_feedback || "Your survival assessment has been recorded in the system."

        // Add answers review section
        const answersReview = document.createElement("section")
        answersReview.className = "answers-review"

        const reviewHeading = document.createElement("h3")
        reviewHeading.textContent = "DECISION ANALYSIS"
        reviewHeading.className = "review-heading"
        answersReview.appendChild(reviewHeading)

        // Add each answer
        this.collectedAnswers.forEach((answer, index) => {
            const question = this.allQuestions.find((q) => q.question_id === answer.question_id)
            if (!question) return

            // Find correct answer (highest points)
            const correctOption = question.options.reduce((prev, current) => (prev.points > current.points ? prev : current))

            const isCorrect = answer.selected_option_id === correctOption.option_id

            const answerItem = document.createElement("article")
            answerItem.className = `answer-review-item ${isCorrect ? "correct" : "incorrect"}`

            const questionNumber = document.createElement("header")
            questionNumber.className = "question-number"
            questionNumber.textContent = `SCENARIO ${index + 1}`

            const questionText = document.createElement("h4")
            questionText.className = "question-text-review"
            questionText.textContent = question.question_text

            const yourAnswer = document.createElement("p")
            yourAnswer.className = "your-answer"

            const yourAnswerLabel = document.createElement("strong")
            yourAnswerLabel.textContent = "YOUR DECISION: "

            yourAnswer.appendChild(yourAnswerLabel)
            yourAnswer.appendChild(document.createTextNode(answer.option_text || "NO RESPONSE"))

            const correctAnswer = document.createElement("p")
            correctAnswer.className = "correct-answer"

            const correctAnswerLabel = document.createElement("strong")
            correctAnswerLabel.textContent = "OPTIMAL DECISION: "

            correctAnswer.appendChild(correctAnswerLabel)
            correctAnswer.appendChild(document.createTextNode(correctOption.option_text))

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
        closeButton.textContent = "RETURN TO BASE"

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
        restartButton.textContent = "TRY ANOTHER SCENARIO"

        restartButton.addEventListener("click", () => {
            this.resetQuiz()
        })

        // Add buttons container
        const buttonsContainer = document.createElement("footer")
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

        // Show achievement animation
        if (this.rewardAnimation) {
            this.rewardAnimation.showReward(
                "ASSESSMENT COMPLETE",
                result.result_title || "Survival Analysis",
                result.total_score,
                "🏆",
            )
        }

        // Set background to success theme
        if (this.dynamicBackground) {
            this.dynamicBackground.setTheme("success")
            this.dynamicBackground.setIntensity(0.8)
        }
    }

    private resetQuiz() {
        // Reset state
        this.currentQuestionIndex = 0
        this.collectedAnswers = []
        this.isQuizSubmitted = false
        this.correctAnswerStreak = 0

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

        // Reset background
        if (this.dynamicBackground) {
            this.dynamicBackground.setTheme("default")
            this.dynamicBackground.setIntensity(0.5)
        }

        // Display first question
        this.displayCurrentQuestion()
    }

    private showNoQuestionsMessage() {
        if (this.questionContainer) {
            this.questionContainer.innerHTML = `
        <article class="no-questions-message">
          <h2>NO SCENARIOS AVAILABLE</h2>
          <p>There are no survival scenarios available for this combination of parameters.</p>
          <button class="continue-btn" id="back-button">RETURN TO BASE</button>
        </article>
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
        <article class="error-message">
          <h2>SYSTEM FAILURE</h2>
          <p>${message}</p>
          <footer>
            <button class="continue-btn" id="retry-button">RETRY CONNECTION</button>
            <button class="secondary-btn" id="back-button">RETURN TO BASE</button>
          </footer>
        </article>
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

    private handleResponsiveLayout() {
        // Set CSS variables based on viewport size
        const root = this.shadowRootInstance.host as HTMLElement;

        // Calculate font scale based on viewport width
        const viewportWidth = window.innerWidth;
        const fontScale = Math.max(0.8, Math.min(1, viewportWidth / 1200));

        // Set CSS variables
        root.style.setProperty('--font-scale', fontScale.toString());
        root.style.setProperty('--spacing-scale', Math.max(0.8, Math.min(1, viewportWidth / 1000)).toString());

        // Adjust emergency toggle button size through CSS variables
        const toggleButton = this.shadowRootInstance.querySelector(".emergency-toggle") as HTMLElement;
        if (toggleButton) {
            toggleButton.style.setProperty('--button-scale', Math.max(0.7, Math.min(1, viewportWidth / 768)).toString());
        }
    }
}

customElements.define("quiz-view", QuizView)
