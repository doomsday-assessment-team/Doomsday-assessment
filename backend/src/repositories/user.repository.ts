import db from "../config/db";

interface User {
  user_id: number;
  name: string;
  surname: string;
  google_subject: string;
}

export const getUserByGoogleSubject = async (
  googleSubject: string
): Promise<User | null> => {
  const user = await db.oneOrNone<User>(
    'SELECT * FROM users WHERE google_subject = $1',
    [googleSubject]
  );
  return user;
};
