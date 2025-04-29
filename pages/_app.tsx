import { AppProps } from 'next/app';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { useState } from 'react';
import '../styles/globals.css';

// Create a function to handle API response errors
async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Attempt to parse error response
    const errorData = await res.json().catch(() => null);
    throw new Error(
      errorData?.message || `API Error: ${res.status} ${res.statusText}`
    );
  }
  return res;
}

export default function App({ Component, pageProps }: AppProps) {
  // Create a query client instance for React Query
  // This ensures a fresh query client for each user session
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
        retry: 1,
        // Set default query function to fetch from our API
        queryFn: async ({ queryKey }: { queryKey: string[] }) => {
          const res = await fetch(queryKey.join('/'));
          await throwIfResNotOk(res);
          return res.json();
        },
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <Component {...pageProps} />
      <Toaster />
    </QueryClientProvider>
  );
}