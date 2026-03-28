import type { Metadata } from "next";

import AuthLoginClient from "@/components/auth/auth-login-client";

export const metadata: Metadata = {
	title: "Localized Login",
	description: "Log in to your localized branch workspace.",
};

export default async function CountryLoginPage({
	params,
}: {
	params: Promise<{ country: string }>;
}) {
	const { country } = await params;
	return <AuthLoginClient mode="lecturer" countryKey={country} />;
}
