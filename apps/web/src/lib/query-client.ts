import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const createQueryClient = () => {
	const queryClient = new QueryClient({
		queryCache: new QueryCache({
			onError: (error) => {
				if (typeof window === "undefined") return;

				toast.error("Something went wrong", {
					description: error.message,
				});
			},
		}),
		mutationCache: new MutationCache({
			onError: (error) => {
				if (typeof window === "undefined") return;

				toast.error("Something went wrong", {
					description: error.message,
				});
			},

			onSuccess: async (_data, _variables, _context, mutation) => {
				if (mutation.options.meta?.skipInvalidate) {
					return;
				}

				await queryClient.invalidateQueries();
			},
		}),
		defaultOptions: {
			queries: {
				// With SSR, we usually want to set some default staleTime
				// above 0 to avoid refetching immediately on the client
				staleTime: 30 * 1000,
			},
		},
	});

	return queryClient;
};
