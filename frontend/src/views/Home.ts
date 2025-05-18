import { apiService, App } from "../main.js"
import type { Difficulty, Scenario } from "../types/global-types.js"
import { checkAdminRole } from "../utils/check-admin.js"
import { loadTemplate } from "../utils/load-template.js"

export interface Question {
  question_id: number
  question_text: string
  question_difficulty_id: number
  question_difficulty_name?: string
  difficulty_time?: number
  scenario_id: number
}

export class HomeView extends HTMLElement {
  private shadowRootInstance: ShadowRoot
  private form: HTMLFormElement | null = null
  private scenarioSelect: HTMLSelectElement | null = null
  private difficultyFieldset: HTMLFieldSetElement | null = null
  private scenarioError: HTMLElement | null = null
  private difficultyError: HTMLElement | null = null
  private difficultyOptionsList: HTMLSelectElement | null = null
  private scenarios: Scenario[] = []
  private addOptionsButton: HTMLUListElement | null = null
  private nextButton: HTMLButtonElement | null = null
  private audioContext: AudioContext | null = null
  private ambientSound: HTMLAudioElement | null = null
  private radioStaticSound: HTMLAudioElement | null = null
  private alarmSound: HTMLAudioElement | null = null
  private terminalLines: HTMLElement | null = null
  private terminalCursor: HTMLElement | null = null
  private terminalContainer: HTMLElement | null = null
  private startButton: HTMLButtonElement | null = null
  private radioEffect: HTMLElement | null = null
  private dustParticles: HTMLElement | null = null
  private scanlines: HTMLElement | null = null

  constructor() {
    super()
    this.shadowRootInstance = this.attachShadow({ mode: "open" })
    this.loadAndInit()
  }

  private async loadAndInit() {
    const content = await loadTemplate("./templates/home.view.html")
    if (content) {
      this.shadowRootInstance.appendChild(content)
      this.bindElements()
      this.addEventListeners()
      this.populateScenarios()
      this.populateDifficulties()
      this.initializeAudio()
      this.startTerminalAnimation()
      this.initializeVisualEffects()
    } else {
      this.shadowRootInstance.innerHTML = "<p>Error loading home view template.</p>"
    }
  }

  private bindElements() {
    this.form = this.shadowRootInstance.querySelector("form.test-selection")
    this.scenarioSelect = this.shadowRootInstance.querySelector("#scenario")
    this.difficultyFieldset = this.shadowRootInstance.querySelector("#difficulty-fieldset")
    this.scenarioError = this.shadowRootInstance.querySelector("#scenario-error")
    this.difficultyError = this.shadowRootInstance.querySelector("#difficulty-error")
    this.difficultyOptionsList = this.shadowRootInstance.querySelector("#difficulty")
    this.addOptionsButton = this.shadowRootInstance.querySelector("#admin-questions-link-li")
    this.startButton = this.shadowRootInstance.querySelector(".start-button")
    this.terminalLines = this.shadowRootInstance.querySelector(".terminal-lines")
    this.terminalCursor = this.shadowRootInstance.querySelector(".terminal-cursor")
    this.terminalContainer = this.shadowRootInstance.querySelector(".terminal-container")
    this.radioEffect = this.shadowRootInstance.querySelector(".radio-effect")
    this.dustParticles = this.shadowRootInstance.querySelector(".dust-particles")
    this.scanlines = this.shadowRootInstance.querySelector(".scanlines")

    // Initialize ambient flicker effect
    const flicker = () => {
      if (Math.random() > 0.97) {
        document.body.classList.add("flicker")
        setTimeout(() => {
          document.body.classList.remove("flicker")
        }, 150)
      }
    }
    setInterval(flicker, 500)

    this.hideAdminLinkButton()
  }

  private initializeAudio() {
    // Create audio elements
    this.ambientSound = new Audio("./assets/audio/ambient-apocalypse.mp3")
    this.ambientSound.loop = true
    this.ambientSound.volume = 0.3

    this.radioStaticSound = new Audio("./assets/audio/radio-static.mp3")
    this.radioStaticSound.loop = true
    this.radioStaticSound.volume = 0.1

    this.alarmSound = new Audio("./assets/audio/alarm.mp3")
    this.alarmSound.volume = 0.4

    // Add audio toggle button event
    const audioToggle = this.shadowRootInstance.querySelector(".audio-toggle")
    if (audioToggle) {
      audioToggle.addEventListener("click", () => this.toggleAudio())
    }
  }

  private toggleAudio() {
    const audioToggle = this.shadowRootInstance.querySelector(".audio-toggle") as HTMLElement

    if (this.ambientSound?.paused) {
      this.ambientSound.play()
      this.radioStaticSound?.play()
      audioToggle.textContent = "🔊"
      audioToggle.setAttribute("title", "Mute Sounds")
    } else {
      this.ambientSound?.pause()
      this.radioStaticSound?.pause()
      audioToggle.textContent = "🔇"
      audioToggle.setAttribute("title", "Enable Sounds")
    }
  }

  private initializeVisualEffects() {
    // Randomly move dust particles
    if (this.dustParticles) {
      const moveDust = () => {
        const particles = this.dustParticles?.querySelectorAll(".dust-particle")
        particles?.forEach((particle) => {
          const x = Math.random() * 100
          const y = Math.random() * 100
          const speed = 20 + Math.random() * 40
          ;(particle as HTMLElement).style.left = `${x}%`
          ;(particle as HTMLElement).style.top = `${y}%`
          ;(particle as HTMLElement).style.animationDuration = `${speed}s`
        })
      }

      // Create dust particles
      for (let i = 0; i < 20; i++) {
        const particle = document.createElement("div")
        particle.className = "dust-particle"
        this.dustParticles.appendChild(particle)
      }

      moveDust()
      setInterval(moveDust, 10000)
    }

    // Radio interference effect
    if (this.radioEffect) {
      const createInterference = () => {
        if (Math.random() > 0.7) {
          this.radioEffect?.classList.add("active")
          setTimeout(
            () => {
              this.radioEffect?.classList.remove("active")
            },
            200 + Math.random() * 300,
          )
        }
      }
      setInterval(createInterference, 2000)
    }
  }

  private startTerminalAnimation() {
    if (!this.terminalLines || !this.terminalContainer) return

    const messages = [
      "INITIALIZING SURVIVAL ASSESSMENT PROTOCOL...",
      "SCANNING FOR AVAILABLE SCENARIOS...",
      "ESTABLISHING SECURE CONNECTION...",
      "LOADING DIFFICULTY PARAMETERS...",
      "CALIBRATING SURVIVAL METRICS...",
      "SYSTEM READY. AWAITING USER INPUT.",
    ]

    let currentLine = 0
    let currentChar = 0
    const isDeleting = false
    let lineElement: HTMLElement | null = null

    const typeWriter = () => {
      if (currentLine >= messages.length) {
        this.terminalContainer?.classList.add("completed")
        return
      }

      if (!lineElement) {
        lineElement = document.createElement("div")
        lineElement.className = "terminal-line"
        this.terminalLines?.appendChild(lineElement)
      }

      const currentMessage = messages[currentLine]

      if (!isDeleting && currentChar < currentMessage.length) {
        lineElement.textContent += currentMessage.charAt(currentChar)
        currentChar++

        // Random typing speed
        setTimeout(typeWriter, 30 + Math.random() * 50)
      } else if (!isDeleting && currentChar === currentMessage.length) {
        // Pause at the end of line
        setTimeout(() => {
          currentLine++
          currentChar = 0
          lineElement = null
          typeWriter()
        }, 500)
      }
    }

    // Start the animation
    setTimeout(typeWriter, 500)
  }

  private async populateScenarios() {
    if (!this.scenarioSelect) {
      console.error("HomeView: Scenario select element not found.")
      return
    }

    try {
      const scenarios: Scenario[] = await apiService.get<Scenario[]>("/scenarios")

      while (this.scenarioSelect.options.length > 1) {
        this.scenarioSelect.remove(1)
      }

      scenarios.map((scenario, index: number) => {
        const optionElement = document.createElement("option")
        optionElement.value = String(scenario.scenario_id)
        optionElement.textContent = scenario.scenario_name
        this.scenarioSelect?.appendChild(optionElement)
      })

      // Play sound effect when scenarios are loaded
      if (this.radioStaticSound && !this.radioStaticSound.paused) {
        const blip = new Audio("./assets/audio/data-loaded.mp3")
        blip.volume = 0.3
        blip.play()
      }
    } catch (error) {
      if (this.scenarioError) {
        this.scenarioError.textContent = "COMMUNICATION ERROR: Unable to retrieve scenario data. System compromised."
      }
    }
  }

  private async populateDifficulties() {
    if (!this.difficultyOptionsList) {
      return
    }

    try {
      const difficulties: Difficulty[] = await apiService.get<Difficulty[]>("/difficulties")

      while (this.difficultyOptionsList.options.length > 1) {
        this.difficultyOptionsList.remove(1)
      }

      difficulties.map((difficulty, index: number) => {
        const optionElement = document.createElement("option")
        optionElement.value = String(difficulty.question_difficulty_id)
        optionElement.textContent = difficulty.question_difficulty_name
        this.difficultyOptionsList?.appendChild(optionElement)
      })

      console.log("HomeView: Difficulties populated.")
    } catch (error) {
      console.error("HomeView: Failed to fetch or populate difficulties:", error)
      if (this.difficultyError) {
        this.difficultyError.textContent = "SYSTEM FAILURE: Difficulty parameters corrupted."
      }
    }
  }

  async hideAdminLinkButton() {
    if (this.addOptionsButton) {
      try {
        const isAdmin = await checkAdminRole()
        if (!isAdmin) {
          this.addOptionsButton.classList.add("hidden")
        } else {
          this.addOptionsButton.classList.remove("hidden")
        }
      } catch (error) {
        console.error("Error checking admin role:", error)
        this.addOptionsButton.classList.add("hidden")
      }
    } else {
      console.warn("Admin link not found.")
    }
  }

  private addEventListeners() {
    if (!this.form) {
      return
    }

    this.form.addEventListener("submit", (event) => this.handleSubmit(event))
    this.scenarioSelect?.addEventListener("change", () => {
      this.clearError(this.scenarioSelect, this.scenarioError)
      this.playSelectSound()
    })
    this.difficultyFieldset?.addEventListener("change", () => {
      this.clearError(this.difficultyFieldset, this.difficultyError)
      this.playSelectSound()
    })

    // Add hover effect sound for the start button
    this.startButton?.addEventListener("mouseenter", () => {
      const hoverSound = new Audio("./assets/audio/button-hover.mp3")
      hoverSound.volume = 0.2
      hoverSound.play()
    })
  }

  private playSelectSound() {
    const selectSound = new Audio("./assets/audio/select.mp3")
    selectSound.volume = 0.2
    selectSound.play()
  }

  private handleSubmit(event: SubmitEvent) {
    event.preventDefault()

    if (this.validateForm()) {
      console.log("Form validation successful.")
      const scenario = this.scenarioSelect?.value
      const selectedDifficultyInput = this.difficultyOptionsList?.value

      // Play alarm sound
      if (this.alarmSound) {
        this.alarmSound.play()
      }

      // Add visual confirmation
      this.shadowRootInstance.querySelector(".test-selection")?.classList.add("submitting")

      // Add a dramatic pause before navigating
      setTimeout(() => {
        if (scenario && selectedDifficultyInput) {
          const navigationPath = `/quiz?scenario=${encodeURIComponent(scenario)}&difficulty=${encodeURIComponent(selectedDifficultyInput)}`
          App.navigate(navigationPath)
        }
      }, 1500)
    } else {
      // Play error sound
      const errorSound = new Audio("./assets/audio/error.mp3")
      errorSound.volume = 0.3
      errorSound.play()

      // Add error shake animation to the form
      this.form?.classList.add("error-shake")
      setTimeout(() => {
        this.form?.classList.remove("error-shake")
      }, 500)
    }
  }

  private validateForm(): boolean {
    let isValid = true

    if (!this.scenarioSelect || this.scenarioSelect.value === "") {
      this.showError(
        this.scenarioSelect,
        this.scenarioError,
        "ERROR: Scenario selection required for survival assessment.",
      )
      isValid = false
    } else {
      this.clearError(this.scenarioSelect, this.scenarioError)
    }

    if (!this.difficultyOptionsList || this.difficultyOptionsList.value === "") {
      this.showError(
        this.difficultyOptionsList,
        this.difficultyError,
        "ERROR: Difficulty parameter required for protocol initialization.",
      )
      isValid = false
    } else {
      this.clearError(this.difficultyFieldset, this.difficultyError)
    }

    return isValid
  }

  private showError(inputElement: HTMLElement | null, errorElement: HTMLElement | null, message: string) {
    if (errorElement) {
      errorElement.textContent = message
      errorElement.classList.add("error-flash")
      setTimeout(() => {
        errorElement.classList.remove("error-flash")
      }, 1000)
    }
    inputElement?.classList.add("invalid")
    if (inputElement?.tagName === "FIELDSET") {
      inputElement.classList.add("invalid")
    } else if (inputElement) {
      inputElement.classList.add("invalid")
    }
  }

  private clearError(inputElement: HTMLElement | null, errorElement: HTMLElement | null) {
    if (errorElement) {
      errorElement.textContent = ""
    }
    inputElement?.classList.remove("invalid")
    if (inputElement?.tagName === "FIELDSET") {
      inputElement.classList.remove("invalid")
    } else if (inputElement) {
      inputElement.classList.remove("invalid")
    }
  }
}

customElements.define("home-view", HomeView)
