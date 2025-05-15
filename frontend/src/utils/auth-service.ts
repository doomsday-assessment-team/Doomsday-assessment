import config from "../config.js";
import { apiService } from "../main.js";

interface AppJwtPayload {
    roles: string[]; // Or whatever type roles is
    google_subject: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    // Add iat (issued at) and exp (expiration time) if you want to check them client-side
    iat?: number;
    exp?: number;
}

const TOKEN_STORAGE_KEY = 'appAuthToken';
const BACKEND_AUTH_URL = 'YOUR_BACKEND_API_BASE_URL/auth'; // e.g., http://localhost:8080/api/auth

export class AuthService {
    private token: string | null = null;
    private decodedToken: AppJwtPayload | null = null;

    constructor() {
        // Try to load token from storage on initialization
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (storedToken) {
            this.setToken(storedToken);
        }
        // Handle the redirect from Google login
        this.handleLoginCallback();
    }



    /**
     * Initiates the Google login flow by redirecting to the backend.
     */
    public loginWithGoogle(): void {
        // The backend will handle the redirect to Google's OAuth server
        window.location.href = `${config.apiBaseUrl}/auth/google`;
    }

    /**
     * Checks URL for a token from the backend redirect, stores it, and cleans the URL.
     * This should be called when the application initializes.
     */
    private handleLoginCallback(): void {
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');

        if (tokenFromUrl) {
            this.setToken(tokenFromUrl);
            // Clean the token from the URL to prevent it from being bookmarked or shared
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }

    /**
     * Stores the application token and decodes its payload.
     * @param token The JWT from your backend.
     */
    public setToken(token: string): void {
        this.token = token;
        localStorage.setItem(TOKEN_STORAGE_KEY, token);
        try {
            // this.decodedToken = jwtDecode<AppJwtPayload>(token);
        } catch (error) {
            console.error('Failed to decode token:', error);
            this.decodedToken = null;
            this.logout(); // Invalid token, so log out
        }
    }

    /**
     * Retrieves the stored application token.
     * @returns The token string or null if not found.
     */
    public getToken(): string | null {
        if (this.token) {
            return this.token;
        }
        const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
        if (storedToken && storedToken !== "undefined" && storedToken !== "null") {
            this.setToken(storedToken); // Load it into memory if found in storage
            return this.token;
        }
        return null;
    }

    /**
     * Retrieves the decoded JWT payload.
     * @returns The decoded payload or null.
     */
    public getUser(): AppJwtPayload | null {
        if (!this.token && !this.decodedToken) {
            const storedToken = localStorage.getItem(TOKEN_STORAGE_KEY);
            if (storedToken) this.setToken(storedToken); // Attempt to re-load if needed
        }
        return this.decodedToken;
    }

    /**
     * Checks if the user is currently authenticated.
     * Optionally checks if the token is expired (client-side pre-check).
     * @returns True if authenticated, false otherwise.
     */
    public isLoggedIn(): boolean {
        const currentToken = this.getToken(); // Ensures token is loaded from localStorage if not in memory
        console.log("AuthService.isLoggedIn check: Current in-memory token:", this.token, "Decoded:", this.decodedToken);

        if (!this.token ) { // Check both the raw token string and the decoded object
            console.log("AuthService.isLoggedIn: No valid token or decoded token found. Returning false.");
            return false;
        }

        // Optional: Client-side expiration check (backend MUST always validate)
        // if (this.decodedToken.exp) {
        //     const currentTime = Math.floor(Date.now() / 1000); // current time in seconds
        //     const isExpired = this.decodedToken.exp <= currentTime;
        //     if (isExpired) {
        //         console.log("AuthService.isLoggedIn: Token is expired. Clearing token.");
        //         this.logout(); // Token is expired, so log out
        //         return false;
        //     }
        // }
        console.log("AuthService.isLoggedIn: Token valid (or no exp claim). Returning true.");
        return true;
    }

    /**
     * Clears the stored token and user information.
     */
    public logout(): void {
        this.token = null;
        this.decodedToken = null;
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        // Optionally, redirect to login page or home page
        // window.location.href = '/login';
        // Optionally, inform the backend about logout if needed
    }
}