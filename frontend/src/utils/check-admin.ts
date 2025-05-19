import { apiService } from "../main.js";

export async function checkAdminRole(role = 'Assessment manager'): Promise<boolean> {
  try {
    const roles: string[] = await apiService.get("/users/roles");
    return roles.includes(role);
  } catch (error) {
    console.error(error);
    return false;
  }
}

export async function checkManagerRole(role = 'User manager'): Promise<boolean> {
  try {
    const roles: string[] = await apiService.get("/users/roles");
    return roles.includes(role);
  } catch (error) {
    console.error(error);
    return false;
  }
}
