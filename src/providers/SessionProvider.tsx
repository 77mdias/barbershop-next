"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import { ThemeProvider } from "./ThemeProvider";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider>
      <NextAuthSessionProvider
        refetchInterval={0}
        refetchOnWindowFocus={true}
        refetchWhenOffline={false}
      >
        {children}
      </NextAuthSessionProvider>
    </ThemeProvider>
  );
}
