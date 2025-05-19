import { RouteGuard } from "../types/route-guard";
import { AuthService } from "./auth-service.js";
import { NotificationService } from "./notification-service.js";

export const AuthGuard: RouteGuard = (path: string, queryParams: URLSearchParams): boolean | string => {
  const authService = new AuthService();
  const originalPathAndQuery = path + (queryParams.toString() ? `?${queryParams.toString()}` : '');

  sessionStorage.setItem('redirectAfterLogin', originalPathAndQuery);

  if (authService.isLoggedIn()) {
    return true;
  } else {
    const hasHadPreviousSession =
      sessionStorage.getItem("hasLoggedInBefore") === "true" || localStorage.getItem("hasLoggedInBefore") === "true"

    if (hasHadPreviousSession) {
      sessionStorage.setItem("authRedirectReason", "SESSION_EXPIRED")

      const notificationService = new NotificationService()
      setTimeout(() => {
        notificationService.showNotification({
          type: "warning",
          title: "SESSION EXPIRED",
          message: "Your authentication session has expired. Please log in again to continue.",
          duration: 3000,
        })
      }, 0)
    } else {
      sessionStorage.setItem("authRedirectReason", "FIRST_LOGIN");
    }

    return '/login';
  }
};
