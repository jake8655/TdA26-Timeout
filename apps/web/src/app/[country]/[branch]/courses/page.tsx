import type { Metadata } from "next";

import TenantCoursesClient from "@/components/tenant/tenant-courses-client";

export const metadata: Metadata = {
	title: "Courses",
	description:
		"Browse and explore our collection of interactive courses designed to develop critical and creative thinking skills.",
};

export default function TenantCoursesPage() {
	return <TenantCoursesClient />;
}
