import { User } from 'next-auth';

export interface ExtendedUser extends User {
  active?: boolean;
  createdAt: string;
}
