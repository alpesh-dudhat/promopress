import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/features/auth/types";

// Edge-safe config used by middleware (no Prisma/bcrypt imports allowed
// here — those are Node-only and live in auth.ts instead).
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isMockupRoute = nextUrl.pathname.startsWith("/mockups");

      if (isAdminRoute) {
        return isLoggedIn && auth.user.role === "ADMIN";
      }
      if (isMockupRoute) {
        return isLoggedIn;
      }
      return true;
    },
    // These only read/write JWT claims (no Prisma/bcrypt), so they're
    // edge-safe and must live here, not in auth.ts — otherwise middleware
    // (which only loads this file) never sees role/id on the session.
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role: UserRole }).role;
      }
      return token;
    },
    session({ session, token }) {
      session.user.id = token.id;
      session.user.role = token.role;
      return session;
    },
  },
  providers: [],
};
