import { apiService, App } from "../main.js"
import type { Difficulty, Scenario } from "../types/global-types.js"
import { checkAdminRole, checkManagerRole } from "../utils/check-admin.js"
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
  private addOptionsButton: HTMLUListElement | null = null
  private terminalLines: HTMLElement | null = null
  private terminalContainer: HTMLElement | null = null
  private startButton: HTMLButtonElement | null = null
  private radioEffect: HTMLElement | null = null
  private dustParticles: HTMLElement | null = null

  private scenarioContainer: HTMLElement | null = null
  private difficultyContainer: HTMLElement | null = null
  private difficultyDescriptions: HTMLElement | null = null
  private selectedScenarioCard: HTMLElement | null = null
  private selectedDifficultyLevel: HTMLElement | null = null

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
      this.startTerminalAnimation()
            this.initializeVisualEffects()
      await this.setupUserAvatar();
      await this.setupUserManagementLink();
    //   this.initializeAudio()

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
    this.startButton = this.shadowRootInstance.querySelector("#start-button")
    this.terminalLines = this.shadowRootInstance.querySelector(".terminal-lines")
    this.terminalContainer = this.shadowRootInstance.querySelector(".terminal-container")
    this.radioEffect = this.shadowRootInstance.querySelector(".radio-effect")
    this.dustParticles = this.shadowRootInstance.querySelector(".dust-particles")
this.addOptionsButton = this.shadowRootInstance?.querySelector(
      "#admin-questions-link-li"
    );
    this.userManagementLink = this.shadowRootInstance?.querySelector(
      "#user-management-link-li"
    );
this.userAvatar = this.shadowRootInstance?.querySelector(".user-avatar");
    this.avatarInitials =
      this.shadowRootInstance?.querySelector(".avatar-initials");
    // Bind new card UI elements
    this.scenarioContainer = this.shadowRootInstance.querySelector("#scenario-container")
    this.difficultyContainer = this.shadowRootInstance.querySelector("#difficulty-container")
    this.difficultyDescriptions = this.shadowRootInstance.querySelector("#difficulty-descriptions")

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

  private async setupUserAvatar() {
      if (!this.userAvatar || !this.avatarInitials) {
        console.error("User avatar elements not found");
        return;
      }

      try {
        // Fetch the current user
        const userData: UserResponse = await apiService.get("/users/me");
        const user = userData.user;

        if (!user) {
          console.error("Failed to fetch user data");
          return;
        }

        // Set the avatar initials
        const initials = `${user.given_name.charAt(0)}${user.family_name
          .charAt(0)
          .toUpperCase()}`;
        this.avatarInitials.textContent = initials;

        // Add click event to navigate to user profile
        this.userAvatar.addEventListener("click", () => {
          App.navigate("/user-profile");
        });
      } catch (error) {
        console.error("Error setting up user avatar:", error);
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
      return
    }

    try {
      if (this.scenarioContainer) {
        this.scenarioContainer.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div></div>'
      }

      const scenarios: Scenario[] = await apiService.get<Scenario[]>("/scenarios")

      while (this.scenarioSelect.options.length > 1) {
        this.scenarioSelect.remove(1)
      }

      // Clear the scenario container
      if (this.scenarioContainer) {
        this.scenarioContainer.innerHTML = ""
      }

      scenarios.map((scenario, index: number) => {
        // Add option to the hidden select element
        const optionElement = document.createElement("option")
        optionElement.value = String(scenario.scenario_id)
        optionElement.textContent = scenario.scenario_name
        this.scenarioSelect?.appendChild(optionElement)

        // Create scenario card
        this.createScenarioCard(scenario)
      })

    } catch (error) {
      if (this.scenarioError) {
        this.scenarioError.textContent = "COMMUNICATION ERROR: Unable to retrieve scenario data. System compromised."
      }

      // Show error in the scenario container
      if (this.scenarioContainer) {
        this.scenarioContainer.innerHTML = '<p class="error-message">Failed to load scenarios. Please try again.</p>'
      }
    }
  }

  private createScenarioCard(scenario: Scenario) {
    if (!this.scenarioContainer) return

    const scenarioId = scenario.scenario_id
    const scenarioName = scenario.scenario_name
    const icon = this.getScenarioIcon(scenarioName)

    const card = document.createElement("label")
    card.className = "scenario-card"
    card.htmlFor = `scenario-card-${scenarioId}`

    card.innerHTML = `
      <input type="radio" id="scenario-card-${scenarioId}" name="scenario-card" value="${scenarioId}" required>
      <span class="scenario-icon">${icon}</span>
      <span class="scenario-name">${scenarioName}</span>
    `

    this.scenarioContainer.appendChild(card)

    // Add event listener
    card.addEventListener("click", () => {
      this.scenarioContainer?.querySelectorAll(".scenario-card").forEach((c) => c.classList.remove("selected"))
      card.classList.add("selected")
      this.selectedScenarioCard = card

      if (this.scenarioSelect) {
        this.scenarioSelect.value = String(scenarioId)
        this.clearError(this.scenarioSelect, this.scenarioError)
      }

      // Update button state
      this.updateStartButtonState()
    })
  }

  private getScenarioIcon(scenarioName: string): string {
    const scenarioIcons: Record<string, string> = {
      nuclear: "☢️",
      fallout: "☢️",
      pandemic: "🦠",
      virus: "🦠",
      zombie: "🧟",
      undead: "🧟",
      climate: "🌊",
      flood: "🌊",
      asteroid: "☄️",
      meteor: "☄️",
      alien: "👽",
      invasion: "👽",
      ai: "🤖",
      robot: "🤖",
      uprising: "🤖",
      volcanic: "🌋",
      volcano: "🌋",
      economic: "💰",
      collapse: "💰",
      war: "💥",
      conflict: "💥",
      default: "⚠️",
    }

    const name = scenarioName.toLowerCase()

    for (const [key, icon] of Object.entries(scenarioIcons)) {
      if (name.includes(key)) {
        return icon
      }
    }

    return scenarioIcons.default
  }

  private async populateDifficulties() {
    if (!this.difficultyOptionsList) {
      return
    }

    try {
      // Show loading state in the difficulty container
      if (this.difficultyContainer) {
        this.difficultyContainer.innerHTML = '<div class="loading-container"><div class="loading-spinner"></div></div>'
      }

      // Clear difficulty descriptions
      if (this.difficultyDescriptions) {
        this.difficultyDescriptions.innerHTML = ""
      }

      const difficulties: Difficulty[] = await apiService.get<Difficulty[]>("/difficulties"
      )

      while (this.difficultyOptionsList.options.length > 1) {
        this.difficultyOptionsList.remove(1)
      }

      // Clear the difficulty container
      if (this.difficultyContainer) {
        this.difficultyContainer.innerHTML = ""
      }

      difficulties.map((difficulty, index: number) => {
        // Add option to the hidden select element
        const optionElement = document.createElement("option")
        optionElement.value = String(difficulty.question_difficulty_id)
        optionElement.textContent = difficulty.question_difficulty_name
        this.difficultyOptionsList?.appendChild(optionElement)

        // Create difficulty level button
        this.createDifficultyLevel(difficulty)
      })

    } catch (error) {
      if (this.difficultyError) {
        this.difficultyError.textContent = "SYSTEM FAILURE: Difficulty parameters corrupted."
      }

      // Show error in the difficulty container
      if (this.difficultyContainer) {
        this.difficultyContainer.innerHTML =
          '<p class="error-message">Failed to load difficulty levels. Please try again.</p>'
      }
    }
  }

  private createDifficultyLevel(difficulty: Difficulty) {
    if (!this.difficultyContainer || !this.difficultyDescriptions) return

    const difficultyId = difficulty.question_difficulty_id
    const difficultyName = difficulty.question_difficulty_name

    const level = document.createElement("label")
    level.className = "difficulty-level"
    level.htmlFor = `difficulty-level-${difficultyId}`

    level.innerHTML = `
      <input type="radio" id="difficulty-level-${difficultyId}" name="difficulty-level" value="${difficultyId}" required>
      <span class="difficulty-name">${difficultyName}</span>
    `

    this.difficultyContainer.appendChild(level)

    // Create description element
    const description = document.createElement("div")
    description.id = `difficulty-description-${difficultyId}`
    description.className = "difficulty-description"

    // Generate a description based on the difficulty name
    const descriptionText = this.generateDifficultyDescription(difficultyName)
    description.textContent = descriptionText

    this.difficultyDescriptions.appendChild(description)

    level.addEventListener("click", () => {
      this.difficultyContainer?.querySelectorAll(".difficulty-level").forEach((l) => l.classList.remove("selected"))
      level.classList.add("selected")
      this.selectedDifficultyLevel = level

      if (this.difficultyOptionsList) {
        this.difficultyOptionsList.value = String(difficultyId)
        this.clearError(this.difficultyFieldset, this.difficultyError)
      }

      // Show the corresponding description
      this.difficultyDescriptions
        ?.querySelectorAll(".difficulty-description")
        .forEach((desc) => desc.classList.remove("active"))
      const descId = `difficulty-description-${difficultyId}`
      this.shadowRootInstance.getElementById(descId)?.classList.add("active")

      // Update button state
      this.updateStartButtonState()
    })
  }

  private generateDifficultyDescription(difficultyName: string): string {
    const name = difficultyName.toLowerCase()

    if (name.includes("novice") || name.includes("easy") || name.includes("beginner")) {
      return "Basic survival challenges. Recommended for beginners learning post-apocalyptic survival skills."
    } else if (name.includes("survivor") || name.includes("medium") || name.includes("moderate")) {
      return "Moderate challenges requiring strategic thinking and resource management."
    } else if (name.includes("veteran") || name.includes("hard") || name.includes("advanced")) {
      return "Advanced scenarios with limited resources and complex moral dilemmas."
    } else if (name.includes("legend") || name.includes("expert") || name.includes("impossible")) {
      return "Ultimate survival test. Only the most prepared and ruthless will survive."
    } else {
      return `${difficultyName} difficulty level will test your survival skills appropriately.`
    }
  }

  private updateStartButtonState() {
    if (!this.startButton) return

    const scenarioSelected = this.scenarioSelect?.value !== ""
    const difficultySelected = this.difficultyOptionsList?.value !== ""

    this.startButton.disabled = !(scenarioSelected && difficultySelected)
  }

  async hideAdminLinkButton() {
    if (this.addOptionsButton) {
      try {
        const isAdmin = await checkAdminRole()
        if (isAdmin) {
          this.addOptionsButton.classList.remove("hidden")
        } else {
          this.addOptionsButton.classList.add("hidden")
        }
      } catch (error) {
        this.addOptionsButton.classList.add("hidden")
      }
    } else {
    //   console.warn("Admin link not found.")
    }
  }private async setupUserManagementLink() {
    if (this.userManagementLink) {
      try {
        // Use the checkManagerRole function directly
        const hasManagerRole = await checkManagerRole();

        if (hasManagerRole) {
          this.userManagementLink.classList.remove("hidden");
        } else {
          this.userManagementLink.classList.add("hidden");
        }
      } catch (error) {
        console.error("Error checking manager role:", error);
        this.userManagementLink.classList.add("hidden");
      }
    } else {
      console.warn("User management link not found.");
    }
  }

  private addEventListeners() {
    if (!this.form) {
      return
    }


    this.form.addEventListener("submit", (event) => this.handleSubmit(event))

    this.scenarioSelect?.addEventListener("change", () => {
      this.clearError(this.scenarioSelect, this.scenarioError)
      this.updateStartButtonState()
    })

    this.difficultyOptionsList?.addEventListener("change", () => {
      this.clearError(this.difficultyFieldset, this.difficultyError)
      this.updateStartButtonState()
    })
  }

  private handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    if (this.validateForm()) {
      const scenario = this.scenarioSelect?.value
      const selectedDifficultyInput = this.difficultyOptionsList?.value

      this.shadowRootInstance.querySelector(".test-selection")?.classList.add("submitting")

      setTimeout(() => {
        if (scenario && selectedDifficultyInput) {
          const navigationPath = `/quiz?scenario=${encodeURIComponent(scenario)}&difficulty=${encodeURIComponent(selectedDifficultyInput)}`
          App.navigate(navigationPath)
        }
      }, 1500)
    } else {
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

      this.scenarioContainer?.classList.add("error-shake")
      setTimeout(() => {
        this.scenarioContainer?.classList.remove("error-shake")
      }, 500)
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

      this.difficultyContainer?.classList.add("error-shake")
      setTimeout(() => {
        this.difficultyContainer?.classList.remove("error-shake")
      }, 500)
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
