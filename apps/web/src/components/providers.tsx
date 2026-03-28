"use client";

import { QueryClientProvider } from "@tanstack/react-query";

import { client } from "@/api-client/client.gen";
import { env } from "@/env";
import { AuthProvider } from "@/hooks/use-auth";
import { createQueryClient } from "@/lib/query-client";
import SupportMessageWidget from "@/components/support/support-message-widget";

import { Toaster } from "./ui/sonner";

client.setConfig({
	baseUrl: env.NEXT_PUBLIC_API_BASE,
	credentials: "include",
});

const queryClient = createQueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				{children}
				<SupportMessageWidget />
				<Toaster />
			</AuthProvider>
		</QueryClientProvider>
	);
}
