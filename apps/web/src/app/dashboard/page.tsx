import { redirect } from "next/navigation";

import { getDefaultBranchKey, getDefaultCountryPath } from "@/lib/tenant-routing";

export default function DashboardPage() {
	redirect(`${getDefaultCountryPath()}/${getDefaultBranchKey()}/dashboard`);
}
