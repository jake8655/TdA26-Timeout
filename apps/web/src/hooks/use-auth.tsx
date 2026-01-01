import { useQuery } from "@tanstack/react-query";
import { createContext, use } from "react";
import z from "zod";
import { env } from "@/env";

export const authSchema = z.object({
	username: z.string(),
});
export type AuthData = z.infer<typeof authSchema>;

export function useAuth(): AuthContextType {
	const { data, isPending } = useQuery({
		queryKey: ["auth"],
		queryFn: async () => {
			const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}/auth/me`, {
				credentials: "include",
			});

			if (res.status === 401) return null;

			if (!res.ok) throw new Error("Failed when communicating with the server");

			const json = await res.json();
			const { success, data, error } = authSchema.safeParse(json);

			if (!success) {
				console.error("Invalid auth data", error);
				throw new Error("Failed when communicating with the server");
			}

			return data;
		},
		// Do not retry 401 errors
		retry: false,
		staleTime: 5 * 60 * 1000,
	});

	if (isPending) {
		return { isPending: true, data: null };
	}

	return { isPending: false, data: data || null };
}

type AuthContextType =
	| {
			isPending: true;
			data: null;
	  }
	| {
			isPending: false;
			data: AuthData | null;
	  };
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const authData = useAuth();

	return (
		<AuthContext.Provider value={authData}>{children}</AuthContext.Provider>
	);
}

export function useAuthContext() {
	const ctx = use(AuthContext);
	if (!ctx) throw new Error("useAuthContext must be within AuthProvider");

	return ctx;
}

export async function logout() {
	await fetch(`${env.NEXT_PUBLIC_API_BASE}/auth/logout`, {
		method: "POST",
		credentials: "include",
	});
}
