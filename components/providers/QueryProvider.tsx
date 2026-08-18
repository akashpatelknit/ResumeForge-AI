"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// One QueryClient per browser session (useState, not module scope) — a
// module-level singleton would leak query cache across different users on
// the server during SSR; useState guarantees a fresh client per mount.
export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Job Discovery's live Greenhouse fetch is slow (seconds, not
            // ms) until Redis caching is configured — staleTime keeps a
            // page revisit instant instead of re-running that fetch, and
            // refetchOnWindowFocus:false stops an unrelated tab-focus from
            // silently re-triggering it.
            staleTime: 60_000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      }),
  );

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
