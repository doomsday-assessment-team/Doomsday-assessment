import { loadTemplate } from "../utils/load-template.js"
import type { Option } from "../types/global-types.js"

interface Question {
    question_id: number
    question_text: string
    question_difficulty_id: number
    question_difficulty_name?: string
    difficulty_time?: number
    scenario_id: number
    options: Option[]
}

export interface Answer {
    question_id: number
    selected_option_id: number | null
    points_awarded: number
    scenario_id: number
}

export class QuizQuestion extends HTMLElement {
    private _data: Question | null = null
    private shadowRootInstance: ShadowRoot
    private timerInterval: number | null = null
    private timeLeft = 0
    private timerDisplayElement: HTMLElement | null = null
    private selectedOptionId: number | null = null

    constructor() {
        super()
        this.shadowRootInstance = this.attachShadow({ mode: "open" })
    }

    set data(questionData: Question) {
        this._data = questionData
        this.timeLeft = this._data?.difficulty_time || 0
        this.selectedOptionId = null // Reset selection when new question is set
        this.render()
    }

    connectedCallback() {
        if (this._data && this._data.difficulty_time && this._data.difficulty_time > 0) {
            this.startTimer()
        }
    }

    disconnectedCallback() {
        this.stopTimer() // Ensure timer is cleared when component is removed
    }

    private startTimer() {
        this.stopTimer() // Ensure no multiple timers
        if (!this._data || !this._data.difficulty_time || this._data.difficulty_time <= 0) {
            if (this.timerDisplayElement) this.timerDisplayElement.style.display = "none"
            return
        }

        if (this.timerDisplayElement) this.timerDisplayElement.style.display = "block"
        this.timeLeft = this._data.difficulty_time
        this.updateTimerDisplay()

        this.timerInterval = window.setInterval(() => {
            this.timeLeft--
            this.updateTimerDisplay()
            if (this.timeLeft <= 0) {
                this.stopTimer()
                this.handleTimeUp()
            }
        }, 1000) // Update every second
    }

    private stopTimer() {
        if (this.timerInterval !== null) {
            window.clearInterval(this.timerInterval)
            this.timerInterval = null
        }
    }

    private updateTimerDisplay() {
        if (this.timerDisplayElement) {
            const minutes = Math.floor(this.timeLeft / 60)
            const seconds = this.timeLeft % 60
            this.timerDisplayElement.textContent = `Time: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`

            // Add visual indication when time is running low
            if (this.timeLeft <= 10 && this.timeLeft > 0) {
                this.timerDisplayElement.style.color = "var(--danger-color, red)"
                this.timerDisplayElement.classList.add("timer-warning")
            } else {
                this.timerDisplayElement.style.color = "var(--text-color, inherit)"
                this.timerDisplayElement.classList.remove("timer-warning")
            }
        }
    }

    private handleTimeUp() {
        console.log(`QuizQuestion ${this._data?.question_id}: Time's up!`)
        // Disable option selection
        this.shadowRootInstance.querySelectorAll(".answer-option").forEach((option) => {
            option.classList.add("disabled")
        })

        // Add visual indication that time is up
        const timerEl = this.shadowRootInstance.querySelector(".timer-display")
        if (timerEl) {
            timerEl.textContent = "Time's up!"
            timerEl.classList.add("time-expired")
        }

        // Dispatch an event to notify QuizView
        this.dispatchEvent(
            new CustomEvent("timerexpired", {
                bubbles: true,
                composed: true,
                detail: {
                    questionId: this._data?.question_id,
                    selectedOptionId: this.getSelectedAnswer().optionId,
                },
            }),
        )
    }

    get data(): Question | null {
        return this._data
    }

    private async render() {
        if (!this.shadowRootInstance || !this._data) return
        this.stopTimer()

        try {
            const templateContent = await loadTemplate("./templates/quiz-question.component.html")
            if (!templateContent) {
                this.shadowRootInstance.innerHTML = "<p>Error loading question template.</p>"
                return
            }
            const clone = templateContent.cloneNode(true) as DocumentFragment

            // Set up timer display
            this.timerDisplayElement = clone.querySelector(".timer-display")
            if (!this.timerDisplayElement && this._data.difficulty_time) {
                const headerElement = clone.querySelector("header")
                if (headerElement) {
                    this.timerDisplayElement = document.createElement("p")
                    this.timerDisplayElement.classList.add("timer-display")
                    headerElement.appendChild(this.timerDisplayElement)
                }
            }
            this.updateTimerDisplay()

            // Set question text
            const questionHeader = clone.querySelector("header h2")
            if (questionHeader) questionHeader.textContent = this._data.question_text

            // Create answer options with letter indicators (A, B, C, D)
            const optionsList = clone.querySelector(".answer-options")
            if (optionsList) {
                optionsList.innerHTML = ""
                this._data.options.forEach((option, index) => {
                    const optionElement = document.createElement("div")
                    optionElement.className = "answer-option"
                    optionElement.dataset.optionId = String(option.option_id)

                    // Create letter indicator
                    const letterElement = document.createElement("div")
                    letterElement.className = "answer-letter"
                    letterElement.textContent = String.fromCharCode(65 + index) // A, B, C, D

                    // Create option text
                    const textElement = document.createElement("div")
                    textElement.className = "answer-text"
                    textElement.textContent = option.option_text

                    // Create hidden radio input for accessibility
                    const input = document.createElement("input")
                    input.type = "radio"
                    input.name = `answer-q${this._data?.question_id}`
                    input.value = String(option.option_id)
                    input.className = "visually-hidden"
                    input.id = `option-${option.option_id}`

                    optionElement.appendChild(letterElement)
                    optionElement.appendChild(textElement)
                    optionElement.appendChild(input)
                    optionsList.appendChild(optionElement)
                })
            }

            this.shadowRootInstance.innerHTML = ""
            this.shadowRootInstance.appendChild(clone)
            this.addEventListeners()

            if (this._data.difficulty_time && this._data.difficulty_time > 0) {
                this.startTimer()
            }
        } catch (error) {
            console.error("Error rendering quiz question:", error)
            this.shadowRootInstance.innerHTML = "<p>Error rendering question. Please try again.</p>"
        }
    }

    private addEventListeners() {
        this.shadowRootInstance.querySelectorAll(".answer-option").forEach((option) => {
            option.addEventListener("click", (event) => {
                // Remove selection from all options
                this.shadowRootInstance.querySelectorAll(".answer-option").forEach((opt) => {
                    opt.classList.remove("answer-option-selected")
                })

                // Add selection to clicked option
                const selectedOption = event.currentTarget as HTMLElement
                selectedOption.classList.add("answer-option-selected")

                // Update the hidden radio input
                const input = selectedOption.querySelector('input[type="radio"]') as HTMLInputElement
                if (input) {
                    input.checked = true
                }

                // Store selected option ID
                this.selectedOptionId = Number.parseInt(selectedOption.dataset.optionId || "0", 10)

                // Find the option data
                const selectedOptionData = this._data?.options.find((opt) => opt.option_id === this.selectedOptionId)

                // Dispatch event
                this.dispatchEvent(
                    new CustomEvent("answerselected", {
                        bubbles: true,
                        composed: true,
                        detail: {
                            questionId: this._data?.question_id,
                            selectedOptionId: this.selectedOptionId,
                            selectedOptionText: selectedOptionData?.option_text,
                            points: selectedOptionData?.points || 0,
                            scenarioId: this._data?.scenario_id,
                        },
                    }),
                )
            })
        })
    }

    public getSelectedAnswer(): { optionId: number | null; points: number } {
        // First check our stored selection
        if (this.selectedOptionId !== null) {
            const selectedOption = this._data?.options.find((opt) => opt.option_id === this.selectedOptionId)
            return {
                optionId: this.selectedOptionId,
                points: selectedOption?.points || 0,
            }
        }

        // Fallback to checking the radio inputs
        const checkedRadio = this.shadowRootInstance.querySelector('input[type="radio"]:checked') as HTMLInputElement | null
        if (checkedRadio) {
            const selectedOptionId = Number.parseInt(checkedRadio.value, 10)
            const selectedOption = this._data?.options.find((opt) => opt.option_id === selectedOptionId)
            return {
                optionId: selectedOptionId,
                points: selectedOption?.points || 0,
            }
        }

        return { optionId: null, points: 0 }
    }

    // Public method to reset the timer (useful if quiz is paused)
    public resetTimer() {
        if (this._data?.difficulty_time) {
            this.stopTimer()
            this.timeLeft = this._data.difficulty_time
            this.updateTimerDisplay()
            this.startTimer()
        }
    }

    // Public method to pause the timer
    public pauseTimer() {
        this.stopTimer()
    }

    // Public method to resume the timer
    public resumeTimer() {
        if (this.timeLeft > 0) {
            this.startTimer()
        }
    }
}

customElements.define("quiz-question", QuizQuestion)
