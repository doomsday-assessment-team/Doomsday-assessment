export class DynamicBackground extends HTMLElement {
    private canvas: HTMLCanvasElement | null = null
    private ctx: CanvasRenderingContext2D | null = null
    private particles: Particle[] = []
    private animationFrame: number | null = null
    private theme: "default" | "danger" | "success" = "default"
    private intensity = 0.5
    private lastTime = 0
    private backgroundImage: HTMLImageElement | null = null
    private backgroundLoaded = false

    constructor() {
        super()
        this.attachShadow({ mode: "open" })
        this.render()
    }

    connectedCallback() {
        this.setupCanvas()
        this.createParticles()
        this.loadBackgroundImage()
        this.startAnimation()

        // Listen for resize events
        window.addEventListener("resize", this.handleResize.bind(this))
    }

    disconnectedCallback() {
        if (this.animationFrame !== null) {
            cancelAnimationFrame(this.animationFrame)
        }
        window.removeEventListener("resize", this.handleResize.bind(this))
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
        z-index: -1;
        pointer-events: none;
      }
      
      canvas {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
      }
    </style>
    <canvas></canvas>
  `
    }

    private setupCanvas() {
        this.canvas = this.shadowRoot?.querySelector("canvas") || null
        if (!this.canvas) return

        this.ctx = this.canvas.getContext("2d")
        if (!this.ctx) return

        // Set canvas size to window size
        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight
    }

    private handleResize() {
        if (!this.canvas) return

        this.canvas.width = window.innerWidth
        this.canvas.height = window.innerHeight

        // Recreate particles for new dimensions
        this.createParticles()
    }

    private loadBackgroundImage() {
        this.backgroundImage = new Image()
        this.backgroundImage.crossOrigin = "anonymous"
        this.backgroundImage.src =
            "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=1600&auto=format&fit=crop"

        this.backgroundImage.onload = () => {
            this.backgroundLoaded = true
        }

        this.backgroundImage.onerror = () => {
            console.warn("Failed to load background image")
            this.backgroundLoaded = false
        }
    }

    private createParticles() {
        if (!this.canvas) return

        this.particles = []
        const particleCount = Math.floor((this.canvas.width * this.canvas.height) / 10000)

        for (let i = 0; i < particleCount; i++) {
            this.particles.push(
                new Particle(
                    Math.random() * this.canvas.width,
                    Math.random() * this.canvas.height,
                    Math.random() * 2 + 1,
                    this.getParticleColor(),
                ),
            )
        }
    }

    private getParticleColor(): string {
        switch (this.theme) {
            case "danger":
                return `rgba(255, ${Math.floor(Math.random() * 100)}, ${Math.floor(Math.random() * 50)}, ${0.3 + Math.random() * 0.4})`
            case "success":
                return `rgba(${Math.floor(Math.random() * 100)}, 255, ${Math.floor(Math.random() * 100)}, ${0.3 + Math.random() * 0.4})`
            default:
                return `rgba(${213 + Math.random() * 42}, ${201 + Math.random() * 54}, ${166 + Math.random() * 89}, ${0.3 + Math.random() * 0.4})`
        }
    }

    private startAnimation() {
        this.lastTime = performance.now()
        this.animated()
    }

    private animated(currentTime = 0) {
        if (!this.canvas || !this.ctx) return

        // Calculate delta time for smooth animation
        const deltaTime = currentTime - this.lastTime
        this.lastTime = currentTime

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        // Draw background image if loaded
        if (this.backgroundLoaded && this.backgroundImage) {
            this.drawBackgroundImage()
        } else {
            // Draw gradient background
            this.drawGradientBackground()
        }

        // Apply overlay based on theme
        this.applyThemeOverlay()

        // Update and draw particles
        this.updateParticles(deltaTime)

        // Continue animation loop
        this.animationFrame = requestAnimationFrame(this.animated.bind(this))
    }

    private drawBackgroundImage() {
        if (!this.canvas || !this.ctx || !this.backgroundImage) return

        // Draw with proper aspect ratio
        const imgRatio = this.backgroundImage.width / this.backgroundImage.height
        const canvasRatio = this.canvas.width / this.canvas.height

        let drawWidth, drawHeight, x, y

        if (canvasRatio > imgRatio) {
            drawWidth = this.canvas.width
            drawHeight = this.canvas.width / imgRatio
            x = 0
            y = (this.canvas.height - drawHeight) / 2
        } else {
            drawHeight = this.canvas.height
            drawWidth = this.canvas.height * imgRatio
            x = (this.canvas.width - drawWidth) / 2
            y = 0
        }

        // Draw with a dark filter
        this.ctx.globalAlpha = 0.3 // Dim the image
        this.ctx.drawImage(this.backgroundImage, x, y, drawWidth, drawHeight)
        this.ctx.globalAlpha = 1.0

        // Add dark overlay
        this.ctx.fillStyle = "rgba(26, 26, 20, 0.7)"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    private drawGradientBackground() {
        if (!this.canvas || !this.ctx) return

        // Create gradient
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2,
            this.canvas.height / 2,
            0,
            this.canvas.width / 2,
            this.canvas.height / 2,
            this.canvas.width,
        )

        switch (this.theme) {
            case "danger":
                gradient.addColorStop(0, "rgba(40, 20, 20, 1)")
                gradient.addColorStop(1, "rgba(20, 10, 10, 1)")
                break
            case "success":
                gradient.addColorStop(0, "rgba(20, 40, 20, 1)")
                gradient.addColorStop(1, "rgba(10, 20, 10, 1)")
                break
            default:
                gradient.addColorStop(0, "rgba(30, 30, 24, 1)")
                gradient.addColorStop(1, "rgba(26, 26, 20, 1)")
        }

        this.ctx.fillStyle = gradient
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    private applyThemeOverlay() {
        if (!this.canvas || !this.ctx) return

        // Add vignette effect
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2,
            this.canvas.height / 2,
            this.canvas.height / 3,
            this.canvas.width / 2,
            this.canvas.height / 2,
            this.canvas.height,
        )

        gradient.addColorStop(0, "rgba(0, 0, 0, 0)")
        gradient.addColorStop(1, "rgba(0, 0, 0, 0.7)")

        this.ctx.fillStyle = gradient
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        // Add theme-specific overlay
        let overlayColor
        switch (this.theme) {
            case "danger":
                overlayColor = `rgba(166, 50, 50, ${0.1 * this.intensity})`
                break
            case "success":
                overlayColor = `rgba(50, 166, 50, ${0.1 * this.intensity})`
                break
            default:
                overlayColor = `rgba(166, 124, 82, ${0.05 * this.intensity})`
        }

        this.ctx.fillStyle = overlayColor
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    }

    private updateParticles(deltaTime: number) {
        if (!this.canvas || !this.ctx) return

        for (const particle of this.particles) {
            // Update position
            particle.y -= particle.size * 0.05 * (deltaTime / 16) // Adjust for frame rate

            // Reset if out of bounds
            if (particle.y + particle.size < 0) {
                particle.y = this.canvas.height + particle.size
                particle.x = Math.random() * this.canvas.width
            }

            // Add some horizontal drift
            particle.x += Math.sin(particle.y * 0.01) * 0.2 * (deltaTime / 16)

            // Draw particle
            this.ctx.fillStyle = particle.color
            this.ctx.beginPath()
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
            this.ctx.fill()
        }
    }

    public setTheme(theme: "default" | "danger" | "success") {
        this.theme = theme

        // Update particle colors
        for (const particle of this.particles) {
            particle.color = this.getParticleColor()
        }
    }

    public setIntensity(intensity: number) {
        this.intensity = Math.max(0, Math.min(1, intensity))
    }

    public pulse(duration = 1000) {
        const startIntensity = this.intensity
        const maxIntensity = Math.min(1, startIntensity * 2)
        const startTime = performance.now()

        const animatePulse = (currentTime: number) => {
            const elapsed = currentTime - startTime
            const progress = Math.min(1, elapsed / duration)

            // Ease in and out
            const easedProgress = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2

            // Calculate current intensity
            if (progress < 0.5) {
                // Increasing
                this.intensity = startIntensity + (maxIntensity - startIntensity) * (easedProgress * 2)
            } else {
                // Decreasing
                this.intensity = maxIntensity - (maxIntensity - startIntensity) * ((easedProgress - 0.5) * 2)
            }

            if (progress < 1) {
                requestAnimationFrame(animatePulse)
            } else {
                this.intensity = startIntensity
            }
        }

        requestAnimationFrame(animatePulse)
    }
}

class Particle {
    constructor(
        public x: number,
        public y: number,
        public size: number,
        public color: string,
    ) { }
}

customElements.define("dynamic-background", DynamicBackground)
