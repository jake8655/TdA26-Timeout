import { useQuery } from "@tanstack/react-query";
import { createContext, use } from "react";
import z from "zod";

import { getAuthMe, postAuthLogout } from "@/api-client/sdk.gen";

export const authSchema = z.object({
	username: z.string(),
	displayName: z.string().optional().default(""),
	role: z.enum(["admin", "manager", "lecturer"]).optional().default("lecturer"),
	countryKey: z.string().optional().default(""),
	countryId: z.string().optional().default(""),
	branchId: z.string().optional().default(""),
	branchKey: z.string().optional().default(""),
	branchName: z.string().optional().default(""),
});
export type AuthData = z.infer<typeof authSchema>;

export function useAuthQuery(): AuthContextType {
	const { data, isPending } = useQuery<AuthData | null>({
		queryKey: ["auth"],
		queryFn: async () => {
			let json: unknown;
			try {
				const response = await getAuthMe({
					throwOnError: true,
				});
				json = response.data;
			} catch {
				return null;
			}

			const { success, data, error } = authSchema.safeParse(json);

			if (!success) {
				console.error("Invalid auth data", error);
				throw new Error("Failed when communicating with the server");
			}

			return data;
		},
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
	const authData = useAuthQuery();

	return <AuthContext.Provider value={authData}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const ctx = use(AuthContext);
	if (!ctx) throw new Error("useAuth must be within AuthProvider");

	return ctx;
}

export async function logout() {
	await postAuthLogout({
		throwOnError: true,
	});
}
