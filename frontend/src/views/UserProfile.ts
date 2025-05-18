import { loadTemplate } from "../utils/load-template.js";
import { apiService, App } from "../main.js";
import type { Role } from "../types/global-types.js";

export class UserProfileView extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.initialize();
  }

  async initialize() {
    try {
      await this.loadTemplate();
    } catch (error) {
      console.error("Failed to initialize user profile view:", error);
      this.renderError("Failed to initialize view");
    }
  }

  async loadTemplate() {
    try {
      const template = await loadTemplate("./templates/user-profile.view.html");

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

    // Create header
    const header = document.createElement("header");

    const logo = document.createElement("h1");
    logo.className = "logo";

    const logoText = document.createTextNode("USER PROFILE");
    logo.appendChild(logoText);

    header.appendChild(logo);

    // Add user info to header
    const userInfo = document.createElement("aside");
    userInfo.className = "user-info";
    userInfo.setAttribute("aria-label", "Current user information");
    header.appendChild(userInfo);

    container.appendChild(header);

    // Create profile section
    const profileSection = document.createElement("section");
    profileSection.id = "user-profile-section";
    profileSection.className = "profile-section";
    profileSection.setAttribute("aria-labelledby", "profile-section-heading");

    // Add a visually hidden heading for screen readers
    const profileHeading = document.createElement("h2");
    profileHeading.id = "profile-section-heading";
    profileHeading.className = "sr-only";
    profileHeading.textContent = "User Profile";
    profileSection.appendChild(profileHeading);

    container.appendChild(profileSection);

    // Create manage users section
    const manageSection = document.createElement("section");
    manageSection.id = "manage-users-section";
    manageSection.className = "manage-section";
    manageSection.setAttribute("aria-labelledby", "manage-section-heading");
    container.appendChild(manageSection);

    // Create home button
    const actionBar = document.createElement("nav");
    actionBar.className = "action-bar";
    actionBar.setAttribute("aria-label", "Navigation");

    const homeButton = document.createElement("a");
    homeButton.className = "action-button";
    homeButton.setAttribute("aria-label", "Go to home page");
    homeButton.href = "/";
    homeButton.role = "button";

    // Create SVG for home button
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

    homeButton.addEventListener("click", (e) => {
      e.preventDefault();
      App.navigate("/");
    });

    actionBar.appendChild(homeButton);
    container.appendChild(actionBar);

    // Add radiation overlay for effect
    const radiationOverlay = document.createElement("div");
    radiationOverlay.className = "radiation-overlay";
    radiationOverlay.setAttribute("aria-hidden", "true");
    this.shadowRoot?.appendChild(radiationOverlay);

    // Add glitch effect
    const glitchEffect = document.createElement("div");
    glitchEffect.className = "glitch-effect";
    glitchEffect.setAttribute("aria-hidden", "true");
    this.shadowRoot?.appendChild(glitchEffect);

    await this.loadUserProfile();
    this.setupGlitchEffects();
  }

  setupGlitchEffects() {
    // Glitch effect
    setInterval(() => {
      const glitchEffect = this.shadowRoot?.querySelector(".glitch-effect");
      if (glitchEffect) {
        glitchEffect.setAttribute("style", "animation: glitch 2s;");

        setTimeout(() => {
          glitchEffect.setAttribute("style", "animation: none;");
        }, 2000);
      }
    }, Math.random() * 10000 + 5000);

    // Add flickering effect to lights
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

      this.renderProfile(user);

      if (user.roles.includes("User manager")) {
        this.addManageUsersSection();
      }

      // Update user info in header
      const userInfo = this.shadowRoot?.querySelector(".user-info");
      if (userInfo) {
        const initials = `${user.given_name.charAt(0)}${user.family_name.charAt(
          0
        )}`;

        // Clear existing content
        while (userInfo.firstChild) {
          userInfo.removeChild(userInfo.firstChild);
        }

        const avatar = document.createElement("figure");
        avatar.className = "user-avatar";
        avatar.textContent = initials;
        avatar.setAttribute("aria-label", `User initials: ${initials}`);
        userInfo.appendChild(avatar);

        const userName = document.createElement("p");
        userName.className = "user-name";
        userName.textContent = `${user.given_name} ${user.family_name}`;
        userInfo.appendChild(userName);
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

  async renderProfile(user: any) {
    const profileSection = this.shadowRoot!.getElementById(
      "user-profile-section"
    )!;

    // Clear existing content
    while (profileSection.firstChild) {
      profileSection.removeChild(profileSection.firstChild);
    }

    // Add a visually hidden heading for screen readers
    const profileHeading = document.createElement("h2");
    profileHeading.id = "profile-section-heading";
    profileHeading.className = "sr-only";
    profileHeading.textContent = "User Profile";
    profileSection.appendChild(profileHeading);

    // Create stats grid
    const statsGrid = document.createElement("ul");
    statsGrid.className = "stats-grid";
    statsGrid.setAttribute("role", "list");

    // User info card
    const userCard = document.createElement("li");
    userCard.className = "stat-card";

    const userCardContent = document.createElement("article");

    const userLabel = document.createElement("h3");
    userLabel.className = "stat-label";
    userLabel.textContent = "IDENTITY";
    userCardContent.appendChild(userLabel);

    const userName = document.createElement("output");
    userName.className = "stat-value";
    userName.textContent = `${user.given_name} ${user.family_name}`;
    userCardContent.appendChild(userName);

    const userTrend = document.createElement("footer");
    userTrend.className = "stat-trend";

    const userTrendLabel = document.createElement("strong");
    userTrendLabel.textContent = "CLEARANCE LEVEL:";
    userTrend.appendChild(userTrendLabel);

    const userTrendValue = document.createTextNode(
      user.roles.includes("User manager") ? " User Manager" : " User"
    );
    userTrend.appendChild(userTrendValue);

    userCardContent.appendChild(userTrend);
    userCard.appendChild(userCardContent);
    statsGrid.appendChild(userCard);

    // Email card
    const emailCard = document.createElement("li");
    emailCard.className = "stat-card";

    const emailCardContent = document.createElement("article");

    const emailLabel = document.createElement("h3");
    emailLabel.className = "stat-label";
    emailLabel.textContent = "CONTACT";
    emailCardContent.appendChild(emailLabel);

    const emailValue = document.createElement("output");
    emailValue.className = "stat-value";
    emailValue.style.fontSize = "18px";
    emailValue.style.wordBreak = "break-all";
    emailValue.textContent = user.email;
    emailCardContent.appendChild(emailValue);

    const emailTrend = document.createElement("footer");
    emailTrend.className = "stat-trend";

    const emailTrendLabel = document.createElement("strong");
    emailTrendLabel.textContent = "VERIFIED";
    emailTrend.appendChild(emailTrendLabel);

    emailCardContent.appendChild(emailTrend);
    emailCard.appendChild(emailCardContent);
    statsGrid.appendChild(emailCard);

    // Roles card
    const rolesCard = document.createElement("li");
    rolesCard.className = "stat-card";

    const rolesCardContent = document.createElement("article");

    const rolesLabel = document.createElement("h3");
    rolesLabel.className = "stat-label";
    rolesLabel.textContent = "ASSIGNED ROLES";
    rolesCardContent.appendChild(rolesLabel);

    const rolesValue = document.createElement("output");
    rolesValue.className = "stat-value";
    rolesValue.textContent = user.roles.length.toString();
    rolesCardContent.appendChild(rolesValue);

    const rolesList = document.createElement("ul");
    rolesList.className = "roles-list";
    rolesList.setAttribute("role", "list");

    for (const role of user.roles) {
      const roleBadge = document.createElement("li");
      roleBadge.className = "role-badge";
      roleBadge.textContent = role;
      rolesList.appendChild(roleBadge);
    }

    rolesCardContent.appendChild(rolesList);
    rolesCard.appendChild(rolesCardContent);
    statsGrid.appendChild(rolesCard);

    // Last login card
    const loginCard = document.createElement("li");
    loginCard.className = "stat-card";

    const loginCardContent = document.createElement("article");

    const loginLabel = document.createElement("h3");
    loginLabel.className = "stat-label";
    loginLabel.textContent = "LAST LOGIN";
    loginCardContent.appendChild(loginLabel);

    const loginValue = document.createElement("output");
    loginValue.className = "stat-value";
    loginValue.textContent = "Today";
    loginCardContent.appendChild(loginValue);

    const loginTrend = document.createElement("footer");
    loginTrend.className = "stat-trend";

    const loginTrendLabel = document.createElement("strong");
    loginTrendLabel.textContent = "IP:";
    loginTrend.appendChild(loginTrendLabel);

    try {
      const response = await apiService.get<IpResponse>("/users/get-ip");

      if (response && response.ip) {
        const ip = response.ip === "::1" ? "127.0.0.1" : response.ip;
        const loginTrendValue = document.createTextNode(` ${ip}`);
        loginTrend.appendChild(loginTrendValue);
      } else {
        console.warn("IP not found in response", response);
      }
    } catch (error) {
      console.error("Failed to fetch IP address:", error);
    }

    loginCardContent.appendChild(loginTrend);
    loginCard.appendChild(loginCardContent);
    statsGrid.appendChild(loginCard);

    profileSection.appendChild(statsGrid);
  }

  async addManageUsersSection() {
    const shadow = this.shadowRoot!;
    const manageContainer = shadow.getElementById("manage-users-section")!;

    // Clear existing content
    while (manageContainer.firstChild) {
      manageContainer.removeChild(manageContainer.firstChild);
    }

    // Create section header
    const sectionHeader = document.createElement("header");
    sectionHeader.className = "section-header";

    const heading = document.createElement("h2");
    heading.id = "manage-section-heading";
    heading.textContent = "USER MANAGEMENT CONSOLE";

    sectionHeader.appendChild(heading);

    const subtitle = document.createElement("p");
    subtitle.className = "section-subtitle";
    subtitle.textContent = "Authorized access only - All actions are logged";
    sectionHeader.appendChild(subtitle);

    manageContainer.appendChild(sectionHeader);

    // Create filter bar
    const filterBar = document.createElement("form");
    filterBar.className = "filter-bar";
    filterBar.setAttribute("role", "search");
    filterBar.addEventListener("submit", (e) => e.preventDefault());

    const filterLabel = document.createElement("legend");
    filterLabel.className = "filter-label";

    // Create SVG for filter icon
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

    // Create SVG for search icon
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
    manageContainer.appendChild(filterBar);

    try {
      const users = await apiService.get("/admin/users");
      const roles: Role[] = await apiService.get("/admin/roles");

      // Create users grid
      const usersGrid = document.createElement("ul");
      usersGrid.className = "users-grid";
      usersGrid.setAttribute("role", "list");

      for (const user of users as any[]) {
        const userCard = document.createElement("li");
        userCard.className = "user-card";

        const userCardContent = document.createElement("article");

        // User card header
        const userHeader = document.createElement("header");
        userHeader.className = "user-header";

        const initials = `${user.name.charAt(0)}${
          user.surname ? user.surname.charAt(0) : ""
        }`;

        const userAvatar = document.createElement("figure");
        userAvatar.className = "user-avatar-large";
        userAvatar.textContent = initials;
        userAvatar.setAttribute("aria-label", `User initials: ${initials}`);
        userHeader.appendChild(userAvatar);

        const userDetails = document.createElement("div");
        userDetails.className = "user-details";

        const userTitle = document.createElement("h3");
        userTitle.className = "user-title";
        userTitle.textContent = `${user.name} ${user.surname ?? ""}`;
        userDetails.appendChild(userTitle);

        const userMeta = document.createElement("dl");
        userMeta.className = "user-meta";

        const metaItem = document.createElement("div");
        metaItem.className = "meta-item";

        // Create SVG for user icon
        const userSvg = document.createElementNS(svgNS, "svg");
        userSvg.setAttribute("xmlns", svgNS);
        userSvg.setAttribute("width", "14");
        userSvg.setAttribute("height", "14");
        userSvg.setAttribute("viewBox", "0 0 24 24");
        userSvg.setAttribute("fill", "none");
        userSvg.setAttribute("stroke", "currentColor");
        userSvg.setAttribute("stroke-width", "2");
        userSvg.setAttribute("stroke-linecap", "round");
        userSvg.setAttribute("stroke-linejoin", "round");
        userSvg.setAttribute("aria-hidden", "true");

        const userPath = document.createElementNS(svgNS, "path");
        userPath.setAttribute("d", "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2");
        userSvg.appendChild(userPath);

        const userCircle = document.createElementNS(svgNS, "circle");
        userCircle.setAttribute("cx", "12");
        userCircle.setAttribute("cy", "7");
        userCircle.setAttribute("r", "4");
        userSvg.appendChild(userCircle);

        metaItem.appendChild(userSvg);

        const metaLabel = document.createElement("dt");
        metaLabel.className = "sr-only";
        metaLabel.textContent = "User ID";
        metaItem.appendChild(metaLabel);

        const metaValue = document.createElement("dd");
        metaValue.textContent = `ID: ${user.user_id}`;
        metaItem.appendChild(metaValue);

        userMeta.appendChild(metaItem);
        userDetails.appendChild(userMeta);

        userHeader.appendChild(userDetails);
        userCardContent.appendChild(userHeader);

        // User roles section
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

        // Role management section
        const roleManagement = document.createElement("form");
        roleManagement.className = "role-management";
        roleManagement.addEventListener("submit", (e) => e.preventDefault());

        // Create a wrapper for the select element
        const selectWrapper = document.createElement("fieldset");
        selectWrapper.className = "select-wrapper";

        // Add a label for the select
        const selectLabel = document.createElement("label");
        selectLabel.className = "select-label";
        selectLabel.textContent = "Select role:";
        selectLabel.setAttribute("for", `role-select-${user.user_id}`);
        selectWrapper.appendChild(selectLabel);

        // Create the select element with a unique ID
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

        // Create SVG for assign button
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
            this.showNotification(
              `${user.name} already has this role.`,
              "warning"
            );
            return;
          }

          const payload = {
            user_id: user.user_id,
            role_id: roleId,
          };

          try {
            await apiService.post("/admin/user-roles", payload);
            this.showNotification(
              `Assigned role successfully to ${user.name} ${user.surname}`,
              "success"
            );
            this.loadUserProfile();
          } catch (err) {
            console.error("Failed to assign role", err);
            this.showNotification("Failed to assign role", "error");
          }
        });

        const unassignButton = document.createElement("button");
        unassignButton.className = "action-button unassign-button";
        unassignButton.setAttribute("aria-label", "Unassign role");
        unassignButton.type = "button";

        // Create SVG for unassign button
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
            this.showNotification(
              `${user.name} does not have this role.`,
              "warning"
            );
            return;
          }

          const query = new URLSearchParams({
            user_id: user.user_id.toString(),
            role_id: roleId.toString(),
          });

          try {
            await apiService.delete(`/admin/user-roles?${query.toString()}`);
            this.showNotification(
              `Unassigned role successfully from ${user.name} ${user.surname}`,
              "success"
            );
            this.loadUserProfile();
          } catch (err) {
            console.error("Failed to unassign role", err);
            this.showNotification("Failed to unassign role", "error");
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

      // Add search functionality
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
      this.renderError(
        "Unable to load users. Access denied or connection lost."
      );
    }
  }

  showNotification(message: string, type: "success" | "warning" | "error") {
    const notification = document.createElement("output");
    notification.className = `notification ${type}`;
    notification.setAttribute("role", "status");
    notification.setAttribute("aria-live", "polite");

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

    if (type === "success") {
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", "M22 11.08V12a10 10 0 1 1-5.93-9.14");
      svg.appendChild(path);

      const polyline = document.createElementNS(svgNS, "polyline");
      polyline.setAttribute("points", "22 4 12 14.01 9 11.01");
      svg.appendChild(polyline);
    } else if (type === "warning") {
      const path = document.createElementNS(svgNS, "path");
      path.setAttribute(
        "d",
        "M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
      );
      svg.appendChild(path);

      const line1 = document.createElementNS(svgNS, "line");
      line1.setAttribute("x1", "12");
      line1.setAttribute("y1", "9");
      line1.setAttribute("x2", "12");
      line1.setAttribute("y2", "13");
      svg.appendChild(line1);

      const line2 = document.createElementNS(svgNS, "line");
      line2.setAttribute("x1", "12");
      line2.setAttribute("y1", "17");
      line2.setAttribute("x2", "12.01");
      line2.setAttribute("y2", "17");
      svg.appendChild(line2);
    } else {
      const circle = document.createElementNS(svgNS, "circle");
      circle.setAttribute("cx", "12");
      circle.setAttribute("cy", "12");
      circle.setAttribute("r", "10");
      svg.appendChild(circle);

      const line1 = document.createElementNS(svgNS, "line");
      line1.setAttribute("x1", "15");
      line1.setAttribute("y1", "9");
      line1.setAttribute("x2", "9");
      line1.setAttribute("y2", "15");
      svg.appendChild(line1);

      const line2 = document.createElementNS(svgNS, "line");
      line2.setAttribute("x1", "9");
      line2.setAttribute("y1", "9");
      line2.setAttribute("x2", "15");
      line2.setAttribute("y2", "15");
      svg.appendChild(line2);
    }

    notification.appendChild(svg);

    const notificationText = document.createElement("p");
    notificationText.textContent = message;
    notification.appendChild(notificationText);

    this.shadowRoot?.appendChild(notification);

    // Auto remove after 3 seconds
    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => {
        notification.remove();
      }, 500);
    }, 3000);
  }
}

customElements.define("user-profile-view", UserProfileView);
