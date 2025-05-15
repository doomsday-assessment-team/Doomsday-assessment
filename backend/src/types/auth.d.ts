export interface JwtPayload {
    roles: string[];
    user_id: number;
    google_subject: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    iat: number;
    exp: number;
  }
  