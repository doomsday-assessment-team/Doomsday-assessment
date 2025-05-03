import { User } from '../models/user.js';
import { UserCard } from '../components/UserCard.js';

export function HomeView(): string {
  const users = [
    new User('Jane', 'Doe', 'Admin'),
    new User('John', 'Smith', 'Editor'),
    new User('Emily', 'Jones', 'Viewer'),
  ];

  const cards = users.map(UserCard).join('');

  return `
    <section>
      <header><h1>User Dashboard</h1></header>
      <main>${cards}</main>
    </section>
  `;
}
