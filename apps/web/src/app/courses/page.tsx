import { redirect } from "next/navigation";

import { getDefaultCountryPath, getDefaultBranchKey } from "@/lib/tenant-routing";

export default function CoursesPage() {
	redirect(`${getDefaultCountryPath()}/${getDefaultBranchKey()}/courses`);
}
