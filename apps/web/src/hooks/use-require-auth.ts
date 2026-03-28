"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { getCountryPathFromPathname, getLocalizedLoginPath } from "@/lib/tenant-routing";

import { useAuth } from "./use-auth";

export function useRequireAuth() {
	const router = useRouter();
	const pathname = usePathname();
	const { data, isPending } = useAuth();

	useEffect(() => {
		if (!data && !isPending) {
			const countryKey = getCountryPathFromPathname(pathname).replace("/", "");
			router.push(getLocalizedLoginPath(countryKey));
		}
	}, [data, isPending, pathname, router]);

	return { data, isPending };
}
