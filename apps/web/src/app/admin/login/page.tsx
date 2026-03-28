import type { Metadata } from "next";

import AuthLoginClient from "@/components/auth/auth-login-client";

export const metadata: Metadata = {
	title: "Global Admin Login",
	description: "Log in to access global administration for countries and branches.",
};

export default function AdminLoginPage() {
	return <AuthLoginClient mode="admin" />;
}
