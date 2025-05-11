import './views/AssessmentHistory.js';
import './views/Login.js';
import './views/Home.js';
import './views/NotFound.js';

class App {
  static routes = {
    '/': 'home-view',
    '/login': 'login-view',
    '/assessment-history': 'assessment-history',
  };

  static renderRoute(path: string) {
    const app = document.getElementById('app');
    if (!app) return;

    app.replaceChildren();

    const viewTag = this.routes[path as keyof typeof App.routes];

    if (viewTag) {
      const view = document.createElement(viewTag);
      app.appendChild(view);
    } else {
      window.location.hash = '/not-found';
    }
  }

  static handleRouteChange() {
    const path = window.location.hash.slice(1) || '/';
    if (path === '/not-found') {
      const app = document.getElementById('app');
      if (!app) return;
      app.replaceChildren();
      const notFoundView = document.createElement('not-found');
      app.appendChild(notFoundView);
      return;
    }

    this.renderRoute(path);
  }

  static init() {
    this.handleRouteChange();
    window.addEventListener('hashchange', () => this.handleRouteChange());
  }
}

document.addEventListener('DOMContentLoaded', () => App.init());
