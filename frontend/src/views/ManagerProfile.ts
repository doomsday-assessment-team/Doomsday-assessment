import { loadTemplate } from "../utils/load-template.js";
import { apiService, App } from "../main.js";
import type { Role } from "../types/global-types.js";
import { NotificationService } from "../utils/notification-service.js";

export class ManagerProfileView extends HTMLElement {
  private notificationService: NotificationService;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.notificationService = new NotificationService();
    this.initialize();
  }

  async initialize() {
    try {
      await this.loadTemplate();
    } catch (error) {
      console.error("Failed to initialize manager profile view:", error);
      this.renderError("Failed to initialize view");
    }
  }

  async loadTemplate() {
    try {
      const template = await loadTemplate(
        "./templates/manager-profile.view.html"
      );

      if (template) {
        this.shadowRoot?.appendChild(template);
        await this.buildUserInterface();
      } else {
        throw new Error("Template not found");
      }
    } catch (error) {
      console.error("Failed to load template:", error);
      throw error;
    }
  }

  async buildUserInterface() {
    const container = document.createElement("main");
    container.className = "container";
    this.shadowRoot?.appendChild(container);

    const header = document.createElement("header");
    header.className = "main-header";

    const logo = document.createElement("h1");
    logo.className = "logo";
    logo.textContent = "USER MANAGEMENT CONSOLE";
    header.appendChild(logo);

    const userAvatar = document.createElement("figure");
    userAvatar.className = "user-avatar";
    userAvatar.setAttribute("aria-label", "View your profile");
    userAvatar.setAttribute("title", "View your profile");
    userAvatar.addEventListener("click", () => {
      App.navigate("/user-profile");
    });
    header.appendChild(userAvatar);

    container.appendChild(header);

    const manageSection = document.createElement("section");
    manageSection.id = "manage-users-section";
    manageSection.className = "manage-section";
    container.appendChild(manageSection);

    const actionBar = document.createElement("nav");
    actionBar.className = "action-bar";
    actionBar.setAttribute("aria-label", "Navigation");

    const homeButton = document.createElement("a");
    homeButton.className = "action-button";
    homeButton.setAttribute("aria-label", "Go to home page");
    homeButton.href = "#/";
    homeButton.role = "button";

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("xmlns", svgNS);
    svg.setAttribute("width", "16");
    svg.setAttribute("height", "16");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");

    const path = document.createElementNS(svgNS, "path");
    path.setAttribute("d", "M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z");
    svg.appendChild(path);

    const polyline = document.createElementNS(svgNS, "polyline");
    polyline.setAttribute("points", "9 22 9 12 15 12 15 22");
    svg.appendChild(polyline);

    homeButton.appendChild(svg);

    const buttonText = document.createTextNode(" Home");
    homeButton.appendChild(buttonText);

    actionBar.appendChild(homeButton);

    container.appendChild(actionBar);

    const radiationOverlay = document.createElement("aside");
    radiationOverlay.className = "radiation-overlay";
    radiationOverlay.setAttribute("aria-hidden", "true");
    this.shadowRoot?.appendChild(radiationOverlay);

    const glitchEffect = document.createElement("aside");
    glitchEffect.className = "glitch-effect";
    glitchEffect.setAttribute("aria-hidden", "true");
    this.shadowRoot?.appendChild(glitchEffect);

    await this.loadUserProfile();
    await this.loadManageUsersSection();
    this.setupGlitchEffects();
  }

  setupGlitchEffects() {
    setInterval(() => {
      const glitchEffect = this.shadowRoot?.querySelector(".glitch-effect");
      if (glitchEffect) {
        glitchEffect.setAttribute("style", "animation: glitch 2s;");

        setTimeout(() => {
          glitchEffect.setAttribute("style", "animation: none;");
        }, 2000);
      }
    }, Math.random() * 10000 + 5000);

    const flicker = () => {
      if (Math.random() > 0.97) {
        this.shadowRoot?.host.classList.add("flicker");
        setTimeout(() => {
          this.shadowRoot?.host.classList.remove("flicker");
        }, 150);
      }
    };

    setInterval(flicker, 500);
  }

  async loadUserProfile() {
    try {
      const response = await apiService.get("/users/me");
      const user = (response as any).user;

      const userAvatar = this.shadowRoot?.querySelector(".user-avatar");
      if (userAvatar) {
        const initials = `${user.given_name.charAt(0)}${user.family_name
          .charAt(0)
          .toUpperCase()}`;
        userAvatar.textContent = initials;
      }
    } catch (error) {
      console.error("Failed to fetch user profile", error);
      this.renderError("Unable to load profile. Connection lost.");
    }
  }

  renderError(message: string) {
    const errorMsg = document.createElement("section");
    errorMsg.className = "error-message";
    errorMsg.setAttribute("role", "alert");
    errorMsg.setAttribute("aria-live", "assertive");

    const svgNS = "http://www.w3.org/2000/svg";
    const svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("xmlns", svgNS);
    svg.setAttribute("width", "24");
    svg.setAttribute("height", "24");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.setAttribute("aria-hidden", "true");

    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", "12");
    circle.setAttribute("cy", "12");
    circle.setAttribute("r", "10");
    svg.appendChild(circle);

    const line1 = document.createElementNS(svgNS, "line");
    line1.setAttribute("x1", "12");
    line1.setAttribute("y1", "8");
    line1.setAttribute("x2", "12");
    line1.setAttribute("y2", "12");
    svg.appendChild(line1);

    const line2 = document.createElementNS(svgNS, "line");
    line2.setAttribute("x1", "12");
    line2.setAttribute("y1", "16");
    line2.setAttribute("x2", "12.01");
    line2.setAttribute("y2", "16");
    svg.appendChild(line2);

    errorMsg.appendChild(svg);

    const errorText = document.createElement("p");
    errorText.textContent = message;
    errorMsg.appendChild(errorText);

    const container =
      this.shadowRoot?.querySelector(".container") || this.shadowRoot;
    container?.appendChild(errorMsg);
  }

  async loadManageUsersSection() {
    const shadow = this.shadowRoot!;
    const manageContainer = shadow.getElementById("manage-users-section")!;

    while (manageContainer.firstChild) {
      manageContainer.removeChild(manageContainer.firstChild);
    }

    const searchContainer = document.createElement("div");
    searchContainer.className = "search-container";

    const filterBar = document.createElement("form");
    filterBar.className = "filter-bar";
    filterBar.setAttribute("role", "search");
    filterBar.addEventListener("submit", (e) => e.preventDefault());

    const filterLabel = document.createElement("legend");
    filterLabel.className = "filter-label";

    const svgNS = "http://www.w3.org/2000/svg";
    const filterSvg = document.createElementNS(svgNS, "svg");
    filterSvg.setAttribute("xmlns", svgNS);
    filterSvg.setAttribute("width", "16");
    filterSvg.setAttribute("height", "16");
    filterSvg.setAttribute("viewBox", "0 0 24 24");
    filterSvg.setAttribute("fill", "none");
    filterSvg.setAttribute("stroke", "currentColor");
    filterSvg.setAttribute("stroke-width", "2");
    filterSvg.setAttribute("stroke-linecap", "round");
    filterSvg.setAttribute("stroke-linejoin", "round");
    filterSvg.setAttribute("aria-hidden", "true");

    const polygon = document.createElementNS(svgNS, "polygon");
    polygon.setAttribute(
      "points",
      "22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"
    );
    filterSvg.appendChild(polygon);

    filterLabel.appendChild(filterSvg);

    const filterText = document.createTextNode(" Filters:");
    filterLabel.appendChild(filterText);

    filterBar.appendChild(filterLabel);

    const searchBox = document.createElement("fieldset");
    searchBox.className = "search-box";

    const searchLabel = document.createElement("label");
    searchLabel.setAttribute("for", "search-input");
    searchLabel.className = "sr-only";
    searchLabel.textContent = "Search users";
    searchBox.appendChild(searchLabel);

    const searchIcon = document.createElement("span");
    searchIcon.className = "search-icon";
    searchIcon.setAttribute("aria-hidden", "true");

    const searchSvg = document.createElementNS(svgNS, "svg");
    searchSvg.setAttribute("xmlns", svgNS);
    searchSvg.setAttribute("width", "16");
    searchSvg.setAttribute("height", "16");
    searchSvg.setAttribute("viewBox", "0 0 24 24");
    searchSvg.setAttribute("fill", "none");
    searchSvg.setAttribute("stroke", "currentColor");
    searchSvg.setAttribute("stroke-width", "2");
    searchSvg.setAttribute("stroke-linecap", "round");
    searchSvg.setAttribute("stroke-linejoin", "round");

    const circle = document.createElementNS(svgNS, "circle");
    circle.setAttribute("cx", "11");
    circle.setAttribute("cy", "11");
    circle.setAttribute("r", "8");
    searchSvg.appendChild(circle);

    const line = document.createElementNS(svgNS, "line");
    line.setAttribute("x1", "21");
    line.setAttribute("y1", "21");
    line.setAttribute("x2", "16.65");
    line.setAttribute("y2", "16.65");
    searchSvg.appendChild(line);

    searchIcon.appendChild(searchSvg);
    searchBox.appendChild(searchIcon);

    const searchInput = document.createElement("input");
    searchInput.type = "search";
    searchInput.className = "search-input";
    searchInput.placeholder = "Search users...";
    searchInput.id = "search-input";
    searchInput.setAttribute("aria-label", "Search users");
    searchBox.appendChild(searchInput);

    filterBar.appendChild(searchBox);
    searchContainer.appendChild(filterBar);
    manageContainer.appendChild(searchContainer);

    try {
      const users = await apiService.get("/admin/users");
      const roles: Role[] = await apiService.get("/admin/roles");

      const usersGrid = document.createElement("ul");
      usersGrid.className = "users-grid";
      usersGrid.setAttribute("role", "list");

      for (const user of users as any[]) {
        const userCard = document.createElement("li");
        userCard.className = "user-card";

        const userCardContent = document.createElement("article");

        const userHeader = document.createElement("header");
        userHeader.className = "user-header";

        const initials = `${user.name.charAt(0)}${
          user.surname ? user.surname.charAt(0).toUpperCase() : ""
        }`;

        const userAvatar = document.createElement("figure");
        userAvatar.className = "user-avatar-large";
        userAvatar.textContent = initials;
        userAvatar.setAttribute("aria-label", `User initials: ${initials}`);
        userHeader.appendChild(userAvatar);

        const userDetails = document.createElement("article");
        userDetails.className = "user-details";

        const userTitle = document.createElement("h3");
        userTitle.className = "user-title";
        userTitle.textContent = `${user.name} ${user.surname ?? ""}`;
        userDetails.appendChild(userTitle);

        userHeader.appendChild(userDetails);
        userCardContent.appendChild(userHeader);

        const rolesSection = document.createElement("section");
        rolesSection.className = "roles-section";

        const sectionTitle = document.createElement("h4");
        sectionTitle.className = "section-title";
        sectionTitle.textContent = "Current Roles:";
        rolesSection.appendChild(sectionTitle);

        const rolesContainer = document.createElement("ul");
        rolesContainer.className = "roles-container";
        rolesContainer.setAttribute("role", "list");

        if (user.roles.length > 0) {
          for (const role of user.roles) {
            const roleChip = document.createElement("li");
            roleChip.className = "role-chip";
            roleChip.textContent = role;
            rolesContainer.appendChild(roleChip);
          }
        } else {
          const noRoles = document.createElement("li");
          noRoles.className = "no-roles";
          noRoles.textContent = "No assigned roles";
          rolesContainer.appendChild(noRoles);
        }

        rolesSection.appendChild(rolesContainer);
        userCardContent.appendChild(rolesSection);

        const roleManagement = document.createElement("form");
        roleManagement.className = "role-management";
        roleManagement.addEventListener("submit", (e) => e.preventDefault());

        const selectWrapper = document.createElement("fieldset");
        selectWrapper.className = "select-wrapper";

        const selectLabel = document.createElement("label");
        selectLabel.className = "select-label";
        selectLabel.textContent = "Select role:";
        selectLabel.setAttribute("for", `role-select-${user.user_id}`);
        selectWrapper.appendChild(selectLabel);

        const roleSelect = document.createElement("select");
        roleSelect.className = "filter-select";
        roleSelect.name = "role";
        roleSelect.id = `role-select-${user.user_id}`;

        for (const role of roles) {
          const option = document.createElement("option");
          option.value = role.role_id.toString();
          option.textContent = role.role_name;
          roleSelect.appendChild(option);
        }

        selectWrapper.appendChild(roleSelect);
        roleManagement.appendChild(selectWrapper);

        const actionButtons = document.createElement("menu");
        actionButtons.className = "action-buttons";
        actionButtons.setAttribute("type", "toolbar");

        const assignButton = document.createElement("button");
        assignButton.className = "action-button assign-button";
        assignButton.setAttribute("aria-label", "Assign role");
        assignButton.type = "button";

        const assignSvg = document.createElementNS(svgNS, "svg");
        assignSvg.setAttribute("xmlns", svgNS);
        assignSvg.setAttribute("width", "16");
        assignSvg.setAttribute("height", "16");
        assignSvg.setAttribute("viewBox", "0 0 24 24");
        assignSvg.setAttribute("fill", "none");
        assignSvg.setAttribute("stroke", "currentColor");
        assignSvg.setAttribute("stroke-width", "2");
        assignSvg.setAttribute("stroke-linecap", "round");
        assignSvg.setAttribute("stroke-linejoin", "round");
        assignSvg.setAttribute("aria-hidden", "true");

        const assignPath1 = document.createElementNS(svgNS, "path");
        assignPath1.setAttribute("d", "M12 5v14");
        assignSvg.appendChild(assignPath1);

        const assignPath2 = document.createElementNS(svgNS, "path");
        assignPath2.setAttribute("d", "M5 12h14");
        assignSvg.appendChild(assignPath2);

        assignButton.appendChild(assignSvg);

        const assignText = document.createTextNode(" Assign");
        assignButton.appendChild(assignText);

        assignButton.addEventListener("click", async () => {
          const roleId = Number.parseInt(roleSelect.value);
          const selectedRoleName = roles.find(
            (r) => r.role_id === roleId
          )?.role_name;

          if (user.roles.includes(selectedRoleName)) {
            this.notificationService.showNotification({
              type: "warning",
              title: "Role Already Assigned",
              message: `${user.name} already has the ${selectedRoleName} role.`,
            });
            return;
          }

          const payload = {
            user_id: user.user_id,
            role_id: roleId,
          };

          try {
            await apiService.post("/admin/user-roles", payload);
            this.notificationService.showNotification({
              type: "success",
              title: "Role Assigned",
              message: `Successfully assigned ${selectedRoleName} role to ${user.name} ${user.surname}`,
            });
            this.loadManageUsersSection();
          } catch (err) {
            console.error("Failed to assign role", err);
            this.notificationService.showNotification({
              type: "error",
              title: "Assignment Failed",
              message: `Failed to assign ${selectedRoleName} role to ${user.name}`,
            });
          }
        });

        const unassignButton = document.createElement("button");
        unassignButton.className = "action-button unassign-button";
        unassignButton.setAttribute("aria-label", "Unassign role");
        unassignButton.type = "button";

        const unassignSvg = document.createElementNS(svgNS, "svg");
        unassignSvg.setAttribute("xmlns", svgNS);
        unassignSvg.setAttribute("width", "16");
        unassignSvg.setAttribute("height", "16");
        unassignSvg.setAttribute("viewBox", "0 0 24 24");
        unassignSvg.setAttribute("fill", "none");
        unassignSvg.setAttribute("stroke", "currentColor");
        unassignSvg.setAttribute("stroke-width", "2");
        unassignSvg.setAttribute("stroke-linecap", "round");
        unassignSvg.setAttribute("stroke-linejoin", "round");
        unassignSvg.setAttribute("aria-hidden", "true");

        const unassignPath = document.createElementNS(svgNS, "path");
        unassignPath.setAttribute("d", "M5 12h14");
        unassignSvg.appendChild(unassignPath);

        unassignButton.appendChild(unassignSvg);

        const unassignText = document.createTextNode(" Unassign");
        unassignButton.appendChild(unassignText);

        unassignButton.addEventListener("click", async () => {
          const roleId = Number.parseInt(roleSelect.value);
          const selectedRoleName = roles.find(
            (r) => r.role_id === roleId
          )?.role_name;

          if (!user.roles.includes(selectedRoleName)) {
            this.notificationService.showNotification({
              type: "warning",
              title: "Role Not Assigned",
              message: `${user.name} does not have the ${selectedRoleName} role.`,
            });
            return;
          }

          const query = new URLSearchParams({
            user_id: user.user_id.toString(),
            role_id: roleId.toString(),
          });

          try {
            await apiService.delete(`/admin/user-roles?${query.toString()}`);
            this.notificationService.showNotification({
              type: "success",
              title: "Role Unassigned",
              message: `Successfully removed ${selectedRoleName} role from ${user.name} ${user.surname}`,
            });
            this.loadManageUsersSection();
          } catch (err) {
            console.error("Failed to unassign role", err);
            this.notificationService.showNotification({
              type: "error",
              title: "Unassignment Failed",
              message: `Failed to remove ${selectedRoleName} role from ${user.name}`,
            });
          }
        });

        actionButtons.appendChild(assignButton);
        actionButtons.appendChild(unassignButton);

        roleManagement.appendChild(actionButtons);
        userCardContent.appendChild(roleManagement);

        userCard.appendChild(userCardContent);
        usersGrid.appendChild(userCard);
      }

      manageContainer.appendChild(usersGrid);

      const searchInputElement = shadow.getElementById("search-input");
      if (searchInputElement) {
        searchInputElement.addEventListener("input", (e) => {
          const target = e.target as HTMLInputElement;
          const searchTerm = target.value.toLowerCase();
          const userCards = shadow.querySelectorAll(".user-card");

          userCards.forEach((card) => {
            const userName =
              card.querySelector(".user-title")?.textContent?.toLowerCase() ||
              "";
            if (userName.includes(searchTerm)) {
              (card as HTMLElement).style.display = "block";
            } else {
              (card as HTMLElement).style.display = "none";
            }
          });
        });
      }
    } catch (error) {
      console.error("Failed to fetch users or roles", error);
      this.notificationService.showNotification({
        type: "error",
        title: "Access Denied",
        message: "Unable to load users. Access denied or connection lost.",
      });
    }
  }
}

customElements.define("manager-profile-view", ManagerProfileView);
