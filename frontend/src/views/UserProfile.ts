import { loadTemplate } from "../utils/load-template.js";
import { apiService, App } from "../main.js";
import { Role } from "../types/global-types.js";

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

      const profileSection = document.createElement("section");
      profileSection.id = "user-profile-section";
      this.shadowRoot?.appendChild(profileSection);

      const manageSection = document.createElement("section");
      manageSection.id = "manage-users-section";
      this.shadowRoot?.appendChild(manageSection);

      const homeButton = document.createElement("button");
      homeButton.textContent = "Home";
      homeButton.addEventListener("click", () => {
        App.navigate("/");
      });
      this.shadowRoot?.appendChild(homeButton);

      this.loadUserProfile();
    } else {
      console.error("Failed to load user profile template.");
    }
  }

  async loadUserProfile() {
    try {
      const response = await apiService.get("/users/me");
      const user = (response as any).user;

      this.renderProfile(user);

      if (user.roles.includes("User manager")) {
        this.addManageUsersSection();
      }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      const errorMsg = document.createElement("p");
      errorMsg.textContent = "Unable to load profile.";
      this.shadowRoot
        ?.getElementById("user-profile-section")
        ?.appendChild(errorMsg);
    }
  }

  renderProfile(user: any) {
    const profileSection = this.shadowRoot!.getElementById(
      "user-profile-section"
    )!;
    profileSection.innerHTML = `
      <h2>User Profile</h2>
      <p><strong>Full Name:</strong> <span id="full-name">${user.given_name} ${
      user.family_name
    }</span></p>
      <p><strong>Email:</strong> <span id="email">${user.email}</span></p>
      <p><strong>Roles:</strong></p>
      <ul id="roles">
        ${user.roles.map((role: string) => `<li>${role}</li>`).join("")}
      </ul>
    `;
  }

  async addManageUsersSection() {
    const shadow = this.shadowRoot!;
    const manageContainer = shadow.getElementById("manage-users-section")!;
    manageContainer.innerHTML = ""; 

    const section = document.createElement("section");

    const heading = document.createElement("h3");
    heading.textContent = "Manage Users";
    section.appendChild(heading);

    const users = await apiService.get("/admin/users");
    const roles: Role[] = await apiService.get("/admin/roles");

    const table = document.createElement("table");

    const thead = document.createElement("thead");
    const headRow = document.createElement("tr");
    ["Name", "Roles", "Assign/Unassign Role"].forEach((text) => {
      const th = document.createElement("th");
      th.textContent = text;
      headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement("tbody");

    for (const user of users as any[]) {
      const row = document.createElement("tr");

      const nameCell = document.createElement("td");
      nameCell.textContent = `${user.name} ${user.surname ?? ""}`.trim();
      row.appendChild(nameCell);

      const rolesCell = document.createElement("td");
      rolesCell.textContent = user.roles.join(", ");
      row.appendChild(rolesCell);

      const assignTd = document.createElement("td");

      const roleSelect = document.createElement("select");
      roleSelect.name = "role";
      for (const role of roles) {
        const option = document.createElement("option");
        option.value = role.role_id.toString();
        option.textContent = role.role_name;
        roleSelect.appendChild(option);
      }

      const assignButton = document.createElement("button");
      assignButton.textContent = "Assign";
      assignButton.addEventListener("click", async () => {
        const roleId = parseInt(roleSelect.value);
        const selectedRoleName = roles.find(
          (r) => r.role_id === roleId
        )?.role_name;

        if (user.roles.includes(selectedRoleName)) {
          alert(`${user.name} already has this role.`);
          return;
        }

        const payload = {
          user_id: user.user_id,
          role_id: roleId,
        };

        console.log("Assigning:", payload);

        try {
          await apiService.post("/admin/user-roles", payload);
          alert(`Assigned role successfully to ${user.name} ${user.surname}`);
          this.loadUserProfile(); 
        } catch (err) {
          console.error("Failed to assign role", err);
          alert("Failed to assign role");
        }
      });

      const unassignButton = document.createElement("button");
      unassignButton.textContent = "Unassign";
      unassignButton.addEventListener("click", async () => {
        const roleId = parseInt(roleSelect.value);
        const selectedRoleName = roles.find(
          (r) => r.role_id === roleId
        )?.role_name;

        if (!user.roles.includes(selectedRoleName)) {
          alert(`${user.name} ${user.surname} does not have this role.`);
          return;
        }

        const query = new URLSearchParams({
          user_id: user.user_id.toString(),
          role_id: roleId.toString(),
        });

        console.log("Unassigning:", query.toString());

        try {
          await apiService.delete(`/admin/user-roles?${query.toString()}`);
          alert(
            `Unassigned role successfully from ${user.name} ${user.surname}`
          );
          this.loadUserProfile(); 
        } catch (err) {
          console.error("Failed to unassign role", err);
          alert("Failed to unassign role");
        }
      });

      assignTd.appendChild(roleSelect);
      assignTd.appendChild(assignButton);
      assignTd.appendChild(unassignButton);
      row.appendChild(assignTd);

      tbody.appendChild(row);
    }

    table.appendChild(tbody);
    section.appendChild(table);
    manageContainer.appendChild(section);
  }
}

customElements.define("user-profile-view", UserProfileView);
