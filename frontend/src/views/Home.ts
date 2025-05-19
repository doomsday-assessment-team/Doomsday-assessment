import { apiService, App } from "../main.js";
import { Difficulty, Scenario } from "../types/global-types.js";
import { checkAdminRole, checkManagerRole } from "../utils/check-admin.js";
import { loadTemplate } from "../utils/load-template.js";

export interface Question {
  question_id: number;
  question_text: string;
  question_difficulty_id: number;
  question_difficulty_name?: string;
  difficulty_time?: number;
  scenario_id: number;
}

export class HomeView extends HTMLElement {
  private shadowRootInstance: ShadowRoot;

  private form: HTMLFormElement | null = null;
  private scenarioSelect: HTMLSelectElement | null = null;
  private difficultyFieldset: HTMLFieldSetElement | null = null;
  private scenarioError: HTMLElement | null = null;
  private difficultyError: HTMLElement | null = null;
  private difficultyOptionsList: HTMLSelectElement | null = null;
  private scenarios: Scenario[] = [];

  private addOptionsButton: HTMLElement | null = null;
  private userManagementLink: HTMLElement | null = null;
  private userAvatar: HTMLElement | null = null;
  private avatarInitials: HTMLElement | null = null;

  constructor() {
    super();
    this.shadowRootInstance = this.attachShadow({ mode: "open" });
    this.loadAndInit();
  }

  private async loadAndInit() {
    const content = await loadTemplate("./templates/home.view.html");
    if (content) {
      this.shadowRootInstance.appendChild(content);
      this.bindElements();
      this.addEventListeners();

      // Populate the form elements
      this.populateScenarios();
      this.populateDifficulties();

      // Setup user avatar and check roles
      await this.setupUserAvatar();
      await this.hideAdminLinkButton();
      await this.setupUserManagementLink();
    } else {
      this.shadowRootInstance.innerHTML =
        "<p>Error loading home view template.</p>";
    }
  }

  private bindElements() {
    this.form = this.shadowRootInstance.querySelector("form.test-selection");
    this.scenarioSelect = this.shadowRootInstance.querySelector("#scenario");
    this.difficultyFieldset = this.shadowRootInstance.querySelector(
      "#difficulty-fieldset"
    );
    this.scenarioError =
      this.shadowRootInstance.querySelector("#scenario-error");
    this.difficultyError =
      this.shadowRootInstance.querySelector("#difficulty-error");
    this.difficultyOptionsList =
      this.shadowRootInstance.querySelector("#difficulty");
    this.addOptionsButton = this.shadowRootInstance?.querySelector(
      "#admin-questions-link-li"
    );
    this.userManagementLink = this.shadowRootInstance?.querySelector(
      "#user-management-link-li"
    );
    this.userAvatar = this.shadowRootInstance?.querySelector(".user-avatar");
    this.avatarInitials =
      this.shadowRootInstance?.querySelector(".avatar-initials");
  }

  private async setupUserAvatar() {
    if (!this.userAvatar || !this.avatarInitials) {
      console.error("User avatar elements not found");
      return;
    }

    try {
      // Fetch the current user
      const userData: UserResponse = await apiService.get("/users/me");
      const user = userData.user;

      if (!user) {
        console.error("Failed to fetch user data");
        return;
      }

      // Set the avatar initials
      const initials = `${user.given_name.charAt(0)}${user.family_name
        .charAt(0)
        .toUpperCase()}`;
      this.avatarInitials.textContent = initials;

      // Add click event to navigate to user profile
      this.userAvatar.addEventListener("click", () => {
        App.navigate("/user-profile");
      });
    } catch (error) {
      console.error("Error setting up user avatar:", error);
    }
  }

  private async populateScenarios() {
    if (!this.scenarioSelect) {
      console.error("HomeView: Scenario select element not found.");
      return;
    }

    try {
      const scenarios: Scenario[] = await apiService.get<Scenario[]>(
        "/scenarios"
      );

      while (this.scenarioSelect.options.length > 1) {
        this.scenarioSelect.remove(1);
      }

      scenarios.map((scenario, index: number) => {
        const optionElement = document.createElement("option");
        optionElement.value = String(scenario.scenario_id);
        optionElement.textContent = scenario.scenario_name;
        this.scenarioSelect?.appendChild(optionElement);
      });

      if (this.scenarioSelect.options[0]) {
        this.scenarioSelect.options[0].disabled = true;
      }
    } catch (error) {
      if (this.scenarioError) {
        this.scenarioError.textContent =
          "Could not load scenarios. Please try again later.";
      }
    }
  }

  private async populateDifficulties() {
    if (!this.difficultyOptionsList) {
      return;
    }

    try {
      const difficulties: Difficulty[] = await apiService.get<Difficulty[]>(
        "/difficulties"
      );

      while (this.difficultyOptionsList.options.length > 1) {
        this.difficultyOptionsList.remove(1);
      }

      difficulties.map((difficulty, index: number) => {
        const optionElement = document.createElement("option");
        optionElement.value = String(difficulty.question_difficulty_id);
        optionElement.textContent = difficulty.question_difficulty_name;
        this.difficultyOptionsList?.appendChild(optionElement);
      });

      if (this.difficultyOptionsList.options[0]) {
        this.difficultyOptionsList.options[0].disabled = true;
      }
    } catch (error) {
      console.error(
        "HomeView: Failed to fetch or populate difficulties:",
        error
      );
      if (this.difficultyError) {
        this.difficultyError.textContent = "Could not load difficulty levels.";
      }
    }
  }

  async hideAdminLinkButton() {
    if (this.addOptionsButton) {
      try {
        const isAdmin = await checkAdminRole();
        if (isAdmin) {
          this.addOptionsButton.classList.remove("hidden");
        } else {
          this.addOptionsButton.classList.add("hidden");
        }
      } catch (error) {
        console.error("Error checking admin role:", error);
        this.addOptionsButton.classList.add("hidden");
      }
    } else {
      console.warn("Admin link not found.");
    }
  }

  private async setupUserManagementLink() {
    if (this.userManagementLink) {
      try {
        // Use the checkManagerRole function directly
        const hasManagerRole = await checkManagerRole();

        if (hasManagerRole) {
          this.userManagementLink.classList.remove("hidden");
        } else {
          this.userManagementLink.classList.add("hidden");
        }
      } catch (error) {
        console.error("Error checking manager role:", error);
        this.userManagementLink.classList.add("hidden");
      }
    } else {
      console.warn("User management link not found.");
    }
  }

  private addEventListeners() {
    if (!this.form) {
      return;
    }

    this.form.addEventListener("submit", (event) => this.handleSubmit(event));

    this.scenarioSelect?.addEventListener("change", () =>
      this.clearError(this.scenarioSelect, this.scenarioError)
    );
    this.difficultyFieldset?.addEventListener("change", () =>
      this.clearError(this.difficultyFieldset, this.difficultyError)
    );
  }

  private handleSubmit(event: SubmitEvent) {
    event.preventDefault();

    if (this.validateForm()) {
      const scenario = this.scenarioSelect?.value;
      const selectedDifficultyInput = this.difficultyOptionsList?.value;

      if (scenario && selectedDifficultyInput) {
        const navigationPath = `/quiz?scenario=${encodeURIComponent(
          scenario
        )}&difficulty=${encodeURIComponent(selectedDifficultyInput)}`;
        App.navigate(navigationPath);
      }
    }
  }

  private validateForm(): boolean {
    let isValid = true;

    if (!this.scenarioSelect || this.scenarioSelect.value === "") {
      this.showError(
        this.scenarioSelect,
        this.scenarioError,
        "Please select a scenario."
      );
      isValid = false;
    } else {
      this.clearError(this.scenarioSelect, this.scenarioError);
    }

    if (
      !this.difficultyOptionsList ||
      this.difficultyOptionsList.value === ""
    ) {
      this.showError(
        this.difficultyOptionsList,
        this.difficultyError,
        "Please select a difficulty level."
      );
      isValid = false;
    } else {
      this.clearError(this.difficultyFieldset, this.difficultyError);
    }

    return isValid;
  }

  private showError(
    inputElement: HTMLElement | null,
    errorElement: HTMLElement | null,
    message: string
  ) {
    if (errorElement) {
      errorElement.textContent = message;
    }
    inputElement?.classList.add("invalid");
    if (inputElement?.tagName === "FIELDSET") {
      inputElement.classList.add("invalid");
    } else if (inputElement) {
      inputElement.classList.add("invalid");
    }
  }

  private clearError(
    inputElement: HTMLElement | null,
    errorElement: HTMLElement | null
  ) {
    if (errorElement) {
      errorElement.textContent = "";
    }
    inputElement?.classList.remove("invalid");
    if (inputElement?.tagName === "FIELDSET") {
      inputElement.classList.remove("invalid");
    } else if (inputElement) {
      inputElement.classList.remove("invalid");
    }
  }
}

customElements.define("home-view", HomeView);
