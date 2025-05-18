import { loadTemplate } from "../utils/load-template.js";
import "./AssessmentCard.js";
import { AssessmentCard } from "./AssessmentCard.js";
import { Option } from "../types/global-types.js";
import { apiService } from "../main.js";
import { checkAdminRole } from "../utils/check-admin.js";

interface AssessmentHistoryItem {
  history_id: number;
  feedback: string;
  timestamp: string;
  scenario_id: number;
  scenario_name: string;
  difficulty_id: number;
  difficulty_name: string;
  user_name: string;
  user_id: number;
  questions: Question[];
}

export interface Question {
  question_id: number;
  question_text: string;
  selected_option_id: number;
  options: Option[];
}

export class AssessmentList extends HTMLElement {
  connectedCallback() {
    this.loadTemplate();
  }

  async loadTemplate() {
    const content = await loadTemplate("./templates/assessment-list.component.html");
    this.appendChild(content);
  }

  private toQueryParams(filters: Filters): URLSearchParams {
    const params = new URLSearchParams();

    if (filters.dateFrom) {
      params.append("start_date", filters.dateFrom.toISOString().split("T")[0]);
    }

    if (filters.dateTo) {
      params.append("end_date", filters.dateTo.toISOString().split("T")[0]);
    }

    if (filters.scenarios && filters.scenarios.length > 0) {
      params.append("scenarios", filters.scenarios.join(","));
    }

    if (filters.difficulties && filters.difficulties.length > 0) {
      params.append("difficulties", filters.difficulties.join(","));
    }

    if (filters.userName) {
      params.append("user_name", filters.userName);
    }

    return params;
  }

  async fetchHistory(filters: Filters = {}) {
    const assessmentHistoryList = this.shadowRoot?.getElementById("assessment-history");
    if (!assessmentHistoryList) return;
    assessmentHistoryList.replaceChildren();
    const loadingItem = document.createElement("li");
    loadingItem.textContent = "Loading...";
    loadingItem.setAttribute("id", "loading-item");
    assessmentHistoryList.appendChild(loadingItem);
    try{
      const isAdmin = await checkAdminRole();
      const assessmentHistories: AssessmentHistoryItem[] =  isAdmin ? await apiService.get("/admin/user-question-history", this.toQueryParams(filters)) : await apiService.get("/users/user-question-history", this.toQueryParams(filters));
      if (assessmentHistories.length === 0) {
        loadingItem.textContent = "No assessment history found.";
      } else {
        assessmentHistoryList.replaceChildren();
        const optionsDate: Intl.DateTimeFormatOptions = {
          weekday: "long",
          day: "numeric",
          month: "long",
        };
        const optionsTime: Intl.DateTimeFormatOptions = {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        };
        assessmentHistories.forEach((assessmentHistory) => {
          const assessmentHistoryItem = document.createElement("assessment-item");
          const listItem = document.createElement("li");
          assessmentHistoryItem.setAttribute("user", assessmentHistory.user_name);
          const date = new Date(assessmentHistory.timestamp);
          const dayName = date.toLocaleDateString("en-GB", optionsDate);
          const time = date.toLocaleTimeString("en-GB", optionsTime);
          const formattedDate = `${dayName} at ${time}`;
          assessmentHistoryItem.setAttribute("date", formattedDate);
          assessmentHistoryItem.setAttribute(
            "scenario",
            assessmentHistory.scenario_name
          );
          assessmentHistoryItem.setAttribute(
            "difficulty",
            assessmentHistory.difficulty_name
          );
          const totalPoints = assessmentHistory.questions.reduce(
            (accumulator, question) => {
              const selected = question.options.find(
                (option) => option.option_id === question.selected_option_id
              );
              return accumulator + (selected?.points ?? 0);
            },
            0
          );

          assessmentHistoryItem.setAttribute("points", totalPoints.toString());
          assessmentHistoryItem.setAttribute("feedback", assessmentHistory.feedback || "");

          listItem.appendChild(assessmentHistoryItem);
          assessmentHistoryList.appendChild(listItem);
          (assessmentHistoryItem as AssessmentCard).setQuestions(
            assessmentHistory.questions
          );
        });
      }
    } catch(error){
      console.error("Error loading assessment history:", error);
      loadingItem.textContent = "Failed to load data.";
    }
  }
}
customElements.define("assessment-list", AssessmentList);
