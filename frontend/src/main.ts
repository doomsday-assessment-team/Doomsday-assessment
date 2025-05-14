import "./views/AssessmentHistory.js";
import "./views/Login.js";
import "./views/Home.js";
import "./views/NotFound.js";
import './views/QuestionsAndOptions.js';
import { ApiService } from "./api/ApiService.js";
import config from "./config.js";

const apiService = new ApiService(config.apiBaseUrl);

class App {
  static routes = {
    "/": "home-view",
    "/login": "login-view",
    "/assessment-history": "assessment-history",
    '/questions-and-options': 'questions-and-options',
  };

  static renderRoute(path: string) {
    const app = document.querySelector("main");
    if (!app) return;

    const viewTag = this.routes[path as keyof typeof App.routes];

    if (viewTag) {
      const view = document.createElement(viewTag);
      app.replaceWith(view);
    } else {
      window.location.hash = "/not-found";
    }
  }

  static handleRouteChange() {
    const queryParams = new URLSearchParams(window.location.search);
    const token = queryParams.get("token");
    if (token) {
      sessionStorage.setItem("token", token);
      window.history.replaceState(null, '', '/#/');
      this.renderRoute('/');
      window.location.href = config.environment === 'prod' ? '/' : "/frontend/public/"; // edit this this is the base url in prod will be /
    } else {
      const path = window.location.hash.slice(1) || "/";
      const token = sessionStorage.getItem("token");
      if (!token && path !== "/login") {
        window.location.href = "#/login";
      } else {
        if (path === "/not-found") {
          const app = document.querySelector("main");
          if (app) {
            app.replaceWith(document.createElement("not-found"));
          }
        }
        this.renderRoute(path);
      }
    }

  }

  static navigate(path: string) {
    if (window.location.hash.slice(1) !== path) {
      window.location.hash = path;
    } else {
      this.handleRouteChange();
    }
  }

  static init() {
    this.handleRouteChange();
    window.addEventListener("hashchange", () => this.handleRouteChange());
  }
}

document.addEventListener("DOMContentLoaded", () => App.init());

export { App, apiService }
