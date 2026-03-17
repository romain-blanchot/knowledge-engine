/**
 * Session Provider Component
 *
 * Wraps the application with NextAuth SessionProvider for client-side session access.
 * This must be a client component to use React Context.
 *
 * Usage:
 *   <SessionProvider>{children}</SessionProvider>
 */

"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import type { Session } from "next-auth";

interface SessionProviderProps {
  children: React.ReactNode;
  session?: Session | null;
}

export function SessionProvider({ children, session }: SessionProviderProps) {
  return <NextAuthSessionProvider session={session}>{children}</NextAuthSessionProvider>;
}
