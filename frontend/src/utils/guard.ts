import { RouteGuard } from "../types/route-guard";

export const AuthGuard: RouteGuard = (path: string, queryParams: URLSearchParams): boolean | string => {
    // if (AuthService.isAuthenticated()) {
    //     return true; // Allow access
    // } else {
    //     const originalPathAndQuery = path + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    //     sessionStorage.setItem('redirectAfterLogin', originalPathAndQuery);
    //     return '/login';
    // }

    const originalPathAndQuery = path + (queryParams.toString() ? `?${queryParams.toString()}` : '');
    sessionStorage.setItem('redirectAfterLogin', originalPathAndQuery);
    return '/login';
};


// export const AdminRoleGuard: RouteGuard = (path, queryParams) => {
//     if (AuthService.isAuthenticated() && AuthService.getUserRoles().includes('admin')) {
//         return true;
//     }
//     return '/unauthorized'; // Redirect to an unauthorized page
// };