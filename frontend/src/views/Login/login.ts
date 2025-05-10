import loginHtml from './login.html';

export class Login {
  async render(container: HTMLElement) {
    try {
      container.innerHTML = loginHtml;
      this.initEventListeners();
    } catch (error) {
      console.error('Template rendering failed:', error);
      container.innerHTML = '<p>Error loading component</p>';
    }
  }

  private initEventListeners() {
    document.querySelector('.login button')?.addEventListener('click', () => {
      alert('Login button clicked!');
    });
  }
}
