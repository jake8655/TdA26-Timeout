import type { Metadata } from "next";
import DashboardCourseClient from "./dashboard-course-client";

export const metadata: Metadata = {
	title: "Course Management",
	description:
		"Manage course content, materials, quizzes, and student engagement.",
};

export const dynamic = "force-static";

export default function DashboardCoursePage() {
	return <DashboardCourseClient />;
}
