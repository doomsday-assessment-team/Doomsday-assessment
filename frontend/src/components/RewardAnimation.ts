export class RewardAnimation extends HTMLElement {
    private container: HTMLElement | null = null
    private animationTimeout: number | null = null

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.render()
    }

    connectedCallback() {
        this.bindElements()
    }

    disconnectedCallback() {
        if (this.animationTimeout !== null) {
            clearTimeout(this.animationTimeout)
        }
    }

    private render() {
        if (!this.shadowRoot) return

        this.shadowRoot.innerHTML = `
    <style>
      :host {
        display: block;
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1000;
        --animation-speed: 1;
        --font-scale: 1;
      }
      
      .reward-container {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s, visibility 0.3s;
      }
      
      .reward-container.active {
        opacity: 1;
        visibility: visible;
      }
      
      .reward-content {
        text-align: center;
        color: #d5c9a6;
        font-family: 'Rajdhani', sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.125em;
        transform: scale(0.5);
        transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      }
      
      .reward-container.active .reward-content {
        transform: scale(1);
      }
      
      .reward-title {
        font-size: calc(3rem * var(--font-scale));
        font-weight: bold;
        margin-bottom: 1.25em;
        text-shadow: 0 0 1.25em rgba(213, 201, 166, 0.8);
      }
      
      .reward-subtitle {
        font-size: calc(1.5rem * var(--font-scale));
        margin-bottom: 1.875em;
      }
      
      .reward-icon {
        font-size: calc(5rem * var(--font-scale));
        margin-bottom: 1.875em;
        animation: pulse 2s infinite alternate;
      }
      
      .reward-points {
        font-size: calc(2.25rem * var(--font-scale));
        color: #4eff4e;
        text-shadow: 0 0 0.9375em rgba(78, 255, 78, 0.8);
      }
      
      .confetti {
        position: absolute;
        width: 0.625em;
        height: 0.625em;
        background-color: #d5c9a6;
        opacity: 0.8;
      }
      
      @keyframes pulse {
        0% {
          transform: scale(1);
          text-shadow: 0 0 0.625em rgba(213, 201, 166, 0.5);
        }
        100% {
          transform: scale(1.1);
          text-shadow: 0 0 1.25em rgba(213, 201, 166, 0.8);
        }
      }
      
      .streak-animation {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        background-color: rgba(0, 0, 0, 0.5);
        transition: opacity 0.3s, visibility 0.3s;
      }
      
      .streak-animation.active {
        opacity: 1;
        visibility: visible;
      }
      
      .streak-text {
        font-size: calc(4.5rem * var(--font-scale));
        font-weight: bold;
        color: #ff7e7e;
        text-shadow: 0 0 1.875em rgba(255, 126, 126, 0.8);
        animation: streakPulse 0.5s infinite alternate;
      }
      
      @keyframes streakPulse {
        0% {
          transform: scale(1);
          text-shadow: 0 0 1.25em rgba(255, 126, 126, 0.5);
        }
        100% {
          transform: scale(1.1);
          text-shadow: 0 0 2.5em rgba(255, 126, 126, 0.8);
        }
      }
      
      .perfect-answer {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0);
        font-size: calc(3rem * var(--font-scale));
        font-weight: bold;
        color: #4eff4e;
        text-shadow: 0 0 1.25em rgba(78, 255, 78, 0.8);
        text-transform: uppercase;
        letter-spacing: 0.125em;
        animation: perfectAnswer 2s forwards;
      }
      
      @keyframes perfectAnswer {
        0% {
          transform: translate(-50%, -50%) scale(0);
          opacity: 0;
        }
        20% {
          transform: translate(-50%, -50%) scale(1.2);
          opacity: 1;
        }
        80% {
          transform: translate(-50%, -50%) scale(1);
          opacity: 1;
        }
        100% {
          transform: translate(-50%, -50%) scale(1.5);
          opacity: 0;
        }
      }
      
      @media (max-width: 48em) {
        :host {
          --font-scale: 0.75;
        }
      }
      
      @media (max-width: 30em) {
        :host {
          --font-scale: 0.6;
        }
      }
      
      @media (prefers-reduced-motion: reduce) {
        :host {
          --animation-speed: 0.1;
        }
        
        .reward-content, 
        .streak-text, 
        .perfect-answer,
        .confetti {
          animation-duration: calc(0.01ms * var(--animation-speed)) !important;
          animation-iteration-count: 1 !important;
          transition-duration: calc(0.01ms * var(--animation-speed)) !important;
        }
      }
    </style>
    
    <section class="reward-container" id="reward-container">
      <article class="reward-content">
        <figure class="reward-icon">🏆</figure>
        <h2 class="reward-title">Achievement Unlocked!</h2>
        <h3 class="reward-subtitle">New Milestone Reached</h3>
        <output class="reward-points">+500 POINTS</output>
      </article>
    </section>
    
    <section class="streak-animation" id="streak-animation">
      <output class="streak-text">STREAK x5!</output>
    </section>
  `
    }

    private bindElements() {
        if (!this.shadowRoot) return

        this.container = this.shadowRoot.getElementById("reward-container")
    }

    public showReward(title: string, subtitle: string, points: number, icon = "🏆") {
        if (!this.shadowRoot || !this.container) return

        // Update content
        const iconElement = this.container.querySelector(".reward-icon")
        const titleElement = this.container.querySelector(".reward-title")
        const subtitleElement = this.container.querySelector(".reward-subtitle")
        const pointsElement = this.container.querySelector(".reward-points")

        if (iconElement) iconElement.textContent = icon
        if (titleElement) titleElement.textContent = title
        if (subtitleElement) subtitleElement.textContent = subtitle
        if (pointsElement) pointsElement.textContent = `+${points} POINTS`

        // Show animation
        this.container.classList.add("active")

        // Create confetti
        this.createConfetti()

        // Hide after delay
        if (this.animationTimeout !== null) {
            clearTimeout(this.animationTimeout)
        }

        this.animationTimeout = window.setTimeout(() => {
            this.container?.classList.remove("active")
        }, 3000)
    }

    private createConfetti() {
        if (!this.shadowRoot) return

        // Remove any existing confetti
        const existingConfetti = this.shadowRoot.querySelectorAll(".confetti")
        existingConfetti.forEach((c) => c.remove())

        // Create new confetti
        const colors = ["#d5c9a6", "#a67c52", "#4eff4e", "#ff7e7e", "#4a4c3e"]

        // Get font scale for responsive sizing
        const style = getComputedStyle(this);
        const fontScale = Number.parseFloat(style.getPropertyValue("--font-scale") || "1");

        // Adjust confetti count based on screen size
        const confettiCount = Math.min(100, Math.floor(window.innerWidth / 10));

        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement("mark")
            confetti.className = "confetti"

            // Random properties scaled by font size
            const size = (0.3125 + Math.random() * 0.625) * fontScale + "em";
            const color = colors[Math.floor(Math.random() * colors.length)]

            // Set styles
            confetti.style.width = size;
            confetti.style.height = size;
            confetti.style.backgroundColor = color;
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = `${Math.random() * 100}%`;
            confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "0";

            // Add animation
            confetti.style.animation = `
        fall ${Math.random() * 3 + 2}s linear forwards,
        sway ${Math.random() * 2 + 1}s ease-in-out infinite alternate
      `;

            // Add keyframes for this specific confetti
            const keyframes = document.createElement("style")
            keyframes.textContent = `
        @keyframes fall {
          to {
            transform: translateY(${window.innerHeight}px) rotate(${Math.random() * 360}deg);
            opacity: 0;
          }
        }
        
        @keyframes sway {
          from {
            transform: translateX(0) rotate(0);
          }
          to {
            transform: translateX(${Math.random() * 100 - 50}px) rotate(${Math.random() * 360}deg);
          }
        }
      `;

            this.shadowRoot.appendChild(keyframes);
            this.shadowRoot.appendChild(confetti);

            // Remove after animation
            setTimeout(() => {
                confetti.remove();
                keyframes.remove();
            }, 5000);
        }
    }

    public showStreak(streak: number) {
        if (!this.shadowRoot) return

        const streakAnimation = this.shadowRoot.getElementById("streak-animation")
        if (!streakAnimation) return

        const streakText = streakAnimation.querySelector(".streak-text")
        if (streakText) {
            streakText.textContent = `STREAK x${streak}!`
        }

        // Show animation
        streakAnimation.classList.add("active")

        // Hide after delay
        setTimeout(() => {
            streakAnimation.classList.remove("active")
        }, 1500)
    }

    public showPerfectAnswer() {
        if (!this.shadowRoot) return

        // Create element
        const perfect = document.createElement("output")
        perfect.className = "perfect-answer"
        perfect.textContent = "PERFECT!"
        perfect.setAttribute("aria-live", "assertive")

        this.shadowRoot.appendChild(perfect)

        // Remove after animation
        setTimeout(() => {
            perfect.remove()
        }, 2000)
    }
}

customElements.define("reward-animation", RewardAnimation)
