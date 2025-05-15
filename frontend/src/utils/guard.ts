import { RouteGuard } from "../types/route-guard";
import { AuthService } from "./auth-service.js";

export const AuthGuard: RouteGuard = (path: string, queryParams: URLSearchParams): boolean | string => {
    const authService = new AuthService();
    const originalPathAndQuery = path + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    sessionStorage.setItem('redirectAfterLogin', originalPathAndQuery);
    if (authService.isLoggedIn()) {
        return true; // Allow access
    } else {

        return '/login';
    }
};


// export const AdminRoleGuard: RouteGuard = (path, queryParams) => {
//     if (AuthService.isAuthenticated() && AuthService.getUserRoles().includes('admin')) {
//         return true;
//     }
//     return '/unauthorized'; // Redirect to an unauthorized page
// };