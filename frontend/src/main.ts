import { HomeView, initHomeView } from './views/HomeView.js';


class App {
  static init() {
    const app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = HomeView();
    initHomeView();
  }
}

document.addEventListener('DOMContentLoaded', () => App.init());
