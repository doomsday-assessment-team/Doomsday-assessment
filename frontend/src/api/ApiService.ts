import { App } from "../main.js";

export class ApiError extends Error {
    public readonly statusCode: number;
    public readonly statusText: string;
    public readonly responseBody: any;

    constructor(message: string, statusCode: number, statusText: string, responseBody?: any) {
        super(message);
        this.name = 'ApiError';
        this.statusCode = statusCode;
        this.statusText = statusText;
        this.responseBody = responseBody;

        // // Maintains proper stack trace (only available on V8)
        // if (Error.captureStackTrace) {
        //     Error.captureStackTrace(this, ApiError);
        // }
    }
}


export class ApiService {
    private readonly baseURL: string;
    private defaultHeaders: HeadersInit;

    constructor(baseURL: string, defaultHeaders: HeadersInit = {}) {
        this.baseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;
        this.defaultHeaders = {
            'Accept': 'application/json',
            ...defaultHeaders
        };
    }


    public async get<T>(
        endpoint: string,
        queryParams?: URLSearchParams | Record<string, string>,
        customOptions: RequestInit = {}
    ): Promise<T> {
        const url = this.buildUrl(endpoint, queryParams);
        return this._request<T>(url, {
            ...customOptions,
            method: 'GET',
        });
    }


    public async post<T>(
        endpoint: string,
        data: any,
        customOptions: RequestInit = {}
    ): Promise<T> {
        const url = this.buildUrl(endpoint);
        return this._request<T>(url, {
            ...customOptions,
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 
                'Content-Type': 'application/json',
                ...(customOptions.headers || {}),
            },
        });
    }

    public async put<T>(
        endpoint: string,
        data: any, 
        customOptions: RequestInit = {}
    ): Promise<T> {
        const url = this.buildUrl(endpoint);
        return this._request<T>(url, {
            ...customOptions,
            method: 'PUT',
            body: JSON.stringify(data),
            headers: {
                'Content-Type': 'application/json',
                ...(customOptions.headers || {}),
            },
        });
    }

    public async delete<T>(
        endpoint: string,
        customOptions: RequestInit = {}
    ): Promise<T> {
        const url = this.buildUrl(endpoint);
        return this._request<T>(url, {
            ...customOptions,
            method: 'DELETE',
        });
    }


    private buildUrl(
        endpoint: string,
        queryParams?: URLSearchParams | Record<string, string>
    ): string {
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        const url = new URL(this.baseURL + cleanEndpoint);

        if (queryParams) {
            if (queryParams instanceof URLSearchParams) {
                url.search = queryParams.toString();
            } else {
                Object.entries(queryParams).forEach(([key, value]) => {
                    if (value !== undefined && value !== null) {
                        url.searchParams.append(key, String(value));
                    }
                });
            }
        }
        return url.toString();
    }

    private async _request<T>(url: string, options: RequestInit): Promise<T> {
        const mergedHeaders = new Headers({
            ...this.defaultHeaders,
            ...(options.headers || {})
        });

        const fetchOptions: RequestInit = {
            ...options,
            headers: mergedHeaders,
        };


        let response: Response;
        try {
            response = await fetch(url, fetchOptions);
        } catch (error) {
            throw new Error(`Network error: ${error instanceof Error ? error.message : String(error)}`);
        }


        if (response.status === 401 || response.status === 403) {
            App.navigate('/login'); 
            throw new ApiError("Unauthorized/Forbidden", response.status, response.statusText);
        }

        if (!response.ok) {
            let errorBody: any = null;
            try {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('application/json')) {
                    errorBody = await response.json();
                } else {
                    errorBody = await response.text();
                }
            } catch (parseError) {
            }

            throw new ApiError(
                `API Error: ${response.status} ${response.statusText}`,
                response.status,
                response.statusText,
                errorBody
            );
        }

        if (response.status === 204) {
            return undefined as unknown as T;
        }

        try {
            const data: T = await response.json();
            return data;
        } catch (parseError) {
            throw new Error(`Failed to parse JSON response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        }
    }

    public setDefaultHeaders(headers: HeadersInit): void {
        this.defaultHeaders = { ...this.defaultHeaders, ...headers };
    }

    public setAuthToken(token: string | null): void {
        const currentHeaders: Record<string, string> = { ...this.defaultHeaders } as Record<string, string>;
        if (token) {
            currentHeaders['Authorization'] = `Bearer ${token}`;
        } else {
            delete currentHeaders['Authorization'];
        }
        this.defaultHeaders = currentHeaders;
    }
}