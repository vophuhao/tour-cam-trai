"use client";

import { Provider as ReduxProvider } from "react-redux";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { store } from "@/store";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <ReduxProvider store={store}>
      <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </ReduxProvider>
  );
}
