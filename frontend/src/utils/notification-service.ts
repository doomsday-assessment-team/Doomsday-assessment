interface NotificationOptions {
  type: "success" | "warning" | "error" | "info"
  title?: string
  message: string
  duration?: number
}

export class NotificationService {
  private static instance: NotificationService

  constructor() {
    if (NotificationService.instance) {
      return NotificationService.instance
    }
    NotificationService.instance = this
  }

  /**
   * Shows a notification to the user
   * @param options Notification options
   * @returns Promise that resolves when the notification duration is complete
   */
  async showNotification(options: NotificationOptions): Promise<void> {
    const { type, title, message, duration = 5000 } = options

    const notification = document.createElement("div")
    notification.className = `system-notification ${type}`
    notification.setAttribute("role", "alert")
    notification.setAttribute("aria-live", "assertive")

    const svgNS = "http://www.w3.org/2000/svg"
    const svg = document.createElementNS(svgNS, "svg")
    svg.setAttribute("xmlns", svgNS)
    svg.setAttribute("width", "24")
    svg.setAttribute("height", "24")
    svg.setAttribute("viewBox", "0 0 24 24")
    svg.setAttribute("fill", "none")
    svg.setAttribute("stroke", "currentColor")
    svg.setAttribute("stroke-width", "2")
    svg.setAttribute("stroke-linecap", "round")
    svg.setAttribute("stroke-linejoin", "round")
    svg.setAttribute("aria-hidden", "true")

    if (type === "success") {
      const path = document.createElementNS(svgNS, "path")
      path.setAttribute("d", "M22 11.08V12a10 10 0 1 1-5.93-9.14")
      svg.appendChild(path)

      const polyline = document.createElementNS(svgNS, "polyline")
      polyline.setAttribute("points", "22 4 12 14.01 9 11.01")
      svg.appendChild(polyline)
    } else if (type === "warning") {
      const path = document.createElementNS(svgNS, "path")
      path.setAttribute("d", "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z")
      svg.appendChild(path)

      const line1 = document.createElementNS(svgNS, "line")
      line1.setAttribute("x1", "12")
      line1.setAttribute("y1", "9")
      line1.setAttribute("x2", "12")
      line1.setAttribute("y2", "13")
      svg.appendChild(line1)

      const line2 = document.createElementNS(svgNS, "line")
      line2.setAttribute("x1", "12")
      line2.setAttribute("y1", "17")
      line2.setAttribute("x2", "12.01")
      line2.setAttribute("y2", "17")
      svg.appendChild(line2)
    } else if (type === "error") {
      const circle = document.createElementNS(svgNS, "circle")
      circle.setAttribute("cx", "12")
      circle.setAttribute("cy", "12")
      circle.setAttribute("r", "10")
      svg.appendChild(circle)

      const line1 = document.createElementNS(svgNS, "line")
      line1.setAttribute("x1", "15")
      line1.setAttribute("y1", "9")
      line1.setAttribute("x2", "9")
      line1.setAttribute("y2", "15")
      svg.appendChild(line1)

      const line2 = document.createElementNS(svgNS, "line")
      line2.setAttribute("x1", "9")
      line2.setAttribute("y1", "9")
      line2.setAttribute("x2", "15")
      line2.setAttribute("y2", "15")
      svg.appendChild(line2)
    } else {
      const circle = document.createElementNS(svgNS, "circle")
      circle.setAttribute("cx", "12")
      circle.setAttribute("cy", "12")
      circle.setAttribute("r", "10")
      svg.appendChild(circle)

      const line1 = document.createElementNS(svgNS, "line")
      line1.setAttribute("x1", "12")
      line1.setAttribute("y1", "16")
      line1.setAttribute("x2", "12")
      line1.setAttribute("y2", "12")
      svg.appendChild(line1)

      const line2 = document.createElementNS(svgNS, "line")
      line2.setAttribute("x1", "12")
      line2.setAttribute("y1", "8")
      line2.setAttribute("x2", "12.01")
      line2.setAttribute("y2", "8")
      svg.appendChild(line2)
    }

    notification.appendChild(svg)

    const content = document.createElement("div")
    content.className = "notification-content"

    if (title) {
      const titleElement = document.createElement("h3")
      titleElement.className = "notification-title"
      titleElement.textContent = title
      content.appendChild(titleElement)
    }

    const messageElement = document.createElement("p")
    messageElement.className = "notification-message"
    messageElement.textContent = message
    content.appendChild(messageElement)

    notification.appendChild(content)

    const progressBar = document.createElement("div")
    progressBar.className = "notification-progress"
    notification.appendChild(progressBar)

    document.body.appendChild(notification)

    progressBar.style.transition = `width ${duration}ms linear`

    progressBar.getBoundingClientRect()

    progressBar.style.width = "0%"

    this.ensureStylesExist()

    return new Promise((resolve) => {
      setTimeout(() => {
        notification.classList.add("fade-out")
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification)
          }
          resolve()
        }, 500) 
      }, duration)
    })
  }

  /**
   * Ensure the notification styles are added to the document
   */
  private ensureStylesExist(): void {
    const styleId = "system-notification-styles"
    if (document.getElementById(styleId)) {
      return
    }

    const style = document.createElement("style")
    style.id = styleId
    style.textContent = `
            .system-notification {
                position: fixed;
                top: 1.5rem;
                right: 1.5rem;
                max-width: 24rem;
                background-color: var(--card-bg, #2a2b21);
                color: var(--text-color, #d5c9a6);
                font-family: "Rajdhani", sans-serif;
                border-radius: 0.625rem;
                box-shadow: 0 0.625rem 1.5625rem rgba(0, 0, 0, 0.3);
                padding: 1rem;
                display: flex;
                gap: 0.75rem;
                z-index: 9999;
                border: 0.0625rem solid var(--border-color, #4a4c3e);
                overflow: hidden;
                animation: notification-slide-in 0.3s ease-out forwards;
            }
            
            .system-notification::before {
                content: "";
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 0.25rem;
                background: linear-gradient(90deg, var(--primary-color, #d5c9a6), transparent);
            }
            
            .system-notification.success::before {
                background: linear-gradient(90deg, var(--success-color, #8a9a5b), transparent);
            }
            
            .system-notification.warning::before {
                background: linear-gradient(90deg, var(--warning-color, #c7a758), transparent);
            }
            
            .system-notification.error::before {
                background: linear-gradient(90deg, var(--error-color, #a65c52), transparent);
            }
            
            .system-notification.info::before {
                background: linear-gradient(90deg, var(--primary-color, #d5c9a6), transparent);
            }
            
            .notification-content {
                flex: 1;
            }
            
            .notification-title {
                margin: 0 0 0.25rem 0;
                font-size: 1rem;
                font-weight: 700;
                letter-spacing: 0.0625rem;
            }
            
            .notification-message {
                margin: 0;
                font-size: 0.875rem;
                opacity: 0.9;
            }
            
            .notification-progress {
                position: absolute;
                bottom: 0;
                left: 0;
                height: 0.25rem;
                width: 100%;
                background-color: rgba(213, 201, 166, 0.3);
            }
            
            .system-notification.success .notification-progress {
                background-color: var(--success-color, #8a9a5b);
            }
            
            .system-notification.warning .notification-progress {
                background-color: var(--warning-color, #c7a758);
            }
            
            .system-notification.error .notification-progress {
                background-color: var(--error-color, #a65c52);
            }
            
            .system-notification.fade-out {
                animation: notification-fade-out 0.5s forwards;
            }
            
            @keyframes notification-slide-in {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes notification-fade-out {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
            
            @media (max-width: 640px) {
                .system-notification {
                    top: 1rem;
                    right: 1rem;
                    left: 1rem;
                    max-width: none;
                }
            }
        `

    document.head.appendChild(style)
  }
}
