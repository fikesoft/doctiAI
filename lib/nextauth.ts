import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GitHubProvider({
      clientId: process.env.GIT_CLIENT_ID!,
      clientSecret: process.env.GIT_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: "read:user repo user:email", // ← add user:email here
        },
      },
      profile(profile) {
        // GitHub sometimes returns `email: null`
        const email = profile.email ?? `${profile.id}@users.noreply.github.com`;

        return {
          id: profile.id.toString(),
          name: profile.name ?? profile.login,
          email, // now always a string
          image: profile.avatar_url,
          role: "user",
          balance: 0,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // FIRST SIGN-IN: user.id might be string or number,
        // so we coerce it here into a number once and for all.
        token.id =
          typeof user.id === "string" ? parseInt(user.id, 10) : user.id;
        token.role = user.role;
        token.balance = user.balance;
      } else {
        // ON SUBSEQUENT CALLS: if we ever wound up with
        // token.id as a string, parse it now.
        if (typeof token.id === "string") {
          token.id = parseInt(token.id, 10);
        }
        // (you can do the same for role/balance if needed)
      }
      return token;
    },

    async session({ session, token }) {
      // By this point, token.id is always a number—
      // TS can see that and won’t complain.
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.balance = token.balance as number;
      return session;
    },
  },
  pages: { error: "/auth/error" },
};
