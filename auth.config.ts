import type { NextAuthConfig } from "next-auth";

// Edge-safe config (used by middleware). No Prisma / bcrypt here —
// those only run in the Node runtime via auth.ts.
export default {
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = request.nextUrl;

      const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/listing/new");
      const isAdmin = pathname.startsWith("/admin");

      if (isAdmin) {
        return isLoggedIn && auth.user.role === "ADMIN";
      }
      if (isDashboard) {
        return isLoggedIn;
      }
      return true;
    },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "LISTER" | "ADMIN";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
