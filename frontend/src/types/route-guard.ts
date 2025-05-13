
export interface RouteGuard {

    (path: string, queryParams: URLSearchParams): boolean | Promise<boolean> | string | Promise<string>;
}

export interface RouteConfig {
    componentTag: string;
    canActivate?: RouteGuard[]; 
    title?: string; 
    
}

export interface Routes {
    [path: string]: RouteConfig;
}