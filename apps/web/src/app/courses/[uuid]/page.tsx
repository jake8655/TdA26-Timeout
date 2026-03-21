import type { Metadata } from "next";

import CourseDetailClient from "./course-detail-client";

export const metadata: Metadata = {
	title: "Course Details",
	description: "View course content, materials, quizzes, and interactive learning activities.",
};

export const dynamic = "force-static";

export default function CourseDetailPage() {
	return <CourseDetailClient />;
}
