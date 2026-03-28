import type { Metadata } from "next";

import AuthLoginClient from "@/components/auth/auth-login-client";

export const metadata: Metadata = {
	title: "Manager Login",
	description: "Log in to manage your local branch and lecturer credentials.",
};

export default function ManagerLoginPage() {
	return <AuthLoginClient mode="manager" />;
}
