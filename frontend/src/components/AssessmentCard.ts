import { loadTemplate } from "../utils/load-template.js";
import { Question } from "./AssessmentList.js";

export class AssessmentCard extends HTMLElement {
  private questions: Question[] | undefined;
  setQuestions(questions: Question[]){
    this.questions = questions;
  }
  renderQuestions() {
    const questionsSection = this.shadowRoot?.getElementById("questions");
    if (!questionsSection || !this.questions) return;
    questionsSection.replaceChildren();
    this.questions.forEach(question => {
      const questionItem = document.createElement("li");
      const questionTag = document.createElement("p");
      questionTag.textContent = question.question_text;
      const optionsList = document.createElement("ul");
      question.options.forEach(option => {
        const optionItem = document.createElement("li");
        optionItem.textContent = option.option_text;
        if (option.option_id == question.selected_option_id){
          const markedOption = document.createElement("mark");
          markedOption.appendChild(optionItem);
          optionsList.appendChild(markedOption);
        } else {
          optionsList.appendChild(optionItem);
        }
       
      });
      questionItem.appendChild(questionTag);
      questionItem.appendChild(optionsList);
      questionsSection.appendChild(questionItem);
    });
  }

  connectedCallback() {
    this.loadTemplate();
  }

  async loadTemplate() {
    const content = await loadTemplate("./templates/assessment-card.component.html");
    this.appendChild(content);
  }
  updateContent() {
    const root = this.shadowRoot;
    if (!root) return;
    root.getElementById("assessment-date")!.textContent = this.getAttribute("date") ?? "";
    root.getElementById("assessment-user")!.textContent = this.getAttribute("user") ?? "";
    root.getElementById("assessment-scenario")!.textContent = this.getAttribute("scenario") ?? "";
    root.getElementById("assessment-difficulty")!.textContent = this.getAttribute("difficulty") ?? "";
    root.getElementById("assessment-points")!.textContent = this.getAttribute("points") ?? "";
    root.getElementById("assessment-feedback")!.textContent = this.getAttribute("feedback") ?? "";
    root.getElementById("assessment-points")!.textContent = this.getAttribute("points") ?? "";
  }
}
customElements.define("assessment-card", AssessmentCard);
