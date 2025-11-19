export type UserRole = 'admin' | 'manager' | 'user' | 'guest';

export interface User {
  id: number;
  name: string;
  email: string;
  role?: UserRole;
  avatarUrl?: string;
  phone?: string;
  createdAt?: string;
}