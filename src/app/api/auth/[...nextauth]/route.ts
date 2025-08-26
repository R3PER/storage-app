import type { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '../../../../lib/mongodb';
import UserModel from '../../../../models/User';

// Using types from next-auth.d.ts

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          return null;
        }

        try {
          console.log('Authorizing user:', credentials.username);
          await connectDB();
          const user = await UserModel.findOne({ username: credentials.username });

          if (!user) {
            console.log('User not found:', credentials.username);
            return null;
          }

          const isValidPassword = await user.comparePassword(credentials.password);
          if (!isValidPassword) {
            console.log('Invalid password for user:', credentials.username);
            return null;
          }

          // Check if user can access the system
          if (!user.active || !user.approved) {
            console.log('User access denied:', credentials.username, {
              active: user.active,
              approved: user.approved
            });
            
            // Throw specific error for unapproved accounts
            if (user.active && !user.approved) {
              throw new Error('PENDING_APPROVAL');
            }
            
            // Throw specific error for inactive accounts
            if (!user.active) {
              throw new Error('ACCOUNT_INACTIVE');
            }
            
            return null;
          }

          // Update lastActive timestamp
          user.lastActive = new Date();
          await user.save();

          console.log('User authorized successfully:', {
            id: user._id,
            username: user.username,
            group: user.group,
            active: user.active
          });

          return {
            id: user._id.toString(),
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            group: user.group || 'user',
            active: user.active,
            createdAt: user.createdAt,
            lastActive: user.lastActive
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        console.log('Creating JWT token for user:', user.username);
        token.id = user.id;
        token.username = user.username;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.email = user.email;
        token.group = user.group;
        token.active = user.active;
        token.createdAt = user.createdAt;
        token.lastActive = user.lastActive;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        console.log('Creating session for user:', token.username);
        session.user = {
          id: token.id as string,
          username: token.username as string,
          firstName: token.firstName as string,
          lastName: token.lastName as string,
          email: token.email as string,
          group: token.group as string,
          active: token.active as boolean,
          createdAt: token.createdAt as Date,
          lastActive: token.lastActive as Date
        };
        console.log('Session created with user data:', session.user);
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt'
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: true, // Enable debug mode to see more detailed logs
  events: {
    async signIn({ user }) {
      // Log successful sign-in
      console.log('User signed in successfully:', user.username);
    },
    async signOut({ token }) {
      // Log sign-out
      console.log('User signed out:', token?.username);
    }
  },
  pages: {
    signIn: '/login',
    error: '/login'
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };

