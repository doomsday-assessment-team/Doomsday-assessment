import { apiService } from "../main.js";
import { Difficulty, Scenario } from "../types/global-types.js";
import { loadTemplate } from "../utils/load-template.js";

export class AssessmentFilters extends HTMLElement {
  private selectedScenarios: number[] = [];
  private selectedDifficulties: number[] = [];
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.loadTemplate();
  }
  async loadTemplate() {
    const content = await loadTemplate(
      "./templates/assessment-filters.component.html"
    );
    if (content) {
      this.shadowRoot?.appendChild(content);
      this.populateDifficulties();
      this.populateScenarios();
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);
      const todayStr = today.toISOString().split("T")[0];
      const oneYearAgoStr = oneYearAgo.toISOString().split("T")[0];
      const fromInput = this.shadowRoot?.getElementById("from-date") as HTMLInputElement;
      const toInput = this.shadowRoot?.getElementById("to-date") as HTMLInputElement;
      if (fromInput) fromInput.value = oneYearAgoStr;
      if (toInput) toInput.value = todayStr;
      this.addEventListeners();
    } else {
      // content is null
    }
  }

  private async populateScenarios() {
    try {
      const scenarios: Scenario[] = await apiService.get<Scenario[]>("/scenarios");
      const scenarioList = this.shadowRoot?.getElementById("scenarios-list");
      if (!scenarioList) return;
      scenarioList.replaceChildren();
      scenarios.forEach((scenario) => {
        const listItem = document.createElement("li");
        const listInput = document.createElement("input");
        listInput.setAttribute("type", "checkbox");
        listInput.checked = true;
        this.selectedScenarios.push(scenario.scenario_id);
        listInput.setAttribute("name", "scenario");
        listInput.setAttribute("value", String(scenario.scenario_id));
        listInput.addEventListener("change", (event) => {
          const checkbox = event.target as HTMLInputElement;
          const value = scenario.scenario_id;
          if (checkbox.checked) {
            if (!this.selectedScenarios.includes(value)) {
              this.selectedScenarios.push(value);
            }
          } else {
            this.selectedScenarios = this.selectedScenarios.filter(
              (id) => id !== value
            );
          }
          this.filterChanged();
        });

        const labelText = document.createTextNode(" " + scenario.scenario_name);
        listItem.appendChild(listInput);
        listItem.appendChild(labelText);

        scenarioList.appendChild(listItem);
      });
    } catch (error) {
      console.log("Failed to load scenarios:", error);
    }
  }


  private async populateDifficulties() {
    try {
      const scenarios: Difficulty[] = await apiService.get<Difficulty[]>(
        "/difficulties"
      );
      const difficultiesList = this.shadowRoot?.getElementById("difficulties-list");
      if (!difficultiesList) return;
      difficultiesList.replaceChildren();
      scenarios.map((difficulty) => {
        const listItem = document.createElement("li");
        const listInput = document.createElement("input");
        listInput.setAttribute("type", "checkbox");
        listInput.checked = true;
        this.selectedDifficulties.push(difficulty.question_difficulty_id);
        listInput.setAttribute("name", "difficulty");
        listInput.setAttribute("value",String(difficulty.question_difficulty_id));
        listInput.addEventListener("change", (event) => {
          const checkbox = event.target as HTMLInputElement;
          const value = difficulty.question_difficulty_id;
          if (checkbox.checked) {
            this.selectedDifficulties.push(value);
          } else {
            this.selectedDifficulties = this.selectedDifficulties.filter(
              (id) => id !== value
            );
          }

          this.filterChanged();
        });
        listItem.appendChild(listInput);
        const labelText = document.createTextNode(
          " " + difficulty.question_difficulty_name
        );
        listItem.appendChild(labelText);

        difficultiesList.appendChild(listItem);
      });
    } catch (error) {
      console.log(error);
    }
  }

  addEventListeners() {
    const dateFromInput = this.shadowRoot?.getElementById("from-date");
    const dateToInput = this.shadowRoot?.getElementById("to-date");
    const scenarioFilter = this.shadowRoot?.getElementById("scenario-filter");
    const difficultyFilter = this.shadowRoot?.getElementById("difficulty-filter");
    const userFilter = this.shadowRoot?.getElementById("user-filter");
    dateFromInput?.addEventListener("input", () => {
      const fromInput = dateFromInput as HTMLInputElement;
      const toInput = dateToInput as HTMLInputElement;
      if (toInput && fromInput.value > toInput.value) {
        toInput.value = fromInput.value;
      }
      this.filterChanged();
    });
    dateToInput?.addEventListener("input", () => this.filterChanged());
    scenarioFilter?.addEventListener("change", () => this.filterChanged());
    difficultyFilter?.addEventListener("change", () => this.filterChanged());
    userFilter?.addEventListener("input", () => this.filterChanged());
    const clearFiltersButton = this.shadowRoot?.querySelector(".clear-filters");
    clearFiltersButton?.addEventListener("click", () => this.clearFilters());
    this.shadowRoot?.querySelectorAll(".dropdown-toggle").forEach((button) => {
      button.addEventListener("click", () => {
        const parent = button.closest(".dropdown");
        parent?.classList.toggle("open");
      });
    });
  }

  filterChanged() {
    const filters = this.getCurrentFilters();
    this.dispatchEvent(
      new CustomEvent("filters-changed", {
        detail: filters,
        bubbles: true,
        composed: true,
      })
    );
  }

  getCurrentFilters(): Filters {
    const dateFrom = (
      this.shadowRoot?.getElementById("from-date") as HTMLInputElement
    )?.value;
    const dateTo = (
      this.shadowRoot?.getElementById("to-date") as HTMLInputElement
    )?.value;
    const userName = (
      this.shadowRoot?.getElementById("user-filter") as HTMLInputElement
    )?.value;

    return {
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      userName,
      difficulties: this.selectedDifficulties,
      scenarios: this.selectedScenarios,
    };
  }

  clearFilters() {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const todayStr = today.toISOString().split("T")[0];
    const oneYearAgoStr = oneYearAgo.toISOString().split("T")[0];

    const fromInput = this.shadowRoot?.getElementById("from-date") as HTMLInputElement;
    const toInput = this.shadowRoot?.getElementById("to-date") as HTMLInputElement;
    const userFilter = this.shadowRoot?.getElementById("user-filter") as HTMLInputElement;

    if (fromInput) fromInput.value = oneYearAgoStr;
    if (toInput) toInput.value = todayStr;
    if (userFilter) userFilter.value = "";
    
    const checkboxLists = ["scenarios-list", "difficulties-list"];
    checkboxLists.forEach(listId => {
      const list = this.shadowRoot?.getElementById(listId);
      if (list) {
        const checkboxes = list.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>;
        checkboxes.forEach(checkbox => {
          checkbox.checked = true;
        });
      }
    });

    this.filterChanged();
  }

}
customElements.define("assessment-filters", AssessmentFilters);
