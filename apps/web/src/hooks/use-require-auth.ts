"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { getCountryPathFromPathname, getLocalizedLoginPath } from "@/lib/tenant-routing";

import { useAuth } from "./use-auth";

export function useRequireAuth({ redirectTo }: { redirectTo?: string } = {}) {
	const router = useRouter();
	const pathname = usePathname();
	const { data, isPending } = useAuth();

	useEffect(() => {
		if (!data && !isPending) {
			if (redirectTo) {
				router.push(redirectTo);
				return;
			}

			const countryKey = getCountryPathFromPathname(pathname).replace("/", "");
			router.push(getLocalizedLoginPath(countryKey));
		}
	}, [data, isPending, pathname, redirectTo, router]);

	return { data, isPending };
}
