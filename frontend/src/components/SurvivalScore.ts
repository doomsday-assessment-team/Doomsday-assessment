export class SurvivalScore extends HTMLElement {
    private scoreValue = 0
    private streakCount = 0
    private maxStreak = 0
    private multiplier = 1
    private scoreElement: HTMLElement | null = null
    private streakElement: HTMLElement | null = null
    private multiplierElement: HTMLElement | null = null
    private rankElement: HTMLElement | null = null
    private badgeElement: HTMLElement | null = null
    private levelProgress: HTMLElement | null = null
    private levelBar: HTMLElement | null = null
    private currentRank = "SURVIVOR RECRUIT"
    private badges: string[] = []
    private levelThreshold = 100
    private currentLevel = 1

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.render()
        this.bindElements()
    }

    connectedCallback() {
        // Load saved data from localStorage if available
        this.loadSavedData()
        this.updateDisplay()
    }

    private loadSavedData() {
        try {
            const savedData = localStorage.getItem("survivalScore")
            if (savedData) {
                const data = JSON.parse(savedData)
                this.scoreValue = data.score || 0
                this.maxStreak = data.maxStreak || 0
                this.badges = data.badges || []
                this.currentLevel = data.level || 1
                this.currentRank = data.rank || "SURVIVOR RECRUIT"
            }
        } catch (e) {
            console.warn("Could not load saved survival data")
        }
    }

    private saveData() {
        try {
            const dataToSave = {
                score: this.scoreValue,
                maxStreak: this.maxStreak,
                badges: this.badges,
                level: this.currentLevel,
                rank: this.currentRank,
            }
            localStorage.setItem("survivalScore", JSON.stringify(dataToSave))
        } catch (e) {
            console.warn("Could not save survival data")
        }
    }

    private render() {
        if (!this.shadowRoot) return

        this.shadowRoot.innerHTML = `
    <style>
      :host {
        display: block;
        font-family: 'Rajdhani', sans-serif;
        color: #d5c9a6;
      }
      
      .survival-score-container {
        background-color: rgba(26, 26, 20, 0.8);
        border-radius: 0.625rem;
        padding: 1em;
        margin-bottom: 1.25em;
        border: 0.0625em solid #4a4c3e;
        box-shadow: 0 0 1em rgba(0, 0, 0, 0.3);
        position: relative;
        overflow: hidden;
      }
      
      .survival-score-container::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 0.1875em;
        background: linear-gradient(90deg, #a67c52, transparent);
      }
      
      .score-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(10rem, 1fr));
        gap: 0.625em;
      }
      
      .score-item {
        text-align: center;
        padding: 0.5em;
        background-color: rgba(0, 0, 0, 0.2);
        border-radius: 0.3125em;
        position: relative;
        overflow: hidden;
      }
      
      .score-item::after {
        content: "";
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 0.125em;
        background: linear-gradient(90deg, transparent, #a67c52, transparent);
      }
      
      .score-label {
        font-size: 0.75rem;
        text-transform: uppercase;
        letter-spacing: 0.0625em;
        opacity: 0.7;
        margin-bottom: 0.3125em;
      }
      
      .score-value {
        font-size: 1.125rem;
        font-weight: bold;
        letter-spacing: 0.0625em;
      }
      
      .multiplier {
        color: #4eff4e;
        animation: pulse 2s infinite alternate;
      }
      
      .streak {
        color: #ff7e7e;
      }
      
      .rank-container {
        grid-column: 1 / -1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        margin-top: 0.625em;
        padding: 0.625em;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 0.3125em;
        border: 0.0625em solid #4a4c3e;
      }
      
      .rank-title {
        font-size: 0.875rem;
        text-transform: uppercase;
        letter-spacing: 0.0625em;
      }
      
      .rank-value {
        font-size: 1rem;
        font-weight: bold;
        color: #4eff4e;
        text-shadow: 0 0 0.3125em rgba(78, 255, 78, 0.5);
      }
      
      .badge-container {
        grid-column: 1 / -1;
        display: flex;
        flex-wrap: wrap;
        gap: 0.3125em;
        margin-top: 0.625em;
        justify-content: center;
      }
      
      .badge {
        width: 1.875em;
        height: 1.875em;
        background-color: rgba(166, 124, 82, 0.3);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 0.875rem;
        border: 0.0625em solid #a67c52;
        position: relative;
      }
      
      .badge.earned {
        background-color: rgba(166, 124, 82, 0.8);
        box-shadow: 0 0 0.625em rgba(166, 124, 82, 0.5);
      }
      
      .badge-tooltip {
        position: absolute;
        bottom: 100%;
        left: 50%;
        transform: translateX(-50%);
        background-color: rgba(26, 26, 20, 0.9);
        padding: 0.3125em 0.625em;
        border-radius: 0.3125em;
        font-size: 0.75rem;
        white-space: nowrap;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s, visibility 0.3s;
        z-index: 10;
        border: 0.0625em solid #4a4c3e;
      }
      
      .badge:hover .badge-tooltip {
        opacity: 1;
        visibility: visible;
      }
      
      .level-progress {
        grid-column: 1 / -1;
        margin-top: 0.625em;
        height: 0.5em;
        background-color: rgba(0, 0, 0, 0.3);
        border-radius: 0.25em;
        overflow: hidden;
        position: relative;
      }
      
      .level-bar {
        height: 100%;
        background: linear-gradient(90deg, #4eff4e, #a67c52);
        width: 0%;
        transition: width 0.5s ease;
        position: relative;
      }
      
      .level-bar::after {
        content: "";
        position: absolute;
        top: 0;
        right: 0;
        width: 0.3125em;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.5);
        animation: progressGlow 2s infinite;
      }
      
      .level-label {
        grid-column: 1 / -1;
        display: flex;
        justify-content: space-between;
        font-size: 0.75rem;
        margin-top: 0.3125em;
      }
      
      @keyframes pulse {
        0% {
          text-shadow: 0 0 0.3125em rgba(78, 255, 78, 0.5);
        }
        100% {
          text-shadow: 0 0 0.9375em rgba(78, 255, 78, 0.8);
        }
      }
      
      @keyframes progressGlow {
        0%, 100% {
          opacity: 0.5;
        }
        50% {
          opacity: 1;
        }
      }
      
      .score-change {
        position: absolute;
        font-weight: bold;
        animation: floatUp 1.5s forwards;
        z-index: 5;
      }
      
      .score-change.positive {
        color: #4eff4e;
      }
      
      .score-change.negative {
        color: #ff7e7e;
      }
      
      @keyframes floatUp {
        0% {
          opacity: 1;
          transform: translateY(0);
        }
        100% {
          opacity: 0;
          transform: translateY(-3.125em);
        }
      }
      
      .level-up {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(0, 0, 0, 0.7);
        color: #4eff4e;
        font-size: 1.5rem;
        font-weight: bold;
        text-transform: uppercase;
        letter-spacing: 0.125em;
        animation: levelUpAnim 3s forwards;
        z-index: 10;
        text-shadow: 0 0 0.625em rgba(78, 255, 78, 0.8);
      }
      
      @keyframes levelUpAnim {
        0% {
          opacity: 0;
          transform: scale(0.5);
        }
        10%, 90% {
          opacity: 1;
          transform: scale(1);
        }
        100% {
          opacity: 0;
          transform: scale(1.2);
        }
      }
    </style>
    
    <section class="survival-score-container">
      <article class="score-grid">
        <section class="score-item">
          <h3 class="score-label">SURVIVAL SCORE</h3>
          <output class="score-value" id="score-value">0</output>
        </section>
        <section class="score-item">
          <h3 class="score-label">ANSWER STREAK</h3>
          <output class="score-value streak" id="streak-value">0</output>
        </section>
        <section class="score-item">
          <h3 class="score-label">SCORE MULTIPLIER</h3>
          <output class="score-value multiplier" id="multiplier-value">x1</output>
        </section>
        <section class="score-item">
          <h3 class="score-label">HIGHEST STREAK</h3>
          <output class="score-value" id="max-streak-value">0</output>
        </section>
        <header class="rank-container">
          <h2 class="rank-title">SURVIVAL RANK:</h2>
          <output class="rank-value" id="rank-value">SURVIVOR RECRUIT</output>
        </header>
        <section class="level-progress" id="level-progress">
          <meter class="level-bar" id="level-bar"></meter>
        </section>
        <footer class="level-label">
          <span>LEVEL ${this.currentLevel}</span>
          <span>LEVEL ${this.currentLevel + 1}</span>
        </footer>
        <aside class="badge-container" id="badge-container">
          <!-- Badges will be added here -->
        </aside>
      </article>
    </section>
  `

        this.renderBadges()
    }

    private bindElements() {
        if (!this.shadowRoot) return

        this.scoreElement = this.shadowRoot.getElementById("score-value")
        this.streakElement = this.shadowRoot.getElementById("streak-value")
        this.multiplierElement = this.shadowRoot.getElementById("multiplier-value")
        this.rankElement = this.shadowRoot.getElementById("rank-value")
        this.badgeElement = this.shadowRoot.getElementById("badge-container")
        this.levelProgress = this.shadowRoot.getElementById("level-progress")
        this.levelBar = this.shadowRoot.getElementById("level-bar")
    }

    private renderBadges() {
        if (!this.badgeElement) return

        // Clear existing badges
        this.badgeElement.innerHTML = ""

        // Define available badges
        const availableBadges = [
            { id: "first-blood", icon: "🔥", name: "First Blood", description: "Complete your first question" },
            { id: "streak-3", icon: "⚡", name: "On Fire", description: "Get a streak of 3 correct answers" },
            { id: "streak-5", icon: "🌟", name: "Unstoppable", description: "Get a streak of 5 correct answers" },
            { id: "score-100", icon: "💯", name: "Century", description: "Reach 100 survival points" },
            { id: "score-500", icon: "🏆", name: "Survivor", description: "Reach 500 survival points" },
            { id: "level-5", icon: "🔶", name: "Veteran", description: "Reach level 5" },
        ]

        // Render each badge
        availableBadges.forEach((badge) => {
            const badgeElement = document.createElement("figure")
            badgeElement.className = `badge ${this.badges.includes(badge.id) ? "earned" : ""}`
            badgeElement.textContent = badge.icon

            const tooltip = document.createElement("figcaption")
            tooltip.className = "badge-tooltip"
            tooltip.textContent = `${badge.name}: ${badge.description}`

            badgeElement.appendChild(tooltip)
            this.badgeElement?.appendChild(badgeElement)
        })
    }

    public addPoints(points: number, isCorrect = true) {
        // Create floating score change element
        this.showScoreChange(points, isCorrect)

        // Update streak
        if (isCorrect) {
            this.streakCount++
            if (this.streakCount > this.maxStreak) {
                this.maxStreak = this.streakCount
            }

            // Update multiplier based on streak
            if (this.streakCount >= 5) {
                this.multiplier = 3
            } else if (this.streakCount >= 3) {
                this.multiplier = 2
            } else {
                this.multiplier = 1
            }

            // Apply multiplier to points
            const adjustedPoints = points * this.multiplier
            this.scoreValue += adjustedPoints

            // Check for badges
            this.checkForBadges()

            // Check for level up
            this.checkForLevelUp()

            // Check for rank change
            this.updateRank()
        } else {
            // Reset streak on wrong answer
            this.streakCount = 0
            this.multiplier = 1

            // Still add some points for attempting
            this.scoreValue += points
        }

        // Update the display
        this.updateDisplay()

        // Save data
        this.saveData()
    }

    private showScoreChange(points: number, isPositive: boolean) {
        if (!this.shadowRoot || !this.scoreElement) return

        const scoreChange = document.createElement("mark")
        scoreChange.className = `score-change ${isPositive ? "positive" : "negative"}`
        scoreChange.textContent = `${isPositive ? "+" : ""}${points * this.multiplier}`

        // Position near the score element
        const rect = this.scoreElement.getBoundingClientRect()
        scoreChange.style.left = `${rect.left + rect.width / 2}px`
        scoreChange.style.top = `${rect.top}px`

        this.shadowRoot.querySelector(".survival-score-container")?.appendChild(scoreChange)

        // Remove after animation completes
        setTimeout(() => {
            scoreChange.remove()
        }, 1500)
    }

    private checkForBadges() {
        // First blood badge
        if (!this.badges.includes("first-blood")) {
            this.awardBadge("first-blood")
        }

        // Streak badges
        if (this.streakCount >= 3 && !this.badges.includes("streak-3")) {
            this.awardBadge("streak-3")
        }

        if (this.streakCount >= 5 && !this.badges.includes("streak-5")) {
            this.awardBadge("streak-5")
        }

        // Score badges
        if (this.scoreValue >= 100 && !this.badges.includes("score-100")) {
            this.awardBadge("score-100")
        }

        if (this.scoreValue >= 500 && !this.badges.includes("score-500")) {
            this.awardBadge("score-500")
        }

        // Level badges
        if (this.currentLevel >= 5 && !this.badges.includes("level-5")) {
            this.awardBadge("level-5")
        }
    }

    private awardBadge(badgeId: string) {
        this.badges.push(badgeId)
        this.renderBadges()

        // Show badge notification
        this.showBadgeNotification(badgeId)
    }

    private showBadgeNotification(badgeId: string) {
        // This would show a notification that a new badge was earned
        // For now, we'll just console log it
        console.log(`New badge earned: ${badgeId}`)

        // In a real implementation, you'd show a visual notification
    }

    private checkForLevelUp() {
        const pointsForNextLevel = this.currentLevel * this.levelThreshold

        if (this.scoreValue >= pointsForNextLevel) {
            this.currentLevel++
            this.showLevelUp()

            // Check for level-based badges
            this.checkForBadges()
        }
    }

    private showLevelUp() {
        if (!this.shadowRoot) return

        const levelUpElement = document.createElement("output")
        levelUpElement.className = "level-up"
        levelUpElement.textContent = `LEVEL UP! ${this.currentLevel}`

        this.shadowRoot.querySelector(".survival-score-container")?.appendChild(levelUpElement)

        // Remove after animation completes
        setTimeout(() => {
            levelUpElement.remove()
        }, 3000)
    }

    private updateRank() {
        // Update rank based on level and score
        const newRank = this.calculateRank()

        if (newRank !== this.currentRank) {
            this.currentRank = newRank
            // Could show a rank up notification here
        }
    }

    private calculateRank() {
        if (this.currentLevel >= 10) return "WASTELAND LEGEND"
        if (this.currentLevel >= 8) return "APOCALYPSE MASTER"
        if (this.currentLevel >= 6) return "ELITE SURVIVOR"
        if (this.currentLevel >= 4) return "VETERAN SCAVENGER"
        if (this.currentLevel >= 2) return "SEASONED SURVIVOR"
        return "SURVIVOR RECRUIT"
    }

    private updateDisplay() {
        if (!this.scoreElement || !this.streakElement || !this.multiplierElement || !this.rankElement || !this.levelBar)
            return

        // Update text values
        this.scoreElement.textContent = this.scoreValue.toString()
        this.streakElement.textContent = this.streakCount.toString()
        this.multiplierElement.textContent = `x${this.multiplier}`
        this.rankElement.textContent = this.currentRank

        // Update max streak
        const maxStreakElement = this.shadowRoot?.getElementById("max-streak-value")
        if (maxStreakElement) {
            maxStreakElement.textContent = this.maxStreak.toString()
        }

        // Update level progress bar
        const pointsForNextLevel = this.currentLevel * this.levelThreshold
        const pointsFromLastLevel = (this.currentLevel - 1) * this.levelThreshold
        const progress = ((this.scoreValue - pointsFromLastLevel) / (pointsForNextLevel - pointsFromLastLevel)) * 100
        this.levelBar.style.width = `${Math.min(100, progress)}%`

        // Update level labels
        const levelLabels = this.shadowRoot?.querySelector(".level-label")
        if (levelLabels) {
            levelLabels.innerHTML = `
      <span>LEVEL ${this.currentLevel}</span>
      <span>LEVEL ${this.currentLevel + 1}</span>
    `
        }
    }

    public resetStreak() {
        this.streakCount = 0
        this.multiplier = 1
        this.updateDisplay()
    }

    public getScore() {
        return this.scoreValue
    }

    public getLevel() {
        return this.currentLevel
    }

    public getRank() {
        return this.currentRank
    }
}

customElements.define("survival-score", SurvivalScore)
