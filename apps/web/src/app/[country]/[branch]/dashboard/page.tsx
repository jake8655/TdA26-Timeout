import type { Metadata } from "next";

import DashboardClient from "@/app/dashboard/dashboard-client";

export const metadata: Metadata = {
	title: "Dashboard",
	description: "Manage your courses, track student progress, and create new learning content.",
};

export default function TenantDashboardPage() {
	return <DashboardClient />;
}
