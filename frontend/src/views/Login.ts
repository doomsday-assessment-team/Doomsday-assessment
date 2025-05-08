// src/views/Login.ts
import loginTemplate from '../components/Login.html';

export class Login {
  private template: string;

  constructor() {
    this.template = loginTemplate;
  }

  public render(container: HTMLElement): void {
    container.innerHTML = this.template;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Use immediate function to ensure DOM is ready
    (() => {
      const loginForm = document.getElementById('login-form');
      const googleBtn = document.querySelector('.login-with-google-btn');

      if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
          e.preventDefault();
          this.handleLogin();
        });
      }

      if (googleBtn) {
        googleBtn.addEventListener('click', () => {
          this.handleGoogleLogin();
        });
      }
    })();
  }

  private handleLogin(): void {
    const usernameInput = document.getElementById('username') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    
    if (usernameInput && passwordInput) {
      console.log(`Login attempt with username: ${usernameInput.value}`);
      // Add your actual login logic here
    }
  }

  private handleGoogleLogin(): void {
    console.log('Google login button clicked');
    // Add your Google login logic here
  }

  public getTemplate(): string {
    return this.template;
  }
}