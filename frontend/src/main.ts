import "./views/AssessmentHistory.js";
import "./views/Login.js";
import "./views/Home.js";
import "./views/NotFound.js";
import './views/QuestionsAndOptions.js';
import './views/Quiz.js';
import { ApiService } from "./api/ApiService.js";
import config from "./config.js";
import { AuthGuard } from "./utils/guard.js";
import { RouteGuard, Routes } from "./types/route-guard.js";
import { AuthService } from "./utils/auth-service.js";

const apiService = new ApiService(config.apiBaseUrl);

class App {
  static routes: Routes = {
    "/": { componentTag: "home-view", canActivate: [AuthGuard]},
    "/login": { componentTag: "login-view" },
    "/history": {
      componentTag: "assessment-history",
      // canActivate: [AuthGuard]
    },
    '/questions-and-options': { 
      componentTag: 'questions-and-options',  
      canActivate: [AuthGuard]
    },
    '/quiz': {
      componentTag: 'quiz-view',
     canActivate: [AuthGuard]
    },
    '/not-found': { componentTag: 'not-found-view' }
  };

  private static appContainer: HTMLElement | null = null;

  private static async processGuards(
    guards: RouteGuard[],
    path: string,
    queryParams: URLSearchParams
  ): Promise<boolean | string> {
    for (const guard of guards) {
      const result = await guard(path, queryParams);
      if (result === false || typeof result === 'string') {
        return result;
      }

    }
    return true;
  }

  static async renderRoute(path: string, queryParams: URLSearchParams) {
    const app = document.querySelector("main");
    if (!app) return;
    if (!this.appContainer) {
      return;
    }
    this.appContainer.replaceChildren();


    const routeConfig = this.routes[path as keyof typeof App.routes];;

    if (routeConfig) {

      if (routeConfig.canActivate && routeConfig.canActivate.length > 0) {
        const guardResult = await this.processGuards(routeConfig.canActivate, path, queryParams);
        if (guardResult === false) {
          this.navigate('/not-found');
          return;
        } else if (typeof guardResult === 'string') {
          this.navigate(guardResult);
          return;
        }

      }

      const view = document.createElement(routeConfig.componentTag);
      queryParams.forEach((value, key) => {
        view.setAttribute(`data-param-${key.toLowerCase()}`, value);
      });

      this.appContainer.appendChild(view);

    } else {
      this.navigate('/not-found');
    }

  }


  static async handleRouteChange() {
    if (!this.appContainer) {
      this.appContainer = document.getElementById('app');
      if (!this.appContainer) {
        return;
      }
    }

    const authService = new AuthService();

    const fullHash = window.location.hash.slice(1) || '/';

    const [path, queryString] = fullHash.split('?', 2);

    if (path === '/not-found') {
      const app = document.getElementById('app');
      if (!app) return;
      app.replaceChildren();
      const notFoundView = document.createElement('not-found');
      app.replaceWith(notFoundView);
      return;
    }

    const normalizedPath = (path && path.startsWith('/')) ? path : (path ? '/' + path : '/');

    const queryParams = new URLSearchParams(queryString || '');
    await this.renderRoute(normalizedPath, queryParams);
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
      this.handleRouteChange();
    }
  }

  static init(appContainerId: string = 'main') {
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
