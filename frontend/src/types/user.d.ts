interface User {
  email: string;
  google_subject: string;
  given_name: string;
  family_name: string;
  roles: string[];
}

interface UserResponse {
  user: User;
}

interface IpResponse {
  ip: string;
}