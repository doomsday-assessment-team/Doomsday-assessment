// import { HomeView, initHomeView } from './views/HomeView.js';


// class App {
//   static init() {
//     const app = document.getElementById('app');
//     if (!app) return;
//     app.innerHTML = HomeView();
//     initHomeView();
//   }
// }

// document.addEventListener('DOMContentLoaded', () => App.init());




// src/views/main.ts
import { Login } from './views/Login.js';

// Initialize the login component
const loginComponent = new Login();

export function renderLoginToElement(elementId: string): void {
  const container = document.getElementById(elementId);
  if (container) {
    loginComponent.render(container);
  } else {
    console.error(`Element with ID ${elementId} not found`);
  }
}

// Example usage
document.addEventListener('DOMContentLoaded', () => {
  renderLoginToElement('login-container');
});