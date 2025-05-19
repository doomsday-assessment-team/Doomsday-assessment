import { apiService } from "../main.js";
import { Difficulty, Scenario } from "../types/global-types.js";
import { checkAdminRole } from "../utils/check-admin.js";
import { loadTemplate } from "../utils/load-template.js";

export class AssessmentFilters extends HTMLElement {
  private selectedScenarios: number[] = [];
  private selectedDifficulties: number[] = [];
  connectedCallback() {
    this.loadTemplate();
    this.populateFilters();
  }
  async loadTemplate() {
    const content = await loadTemplate(
      "./templates/assessment-filters.component.html"
    );
    this.appendChild(content);
    this.setDefaultDates();
  }

  async populateFilters() {
    const difficulties = await apiService.get<Difficulty[]>("/difficulties");
    const difficultySelect = document.getElementById(
      "difficulty-filter"
    ) as HTMLSelectElement;
    if (difficultySelect) {
      difficultySelect.options.length = 1;
      difficulties.forEach((difficulty) => {
        const option = document.createElement("option");
        option.value = difficulty.question_difficulty_id.toString();
        option.textContent = difficulty.question_difficulty_name;
        difficultySelect.appendChild(option);
      });
    }

    const scenarios = await apiService.get<Scenario[]>("/scenarios");
    const scenarioSelect = document.getElementById(
      "scenario-filter"
    ) as HTMLSelectElement;
    scenarioSelect.options.length = 1;
    scenarios.forEach((scenario) => {
      const option = document.createElement("option");
      option.value = scenario.scenario_id.toString();
      option.textContent = scenario.scenario_name;
      scenarioSelect.appendChild(option);
    });

    this.addEventListeners();
  }

  setDefaultDates() {
    const toDateInput = document.getElementById("to-date") as HTMLInputElement;
    const fromDateInput = document.getElementById(
      "from-date"
    ) as HTMLInputElement;
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };

    toDateInput.value = formatDate(today);
    fromDateInput.value = formatDate(oneMonthAgo);

    const sortButton = document.getElementById("sort-button");
    let ascending = true;

    if (sortButton) {
      sortButton.classList.add("asc");

      sortButton.addEventListener("click", () => {
        ascending = !ascending;
        if (ascending) {
          sortButton.classList.add("asc");
          sortButton.classList.remove("desc");
        } else {
          sortButton.classList.add("desc");
          sortButton.classList.remove("asc");
        }
      });
    }
  }
  addEventListeners() {
    const difficultySelect =
      this.querySelector<HTMLSelectElement>("#difficulty-filter");
    const scenarioSelect =
      this.querySelector<HTMLSelectElement>("#scenario-filter");
    const fromDateInput = this.querySelector<HTMLInputElement>("#from-date");
    const toDateInput = this.querySelector<HTMLInputElement>("#to-date");
    const sortButton = this.querySelector<HTMLButtonElement>("#sort-button");

    if (difficultySelect) {
      difficultySelect.addEventListener("change", () => this.filterChanged());
    }
    if (scenarioSelect) {
      scenarioSelect.addEventListener("change", () => this.filterChanged());
    }
    if (fromDateInput) {
      fromDateInput.addEventListener("change", () => this.filterChanged());
    }
    if (toDateInput) {
      toDateInput.addEventListener("change", () => this.filterChanged());
    }
    if (sortButton) {
      sortButton.addEventListener("click", () => {
        const ascending = sortButton.classList.toggle("asc");
        if (ascending) {
          sortButton.classList.remove("desc");
        } else {
          sortButton.classList.add("desc");
        }
        this.filterChanged();
      });
    }
  }

  filterChanged() {
    const filters = this.getFilters();
    window.dispatchEvent(
      new CustomEvent("filters-changed", {
        detail: filters,
      })
    );
  }

  getFilters(): Filters {
    const difficultySelect =
      this.querySelector<HTMLSelectElement>("#difficulty-filter");
    const scenarioSelect =
      this.querySelector<HTMLSelectElement>("#scenario-filter");
    const fromDateInput = this.querySelector<HTMLInputElement>("#from-date");
    const toDateInput = this.querySelector<HTMLInputElement>("#to-date");
    const sortButton = this.querySelector<HTMLButtonElement>("#sort-button");
    const parseDate = (
      dateStr: string | undefined | null
    ): Date | undefined => {
      if (!dateStr) return undefined;
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? undefined : date;
    };

    return {
      difficulty:
        difficultySelect && difficultySelect.value
          ? isNaN(Number(difficultySelect.value))
            ? undefined
            : Number(difficultySelect.value)
          : undefined,
      scenario:
        scenarioSelect && scenarioSelect.value
          ? isNaN(Number(scenarioSelect.value))
            ? undefined
            : Number(scenarioSelect.value)
          : undefined,
      dateFrom: parseDate(fromDateInput?.value ?? null),
      dateTo: parseDate(toDateInput?.value ?? null),
      sortAscending: sortButton?.classList.contains("asc") ?? true,
    };
  }

  clearFilters() {}
}
customElements.define("assessment-filters", AssessmentFilters);
