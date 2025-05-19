import { apiService } from "../main.js";
import { AssessmentHistory } from "../types/global-types.js";
import { loadTemplate } from "../utils/load-template.js";

export class AssessmentCard extends HTMLElement {
  connectedCallback() {
    this.loadTemplate();
  }

  async displayDetails(id: number) {
    const modal = document.getElementById("detail-page");
    if (modal) {
      modal.style.display = "block";
      const details = await apiService.get<AssessmentHistory>(
        `/users/assessment-details?history_id=${id}`
      );

      const dateMetadata = document.querySelector<HTMLUListElement>("#date");
      if (dateMetadata) {
        dateMetadata.textContent = this.formatDate(details.timestamp);
        dateMetadata.setAttribute("datetime", this.formatDate(details.timestamp));
      }

      const scoreMetadata = document.querySelector<HTMLUListElement>("#score");
      if (scoreMetadata) {
        scoreMetadata.textContent = details.questions.reduce((sum, q) => {
          const selected = q.options.find(o => o.option_id === q.selected_option_id);
          return selected ? sum + selected.points : sum;
        }, 0).toString();
      }

      const difficultyBadge = document.querySelector<HTMLUListElement>("#difficulty");
      if (difficultyBadge) {
        difficultyBadge.textContent = details.difficulty_name.toUpperCase();
      }

      const scenarioTitle = document.querySelector<HTMLUListElement>("#scenario");
      if (scenarioTitle) {
        scenarioTitle.textContent = details.scenario_name;
      }

      const feedback = document.querySelector<HTMLUListElement>("#feedback");
      if (feedback) {
        feedback.textContent = details.feedback;
      }

      const listOfQuestions = document.querySelector<HTMLUListElement>(".question-list");
      listOfQuestions?.replaceChildren();
      details.questions.forEach((question) => {
        const questionComponent = document.createElement("history-question");
        questionComponent.addEventListener("ready", () => {
          const questionText =
            questionComponent.querySelector(".question-text");
          if (questionText) {
            questionText.textContent = question.question_text;
          }
          const questionOptions =
            questionComponent.querySelector(".answer-options");
          questionOptions?.replaceChildren();

          question.options.forEach((option, index) => {
            const optionComponent = document.createElement("history-option");

            optionComponent.addEventListener("ready", () => {
              const optionText = optionComponent.querySelector(".option-text");
              if (optionText) {
                optionText.textContent = option.option_text;
              }
              const answerOption =
                optionComponent.querySelector(".option-marker");
              if (answerOption) {
                answerOption.textContent = String.fromCharCode(65 + index);
              }
              if (question.selected_option_id == option.option_id) {
                const selectedOption =
                  optionComponent.querySelector(".answer-option");
                if (selectedOption) {
                  selectedOption.classList.add("selected");
                }
                const points = optionComponent.querySelector<HTMLElement>(".option-points");
                if (points) {
                  points.style.display = "block";
                  points.textContent = `+${option.points.toString()}`;
                }
              }
            });
            questionOptions?.appendChild(optionComponent);
          });
        });

        listOfQuestions?.appendChild(questionComponent);
      });
    }
  }

  async loadTemplate() {
    const content = await loadTemplate(
      "./templates/assessment-card.component.html"
    );
    this.appendChild(content);

    const actionButtons = document.querySelectorAll(".action-button");

    this.addCardDetails();
    actionButtons.forEach((button) => {
      const id = parseInt(button.getAttribute("assessment-id") || "");
      button.addEventListener("click", () => {
        this.displayDetails(id);
      });
    });
  }

  addCardDetails() {
    const historyId = this.getAttribute("history-id");
    if (historyId !== null) {
      const button = this.querySelector(".action-button");
      if (button) {
        button.setAttribute("assessment-id", historyId);
      }
    }

    const difficulty = this.getAttribute("difficulty");
    if (difficulty !== null) {
      const badge = this.querySelector(".difficulty-badge");
      if (badge) {
        badge.textContent = difficulty.toUpperCase();
        badge.classList.remove("badge-easy", "badge-medium", "badge-hard");

        if (difficulty.toLowerCase() === "easy") {
          badge.classList.add("badge-easy");
        } else if (difficulty.toLowerCase() === "medium") {
          badge.classList.add("badge-medium");
        } else if (difficulty.toLowerCase() === "hard") {
          badge.classList.add("badge-hard");
        }
      }
    }

    const scenario = this.getAttribute("scenario");
    if (scenario !== null) {
      const title = this.querySelector(".test-title");
      if (title) {
        title.textContent = scenario;
      }
    }

    const timestamp = this.getAttribute("timestamp");
    if (timestamp !== null) {
      const timeTag = this.querySelector(".test-meta time");
      if (timeTag) {
        timeTag.textContent = this.formatDate(timestamp);
      }
    }

    const score = this.getAttribute("score");
    if (score !== null) {
      const scoreTag = this.querySelector(".score-value");
      if (scoreTag) {
        scoreTag.textContent = score;
      }
    }
  }

  formatDate(timestamp: string){
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "short",
      hour: "numeric",
      minute: "2-digit",
    };
    const userLocale = navigator.language || "default";
    return date.toLocaleString(userLocale, options);
  }
}
customElements.define("assessment-card", AssessmentCard);
