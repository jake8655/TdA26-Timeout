import type { Metadata } from "next";

import AuthLoginClient from "@/components/auth/auth-login-client";

export const metadata: Metadata = {
	title: "Localized Manager Login",
	description: "Log in to manage your branch in this country.",
};

export default async function CountryManagerLoginPage({
	params,
}: {
	params: Promise<{ country: string }>;
}) {
	const { country } = await params;
	return <AuthLoginClient mode="manager" countryKey={country} />;
}
