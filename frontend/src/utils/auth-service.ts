import config from "../config.js";
import { apiService } from "../main.js";

const TOKEN_STORAGE_KEY = 'appAuthToken';

export class AuthService {
    private token: string | null = null;

    constructor() {
        const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
        if (storedToken) {
            this.setToken(storedToken);
        }
        this.handleLoginCallback();
    }

    public loginWithGoogle(): void {
        window.location.href = `${config.apiBaseUrl}/auth/google`;
    }

    private handleLoginCallback(): void {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');

        if (tokenFromUrl) {
            this.setToken(tokenFromUrl);
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    public setToken(token: string): void {
        this.token = token;
        sessionStorage.setItem(TOKEN_STORAGE_KEY, token);
    }

    public getToken(): string | null {
        if (this.token) {
            return this.token;
        }
        const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);
        if (storedToken && storedToken !== "undefined" && storedToken !== "null") {
            this.setToken(storedToken); 
            return this.token;
        }
        return null;
    }

    public isLoggedIn(): boolean {
        const currentToken = this.getToken();

        if (!this.token ) {
            console.log("AuthService.isLoggedIn: No valid token or decoded token found. Returning false.");
            return false;
        }

        console.log("AuthService.isLoggedIn: Token valid (or no exp claim). Returning true.");
        return true;
    }

    public logout(): void {
        this.token = null;
        sessionStorage.removeItem(TOKEN_STORAGE_KEY);

    }
}