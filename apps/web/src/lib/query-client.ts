import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

export const createQueryClient = () => {
	const queryclient = new QueryClient({
		queryCache: new QueryCache({
			onError: (error) => {
				if (typeof window === "undefined") return;

				console.error("Something went wrong", {
					description: error.message,
				});
			},
		}),
		mutationCache: new MutationCache({
			onError: (error) => {
				if (typeof window === "undefined") return;

				console.error("Something went wrong", {
					description: error.message,
				});
			},

			onSuccess: async () => {
				await queryclient.invalidateQueries();
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

	return queryclient;
};
