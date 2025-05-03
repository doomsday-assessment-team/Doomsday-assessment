import { HomeView } from './views/HomeView.js';

class App {
  static init() {
    const app = document.getElementById('app');
    if (!app) return;
    app.innerHTML = HomeView();
  }
}

document.addEventListener('DOMContentLoaded', () => App.init());
