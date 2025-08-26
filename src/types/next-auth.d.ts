import 'next-auth';

declare module 'next-auth' {
  interface User {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    group: string;
    active: boolean;
    createdAt: Date;
    lastActive?: Date;
  }

  interface Session {
    user: User & {
      id: string;
      firstName: string;
      lastName: string;
      group: string;
      active: boolean;
      createdAt: Date;
      lastActive?: Date;
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    firstName: string;
    lastName: string;
    group: string;
    active: boolean;
    createdAt: Date;
    lastActive?: Date;
  }
}
