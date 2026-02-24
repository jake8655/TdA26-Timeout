import type { Metadata } from "next";
import LoginClient from "./login-client";

export const metadata: Metadata = {
	title: "Login",
	description:
		"Log in to access your lecturer dashboard and manage your courses.",
};

export default function LoginPage() {
	return <LoginClient />;
}
