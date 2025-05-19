import { loadTemplate } from "../utils/load-template.js";
import "./AssessmentCard.js";
import { apiService } from "../main.js";
import { AssessmentSummaryRow } from "../types/global-types.js";

export class AssessmentList extends HTMLElement {
  connectedCallback() {
    this.loadTemplate();
    window.addEventListener("filters-changed", (event: Event) => {
      const customEvent = event as CustomEvent;
      this.fetchHistory(customEvent.detail);
    });
  }

  async loadTemplate() {
    const content = await loadTemplate(
      "./templates/assessment-list.component.html"
    );
    this.appendChild(content);
    this.fetchHistory();
  }

  private toQueryParams(filters: Filters): URLSearchParams {
    const params = new URLSearchParams();

    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);

    const fromDate = filters.dateFrom
      ? new Date(filters.dateFrom)
      : oneMonthAgo;
    fromDate.setHours(0, 0, 0, 0);
    params.append("start_date", fromDate.toISOString());

    const toDate = filters.dateTo ? new Date(filters.dateTo) : today;
    toDate.setHours(23, 59, 59, 999);
    params.append("end_date", toDate.toISOString());

    if (filters.scenario) {
      params.append("scenario", String(filters.scenario));
    }

    if (filters.difficulty) {
      params.append("difficulty", String(filters.difficulty));
    }
    params.append("sort_by", String(filters.sortAscending ?? true));

    return params;
  }

  async fetchHistory(filters?: Filters) {
    const params = this.toQueryParams(filters ?? ({} as Filters));
    try {
      const historyItems = await apiService.get<AssessmentSummaryRow[]>(
        `/users/assessment-summary?${params.toString()}`
      );
      let list = this.querySelector<HTMLUListElement>(".tests-grid");
      if (list) {
        list.replaceChildren();
        if (historyItems.length === 0) {
          const noItemMessage = document.createElement("li");
          noItemMessage.textContent = "No assessment found.";
          noItemMessage.classList.add("no-assessment-message");
          list.appendChild(noItemMessage);
        } else {
          historyItems.forEach((item) => {
            const card = document.createElement("assessment-card");
            card.setAttribute("history-id", item.history_id.toString());
            card.setAttribute("difficulty", item.question_difficulty_name);
            card.setAttribute("scenario", item.scenario_name);
            card.setAttribute("timestamp", item.timestamp);
            card.setAttribute("score", item.total_points);
            list.appendChild(card);
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch assessment history:", error);
    }
  }
}
customElements.define("assessment-list", AssessmentList);
