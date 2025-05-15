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
      const user = await apiService.get("/users/me"); 
      this.renderUserProfile(user);
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      this.shadowRoot?.querySelector("section")?.insertAdjacentHTML(
        "beforeend",
        `<p>Unable to load profile.</p>`
      );
    }
  }

  renderUserProfile(user: any) {
    const section = this.shadowRoot?.querySelector("section");
    if (!section) return;

    section.innerHTML += `
      <article>
        <header>
          <h2>${user.name} ${user.surname}</h2>
          <p>${user.email}</p>
        </header>
        <dl>
          <dt>User ID</dt>
          <dd>${user.user_id}</dd>

          <dt>Google Subject</dt>
          <dd>${user.google_subject}</dd>

          <dt>Roles</dt>
          <dd>
            <ul>
              ${user.roles?.map((role: string) => `<li>${role}</li>`).join("")}
            </ul>
          </dd>
        </dl>
      </article>
    `;
  }
}

customElements.define("user-profile-view", UserProfileView);
