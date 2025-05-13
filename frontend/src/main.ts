import "./views/AssessmentHistory.js";
import "./views/Login.js";
import "./views/Home.js";
import "./views/NotFound.js";
import './views/QuestionsAndOptions.js';
import './views/Quiz.js';
import { ApiService } from "./api/ApiService.js";
import config from "./config.js";

const apiService = new ApiService(config.apiBaseUrl);

class App {
  static routes = {
    "/": "home-view",
    "/login": "login-view",
    "/assessment-history": "assessment-history",
    '/questions-and-options': 'questions-and-options',
    '/quiz': 'quiz-view',
  };
  private static appContainer: HTMLElement | null = null;

  static renderRoute(path: string, queryParams: URLSearchParams) {
    const app = document.querySelector("main");
    if (!app) return;

    const viewTag = this.routes[path as keyof typeof App.routes];

    if (viewTag) {
      const view = document.createElement(viewTag);
      queryParams.forEach((value, key) => {
        view.setAttribute(`data-param-${key.toLowerCase()}`, value);
        console.log(`Router: Setting attribute data-param-${key.toLowerCase()}="${value}" on <${viewTag}>`);
      });
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

    static handleRouteChange() {
      // const path = window.location.hash.slice(1) || '/';
      // if (path === '/not-found') {
      //   const app = document.getElementById('app');
      //   if (!app) return;
      //   app.replaceChildren();
      //   const notFoundView = document.createElement('not-found');
      //   app.appendChild(notFoundView);
      //   return;
      // }

      if (!this.appContainer) {
        this.appContainer = document.getElementById('app');
        if (!this.appContainer) {
          return;
        }
      }

      const fullHash = window.location.hash.slice(1) || '/';

      const [path, queryString] = fullHash.split('?', 2);
      if (path === '/not-found') {
        const app = document.getElementById('app');
        if (!app) return;
        app.replaceChildren();
        const notFoundView = document.createElement('not-found');
        app.appendChild(notFoundView);
        return;
      }

      const normalizedPath = (path && path.startsWith('/')) ? path : (path ? '/' + path : '/');

      const queryParams = new URLSearchParams(queryString || '');
      this.renderRoute(normalizedPath, queryParams);
    }

  static navigate(pathAndQuery: string) {
    const currentHash = window.location.hash.slice(1) || '/';

    let normalizedPath = pathAndQuery;
    if (normalizedPath && !normalizedPath.startsWith('/')) {
      normalizedPath = '/' + normalizedPath;
    }

    if (normalizedPath === '') {
      normalizedPath = '/';
    }

    if (currentHash !== normalizedPath) {
      window.location.hash = normalizedPath;
    } else {
      this.handleRouteChange(); // Manually call handler
    }
  }

  static init(appContainerId: string = 'app') {
    this.appContainer = document.getElementById(appContainerId);
    if (!this.appContainer) {
      return;
    }

    this.handleRouteChange();
    window.addEventListener("hashchange", () => this.handleRouteChange());
  }
}

document.addEventListener("DOMContentLoaded", () => App.init());

export { App, apiService }
