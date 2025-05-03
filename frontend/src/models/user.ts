import { Role } from '../types/role.js';

export class User {
  constructor(
    public firstName: string,
    public lastName: string,
    public role: Role
  ) {}

  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
