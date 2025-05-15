import { loadTemplate } from "../utils/load-template.js";
import { apiService } from "../main.js";

export class UserProfileView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.loadTemplate();
  }

  async loadTemplate() {
    const template = await loadTemplate("./templates/user-profile.view.html");
    if (template) {
      this.shadowRoot?.appendChild(template);
      this.loadUserProfile();
    } else {
      console.error("Failed to load user profile template.");
    }
  }

  async loadUserProfile() {
    try {
      const response = await apiService.get("/users/me") as UserResponse
      this.renderProfile(response);
    } catch (error) {
      console.error("Failed to fetch user profile", error);

      const fallbackMsg = document.createElement("p");
      fallbackMsg.textContent = "Unable to load profile.";

      this.shadowRoot?.querySelector("section")?.appendChild(fallbackMsg);
    }
  }

  renderProfile(response: { user: any }) {
    const user = response.user;
    const shadow = this.shadowRoot!;

    shadow.getElementById("full-name")!.textContent = `${user.given_name} ${user.family_name}`;
    shadow.getElementById("email")!.textContent = user.email;

    // Populate roles
    const rolesList = shadow.getElementById("roles")!;
    rolesList.textContent = ""; // Clear any existing (e.g., "Loading...")

    if (Array.isArray(user.roles) && user.roles.length > 0) {
      user.roles.forEach((role: string) => {
        const li = document.createElement("li");
        li.textContent = role;
        rolesList.appendChild(li);
      });
    } else {
      const li = document.createElement("li");
      li.textContent = "None";
      rolesList.appendChild(li);
    }

    // Create extra details section with <dl>
    const extraSection = document.createElement("section");
    const dl = document.createElement("dl");

    const dtUserId = document.createElement("dt");
    dtUserId.textContent = "User ID";
    const ddUserId = document.createElement("dd");
    ddUserId.textContent = user.email;

    const dtGoogleSub = document.createElement("dt");
    dtGoogleSub.textContent = "Google Subject";
    const ddGoogleSub = document.createElement("dd");
    ddGoogleSub.textContent = user.google_subject;

    dl.appendChild(dtUserId);
    dl.appendChild(ddUserId);
    dl.appendChild(dtGoogleSub);
    dl.appendChild(ddGoogleSub);

    extraSection.appendChild(dl);
    shadow.querySelector("section")?.appendChild(extraSection);
  }
}

customElements.define("user-profile-view", UserProfileView);