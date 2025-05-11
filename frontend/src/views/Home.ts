import { loadTemplate } from "../utils/load-template.js";

export class HomeView extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.loadTemplate();
    }

    async loadTemplate() {
        const content = await loadTemplate('./templates/home.view.html');
        if (content){
            this.shadowRoot?.appendChild(content);
        } else {
            // content is null
        }
    }
}

customElements.define('home-view', HomeView);
