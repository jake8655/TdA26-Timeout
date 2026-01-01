"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/hooks/use-auth";
import { createQueryClient } from "@/lib/query-client";
import { Toaster } from "./ui/sonner";

const queryClient = createQueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
	return (
		<QueryClientProvider client={queryClient}>
			<AuthProvider>
				{children}
				<Toaster />
			</AuthProvider>
		</QueryClientProvider>
	);
}
