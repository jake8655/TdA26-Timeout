import type { AuthData } from "@/hooks/use-auth";

function resolveCountryKey(authData: AuthData | null) {
	if (!authData?.countryKey) {
		return "cz-1";
	}

	return authData.countryKey;
}

function resolveBranchKey(authData: AuthData | null) {
	if (authData?.branchKey) {
		return authData.branchKey;
	}

	if (authData?.branchId) {
		return `branch-${authData.branchId}`;
	}

	return "branch-1";
}

export function getDefaultBranchKey() {
	return "branch-1";
}

export function getDefaultCountryPath() {
	return "/cz-1";
}

export function getCountryPathFromPathname(pathname: string) {
	const chunks = pathname.split("/").filter(Boolean);
	if (chunks.length === 0) {
		return getDefaultCountryPath();
	}
	const country = chunks[0];
	if (!country) {
		return getDefaultCountryPath();
	}

	if (/^[a-z]{2}-\d+$/i.test(country)) {
		return `/${country}`;
	}

	return getDefaultCountryPath();
}

export function getBranchKeyFromPathname(pathname: string) {
	const chunks = pathname.split("/").filter(Boolean);
	const branch = chunks[1];
	if (branch && /^branch-\d+$/i.test(branch)) {
		return branch;
	}

	return getDefaultBranchKey();
}

export function getScopedCoursesPathFromPathname(pathname: string) {
	const countryPath = getCountryPathFromPathname(pathname);
	const branchKey = getBranchKeyFromPathname(pathname);
	return `${countryPath}/${branchKey}/courses`;
}

export function getLocalizedLoginPath(countryKey?: string) {
	return `/${countryKey || "cz-1"}/login`;
}

export function getLocalizedManagerLoginPath(countryKey?: string) {
	return `/${countryKey || "cz-1"}/manager/login`;
}

export function getAdminLoginPath() {
	return "/admin/login";
}

export function getDashboardPath(authData: AuthData | null) {
	if (!authData) {
		return "/login";
	}

	if (authData.role === "admin") {
		return "/admin";
	}

	const countryKey = resolveCountryKey(authData);
	const branchKey = resolveBranchKey(authData);
	if (authData.role === "manager") {
		return `/${countryKey}/${branchKey}/manager`;
	}
	return `/${countryKey}/${branchKey}/dashboard`;
}

export function getCoursesPath(authData: AuthData | null) {
	const countryKey = resolveCountryKey(authData);
	const branchKey = resolveBranchKey(authData);
	return `/${countryKey}/${branchKey}/courses`;
}

export function getCoursePath(authData: AuthData | null, uuid: string) {
	return `${getCoursesPath(authData)}/${uuid}`;
}

export function getManageCoursePath(authData: AuthData | null, uuid: string) {
	return `${getDashboardPath(authData)}/courses/${uuid}`;
}
