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








import { User } from '../models/user.js';
import { UserCard } from '../components/UserCard.js';

// Define interfaces for our data structures
interface AppUser {
    name: string;
}

interface Scenario {
    id: number;
    name: string;
}

interface Difficulty {
    id: number;
    name: string;
}

interface AppState {
    selectedScenario: Scenario | null;
    selectedDifficulty: Difficulty | null;
}

// Current mock data - to be replaced with API calls
const mockData: { user: AppUser; scenarios: Scenario[]; difficulties: Difficulty[] } = {
    user: {
        name: "Alex"
    },
    scenarios: [
        { id: 1, name: "Zombie" },
        { id: 2, name: "Alien" },
        { id: 3, name: "Nuclear" },
        { id: 4, name: "Apocalypse" },
        { id: 5, name: "Invasion" },
        { id: 6, name: "Disaster" }
    ],
    difficulties: [
        { id: 1, name: "Easy" },
        { id: 2, name: "Medium" },
        { id: 3, name: "Hard" }
    ]
};

// State management
let appState: AppState = {
    selectedScenario: null,
    selectedDifficulty: null
};

export function HomeView(): string {
  const users = [
    new User('Jane', 'Doe', 'Admin'),
    new User('John', 'Smith', 'Editor'),
    new User('Emily', 'Jones', 'Viewer'),
  ];

  const cards = users.map(UserCard).join('');

  return `
      <header class="site-header">
        <h1>DOOMSDAY READINESS TEST</h1>
      </header>

      <main>
          <section class="welcome-section">
              <h2>Welcome, <span id="username">${mockData.user.name}</span>.</h2>
              
              <section class="scenario-selection">
                  <h3>Choose a scenario:</h3>
                  <div class="scenario-grid" id="scenario-container">
                      ${mockData.scenarios.map(scenario => `
                          <div class="scenario-card" data-id="${scenario.id}">
                              ${scenario.name}
                          </div>
                      `).join('')}
                  </div>
              </section>
              
              <section class="difficulty-selection">
                  <h3>Select difficulty:</h3>
                  <div class="difficulty-options" id="difficulty-container">
                      ${mockData.difficulties.map(difficulty => `
                          <div class="difficulty-option" data-id="${difficulty.id}">
                              ${difficulty.name}
                          </div>
                      `).join('')}
                  </div>
              </section>
              
              <button id="start-test" class="start-test-button" disabled>Start Test</button>
          </section>
      </main>

      <footer>
          <p>© 2025 Doomsday Readiness Test | Survival Preparedness</p>
      </footer>
  `;
}

// Initialize the app when DOM is loaded
export function initHomeView(): void {
    const scenarioContainer: HTMLElement | null = document.getElementById('scenario-container');
    const difficultyContainer: HTMLElement | null = document.getElementById('difficulty-container');
    const startTestButton: HTMLButtonElement | null = document.getElementById('start-test') as HTMLButtonElement;
    const usernameElement: HTMLElement | null = document.getElementById('username');

    // Set up event listeners
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners(): void {
    // Scenario selection
    document.querySelectorAll('.scenario-card').forEach(card => {
        card.addEventListener('click', () => {
            document.querySelectorAll('.scenario-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
            const scenarioId = parseInt(card.getAttribute('data-id') || '0');
            appState.selectedScenario = mockData.scenarios.find(s => s.id === scenarioId) || null;
            updateStartButtonState();
        });
    });
    
    // Difficulty selection
    document.querySelectorAll('.difficulty-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.difficulty-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
            const difficultyId = parseInt(option.getAttribute('data-id') || '0');
            appState.selectedDifficulty = mockData.difficulties.find(d => d.id === difficultyId) || null;
            updateStartButtonState();
        });
    });
    
    // Start test button
    const startTestButton = document.getElementById('start-test');
    if (startTestButton) {
        startTestButton.addEventListener('click', startTest);
    }
}

// Update start button state based on selections
function updateStartButtonState(): void {
    const startTestButton: HTMLButtonElement | null = document.getElementById('start-test') as HTMLButtonElement;
    if (!startTestButton) return;
    
    if (appState.selectedScenario && appState.selectedDifficulty) {
        startTestButton.disabled = false;
    } else {
        startTestButton.disabled = true;
    }
}

// Start test function - to be replaced with actual navigation
function startTest(): void {
    if (!appState.selectedScenario || !appState.selectedDifficulty) {
        console.error('Cannot start test without scenario and difficulty');
        return;
    }

    console.log('Starting test with:', appState);
    alert(`Test starting with Scenario: ${appState.selectedScenario.name} and Difficulty: ${appState.selectedDifficulty.name}`);
    
    // API call example (commented out):
    /*
    fetch('/api/start-test', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            scenarioId: appState.selectedScenario.id,
            difficultyId: appState.selectedDifficulty.id
        })
    })
    .then(response => response.json())
    .then(data => {
        // Handle response and navigate to test page
    })
    .catch(error => {
        console.error('Error:', error);
    });
    */
}