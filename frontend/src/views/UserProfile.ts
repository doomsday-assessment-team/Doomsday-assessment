import { loadTemplate } from "../utils/load-template.js";
import { apiService, App } from "../main.js";
import { NotificationService } from "../utils/notification-service.js";

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

    const header = document.createElement("header");
    header.className = "profile-header";

    const pageTitle = document.createElement("h1");
    pageTitle.className = "page-title";
    pageTitle.textContent = "USER PROFILE";
    header.appendChild(pageTitle);
    const userAvatar = document.createElement("figure");
    userAvatar.className = "user-avatar";
    userAvatar.setAttribute("aria-label", "User avatar");
    header.appendChild(userAvatar);

    container.appendChild(header);

    const profileGrid = document.createElement("section");
    profileGrid.className = "profile-grid";
    profileGrid.setAttribute("aria-label", "User profile information");
    container.appendChild(profileGrid);

    const identityCard = this.createProfileCard("IDENTITY", "identity-card");
    profileGrid.appendChild(identityCard);

    const contactCard = this.createProfileCard("CONTACT", "contact-card");
    profileGrid.appendChild(contactCard);

    const rolesCard = this.createProfileCard("ASSIGNED ROLES", "roles-card");
    profileGrid.appendChild(rolesCard);

    const lastLoginCard = this.createProfileCard(
      "LAST LOGIN",
      "last-login-card"
    );
    profileGrid.appendChild(lastLoginCard);

    const actionBar = document.createElement("nav");
    actionBar.className = "profile-actions";
    actionBar.setAttribute("aria-label", "Navigation");

    const homeButton = document.createElement("a");
    homeButton.className = "home-button";
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

    const logoutButton = document.createElement("button");
    logoutButton.className = "logout-button";
    logoutButton.setAttribute("aria-label", "Log out of your account");
    logoutButton.type = "button";

    const logoutSvg = document.createElementNS(svgNS, "svg");
    logoutSvg.setAttribute("xmlns", svgNS);
    logoutSvg.setAttribute("width", "16");
    logoutSvg.setAttribute("height", "16");
    logoutSvg.setAttribute("viewBox", "0 0 24 24");
    logoutSvg.setAttribute("fill", "none");
    logoutSvg.setAttribute("stroke", "currentColor");
    logoutSvg.setAttribute("stroke-width", "2");
    logoutSvg.setAttribute("stroke-linecap", "round");
    logoutSvg.setAttribute("stroke-linejoin", "round");
    logoutSvg.setAttribute("aria-hidden", "true");

    const logoutPath1 = document.createElementNS(svgNS, "path");
    logoutPath1.setAttribute("d", "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4");
    logoutSvg.appendChild(logoutPath1);

    const logoutPath2 = document.createElementNS(svgNS, "polyline");
    logoutPath2.setAttribute("points", "16 17 21 12 16 7");
    logoutSvg.appendChild(logoutPath2);

    const logoutPath3 = document.createElementNS(svgNS, "line");
    logoutPath3.setAttribute("x1", "21");
    logoutPath3.setAttribute("y1", "12");
    logoutPath3.setAttribute("x2", "9");
    logoutPath3.setAttribute("y2", "12");
    logoutSvg.appendChild(logoutPath3);

    logoutButton.appendChild(logoutSvg);

    const logoutText = document.createTextNode(" Logout");
    logoutButton.appendChild(logoutText);

    logoutButton.addEventListener("click", () => {
      this.handleLogout();
    });

    actionBar.appendChild(logoutButton);

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
    this.setupGlitchEffects();
  }

  createProfileCard(title: string, id: string) {
    const card = document.createElement("article");
    card.className = "profile-card";
    card.id = id;

    const cardHeader = document.createElement("header");
    cardHeader.className = "card-header";

    const cardTitle = document.createElement("h2");
    cardTitle.className = "card-title";
    cardTitle.textContent = title;
    cardHeader.appendChild(cardTitle);

    const cardContent = document.createElement("section");
    cardContent.className = "card-content";

    card.appendChild(cardHeader);
    card.appendChild(cardContent);

    return card;
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
      const response: UserResponse = await apiService.get("/users/me");
      const user = response.user;
      const userAvatar = this.shadowRoot?.querySelector(".user-avatar");
      if (userAvatar) {
        const initials = `${user.given_name.charAt(0)}${user.family_name
          .charAt(0)
          .toUpperCase()}`;
        userAvatar.textContent = initials;
      }

      const identityCardContent = this.shadowRoot?.querySelector(
        "#identity-card .card-content"
      );
      if (identityCardContent) {
        const nameSection = document.createElement("section");
        nameSection.className = "profile-data-section";

        const userName = document.createElement("h3");
        userName.className = "identity-name";
        userName.textContent = `${user.given_name} ${user.family_name}`;
        nameSection.appendChild(userName);

        identityCardContent.appendChild(nameSection);

        const clearanceSection = document.createElement("section");
        clearanceSection.className = "profile-data-section clearance-section";

        const clearanceLabel = document.createElement("h4");
        clearanceLabel.className = "data-label";
        clearanceLabel.textContent = "CLEARANCE LEVEL:";
        clearanceSection.appendChild(clearanceLabel);

        let highestRole = "User";
        if (Array.isArray(user.roles)) {
          if (user.roles.includes("User manager")) {
            highestRole = "User manager";
          } else if (user.roles.includes("Assessment manager")) {
            highestRole = "Assessment Manager";
          }
        }

        const clearanceValue = document.createElement("output");
        clearanceValue.className = "clearance-level";
        clearanceValue.textContent = highestRole;
        clearanceSection.appendChild(clearanceValue);

        identityCardContent.appendChild(clearanceSection);
      }

      const contactCardContent = this.shadowRoot?.querySelector(
        "#contact-card .card-content"
      );
      if (contactCardContent) {
        const emailSection = document.createElement("section");
        emailSection.className = "profile-data-section";

        const userEmail = document.createElement("output");
        userEmail.className = "user-email";
        userEmail.textContent = user.email;
        emailSection.appendChild(userEmail);

        contactCardContent.appendChild(emailSection);

        const verificationSection = document.createElement("section");
        verificationSection.className =
          "profile-data-section verification-section";

        const verificationStatus = document.createElement("output");
        verificationStatus.className = `verification-status ${
          user ? "verified" : "unverified"
        }`;
        verificationStatus.textContent = "VERIFIED";
        verificationSection.appendChild(verificationStatus);

        contactCardContent.appendChild(verificationSection);
      }

      const rolesCardContent = this.shadowRoot?.querySelector(
        "#roles-card .card-content"
      );
      if (rolesCardContent && Array.isArray(user.roles)) {
        const countSection = document.createElement("section");
        countSection.className = "profile-data-section";

        const rolesCount = document.createElement("output");
        rolesCount.className = "roles-count";
        rolesCount.textContent = user.roles.length.toString();
        countSection.appendChild(rolesCount);

        rolesCardContent.appendChild(countSection);

        const rolesListSection = document.createElement("section");
        rolesListSection.className = "profile-data-section roles-section";

        const rolesList = document.createElement("ul");
        rolesList.className = "roles-list";
        rolesList.setAttribute("role", "list");

        user.roles.forEach((role: string) => {
          const roleItem = document.createElement("li");
          roleItem.className = "role-tag";
          roleItem.textContent = role;
          rolesList.appendChild(roleItem);
        });

        rolesListSection.appendChild(rolesList);
        rolesCardContent.appendChild(rolesListSection);
      }

      const lastLoginCardContent = this.shadowRoot?.querySelector(
        "#last-login-card .card-content"
      );
      if (lastLoginCardContent) {
        const loginSection = document.createElement("section");
        loginSection.className = "profile-data-section";

        const lastLogin = document.createElement("output");
        lastLogin.className = "last-login-date";
        lastLogin.textContent = "Today";
        loginSection.appendChild(lastLogin);

        lastLoginCardContent.appendChild(loginSection);
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
  handleLogout() {
    try {
      localStorage.clear();
      sessionStorage.clear();

      const notificationService = new NotificationService();
      setTimeout(() => {
        notificationService.showNotification({
          type: "success",
          title: "LOGOUT",
          message: "Logged out successfully. Good Bye!",
          duration: 3000,
        });
      }, 0);
      App.navigate("/login");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }
}

customElements.define("user-profile-view", UserProfileView);
