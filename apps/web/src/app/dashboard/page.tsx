import type { Metadata } from "next";

import DashboardClient from "./dashboard-client";

export const metadata: Metadata = {
	title: "Dashboard",
	description: "Manage your courses, track student progress, and create new learning content.",
};

export default function DashboardPage() {
	return <DashboardClient />;
}
