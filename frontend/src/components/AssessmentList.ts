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
    this.fetchHistory();
  }

  async loadTemplate() {
    const content = await loadTemplate(
      "./templates/assessment-list.component.html"
    );
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

    if (filters.scenario) {
      params.append("scenario", String(filters.scenario));
    }

    if (filters.difficulty) {
      params.append("difficulty", String(filters.difficulty));
    }

    if (filters.sortAscending){
      params.append("sort_by", String(true))
    } else {
      params.append("sort_by", String(false))
    }

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
          noItemMessage.textContent = "No items found.";
          noItemMessage.classList.add("no-items-message");
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
