"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "./use-auth";

export function useRequireAuth() {
	const router = useRouter();
	const { data, isPending } = useAuth();

	useEffect(() => {
		if (!data && !isPending) {
			router.push("/login");
		}
	}, [data, isPending, router]);

	return { data, isPending };
}
