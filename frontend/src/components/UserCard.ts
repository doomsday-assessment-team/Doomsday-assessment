import { User } from '../models/user.js';
import { capitalize } from '../utils/capitalize.js';

export function UserCard(user: User): string {
  return `
    <article class="user-card">
      <h2>${user.fullName}</h2>
      <p>Role: ${capitalize(user.role)}</p>
    </article>
  `;
}
