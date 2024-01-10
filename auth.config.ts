import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { db } from "./app/lib/data";
// import { UpstashRedisAdapter } from "@next-auth/upstash-redis-adapter";

const getGoogleCredentials = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || clientId.length === 0) {
    throw new Error("Google Client Id cannot be accessed");
  }
  if (!clientSecret || clientSecret.length === 0) {
    throw new Error("Google Client Secret cannot be accessed");
  }

  return { clientSecret, clientId } as const;
};

const { clientId, clientSecret } = getGoogleCredentials();

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  // adapter: UpstashRedisAdapter(db),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId,
      clientSecret,
      httpOptions: {
        timeout: 10000,
      },
    }),
  ],
  callbacks: {
    // Use this method when you are not using an adapter
    async signIn({ profile }) {
      if (!profile?.email) {
        throw new Error("No profile");
      }
      const dbUser = (await db.get(`user:${profile.sub}`)) as User | null;
      if (!dbUser) {
        await db.set(`user:${profile.sub}`, {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          avatar: profile.image,
        });
      }
      return true;
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.image = token.picture;
        session.user.email = token.email;
      }
      return session;
    },

    async jwt({ token, profile }) {
      if (!!profile) {
        const dbUser = (await db.get(`user:${profile.sub}`)) as User | null;
        if (!dbUser) {
          throw new Error("No User found!");
        }
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.picture = dbUser.avatar;
        token.id = dbUser.id;
      }
      return token;
    },

    // Works on next-auth@beta-v5
    // authorized({ request: { nextUrl }, auth }) {
    //   const isLoggedIn = !!auth?.user;
    //   const onHomePath = !nextUrl.pathname.startsWith("/login");
    //   if (onHomePath) {
    //     if (isLoggedIn) return true;
    //     return false;
    //   } else if (isLoggedIn) {
    //     return Response.redirect(new URL("/", nextUrl));
    //   }
    //   return true;
    // },

    redirect() {
      return "/";
    },
  },
} satisfies NextAuthOptions;
