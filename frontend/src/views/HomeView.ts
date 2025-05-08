// import { User } from '../models/user.js';
// import { UserCard } from '../components/UserCard.js';

// export function HomeView(): string {
//   const users = [
//     new User('Jane', 'Doe', 'Admin'),
//     new User('John', 'Smith', 'Editor'),
//     new User('Emily', 'Jones', 'Viewer'),
//   ];

//   const cards = users.map(UserCard).join('');

//   return `
//       <header class="site-header">
//         <h1>DOOMSDAY READINESS TEST</h1>
//     </header>

//     <main>
//         <section class="welcome-section">
//             <h2>Welcome, <span id="username">Alex</span>.</h2>
            
//             <section class="scenario-selection">
//                 <h3>Choose a scenario:</h3>
//                 <div class="scenario-grid" id="scenario-container">
//                     <!-- Scenarios will be populated by JavaScript -->
//                 </div>
//             </section>
            
//             <section class="difficulty-selection">
//                 <h3>Select difficulty:</h3>
//                 <div class="difficulty-options" id="difficulty-container">
//                     <!-- Difficulties will be populated by JavaScript -->
//                 </div>
//             </section>
            
//             <button id="start-test" class="start-test-button">Start Test</button>
//         </section>
//     </main>

//     <footer>
//         <p>© 2025 Doomsday Readiness Test | Survival Preparedness</p>
//     </footer>
//   `;
// }









// src/views/HomeView.ts
export class HomeView {
    private username: string;
    private element: HTMLElement;

    constructor(username: string = 'Alex') {
        this.username = username;
        this.element = this.render();
        this.setupEventListeners();
    }

    public getView(): HTMLElement {
        return this.element;
    }

    private render(): HTMLElement {
        const container = document.createElement('div');
        // Your existing render implementation here
        // ...
        return container;
    }

    private setupEventListeners(): void {
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.addEventListener('click', this.handleScenarioSelect.bind(this));
        });

        const startBtn = document.getElementById('start-test');
        if (startBtn) {
            startBtn.addEventListener('click', this.handleStartTest.bind(this));
        }
    }

    private handleScenarioSelect(event: Event): void {
        const button = event.target as HTMLButtonElement;
        console.log('Selected scenario:', button.textContent);
    }

    private handleStartTest(): void {
        const selectedDifficulty = document.querySelector<HTMLInputElement>(
            'input[name="difficulty"]:checked'
        )?.value;
        console.log('Starting test with difficulty:', selectedDifficulty);
    }
}