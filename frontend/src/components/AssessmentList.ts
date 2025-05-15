import { ApiService } from '../api/ApiService.js';
import { loadTemplate } from '../utils/load-template.js';
import './AssessmentItem.js';
import { AssessmentItem } from './AssessmentItem.js';
import { Option } from '../types/global-types.js';
import { apiService } from '../main.js';

interface AssessmentHistoryItem {
  history_id: number;
  timestamp: string;
  scenario_id: number;
  scenario_name: string;
  difficulty_id: number;
  difficulty_name: string;
  user_name: string;
  user_id: number;
  questions: Question[];
}

export interface Question {
  question_id: number;
    question_text: string;
    selected_option_id: number;
    options: Option[];
}

export class AssessmentList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.loadTemplate();
  }
  
  async loadTemplate() {
    const content = await loadTemplate('./templates/assessment-list.component.html');
    if (content) {
      this.shadowRoot?.appendChild(content);
      this.fetchHistory();
    } else {
      // content is null
    }
  }

  async fetchHistory() {
    const assessmentHistories: AssessmentHistoryItem[] = await apiService.get("/admin/user-question-history");
    const assessmentHistoryList = this.shadowRoot?.getElementById('assessment-history');
    if (!assessmentHistoryList) return;
    assessmentHistoryList.replaceChildren();
    const optionsDate: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    const optionsTime: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', hour12: true };
    assessmentHistories.forEach(assessmentHistory => {
      const assessmentHistoryItem = document.createElement('assessment-item');
      const listItem = document.createElement('li');
      assessmentHistoryItem.setAttribute('user', assessmentHistory.user_name);
      const date = new Date(assessmentHistory.timestamp);
      const dayName = date.toLocaleDateString('en-GB', optionsDate);
      const time = date.toLocaleTimeString('en-GB', optionsTime); 
      const formattedDate = `${dayName} at ${time}`;
      assessmentHistoryItem.setAttribute('date', formattedDate);
      assessmentHistoryItem.setAttribute('scenario', assessmentHistory.scenario_name);
      assessmentHistoryItem.setAttribute('difficulty', assessmentHistory.difficulty_name);
      const totalPoints = assessmentHistory.questions.reduce((accumulator, question) => {
        const selected = question.options.find(option => option.option_id === question.selected_option_id);
        return accumulator + (selected?.points ?? 0);
      }, 0);

      assessmentHistoryItem.setAttribute('points', totalPoints.toString());
      assessmentHistoryItem.setAttribute('feedback', totalPoints > 5 ? "Great job!" : "Needs improvement.");

      listItem.appendChild(assessmentHistoryItem);
      assessmentHistoryList.appendChild(listItem);
      (assessmentHistoryItem as AssessmentItem).setQuestions(assessmentHistory.questions);
    });

  }
}
customElements.define('assessment-list', AssessmentList);
