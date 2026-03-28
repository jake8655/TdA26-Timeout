import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const STATIC_PREFIXES = ["/_next", "/api", "/favicon", "/logo", "/icons"];

function isStaticPath(pathname: string) {
	return STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isCountryKey(value: string) {
	return /^[a-z]{2}-\d+$/i.test(value);
}

function isBranchKey(value: string) {
	return /^branch-\d+$/i.test(value);
}

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	if (isStaticPath(pathname)) {
		return NextResponse.next();
	}

	if (pathname === "/") {
		return NextResponse.next();
	}

	if (
		pathname.startsWith("/admin") ||
		pathname.startsWith("/manager") ||
		pathname.startsWith("/login")
	) {
		return NextResponse.next();
	}

	const segments = pathname.split("/").filter(Boolean);
	if (segments.length === 0) {
		return NextResponse.next();
	}
	const firstSegment = segments[0];
	if (!firstSegment) {
		return NextResponse.next();
	}

	if (!isCountryKey(firstSegment)) {
		const url = request.nextUrl.clone();
		url.pathname = "/cz-1";
		return NextResponse.redirect(url);
	}

	const secondSegment = segments[1];
	if (!secondSegment) {
		return NextResponse.next();
	}

	if (
		!["login", "manager", "privacy", "terms"].includes(secondSegment) &&
		!isBranchKey(secondSegment)
	) {
		const url = request.nextUrl.clone();
		url.pathname = `/${firstSegment}/branch-1`;
		return NextResponse.redirect(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/:path*"],
};
