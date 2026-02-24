import type { Metadata } from "next";
import CoursesClient from "./courses-client";

export const metadata: Metadata = {
	title: "Courses",
	description:
		"Browse and explore our collection of interactive courses designed to develop critical and creative thinking skills.",
};

export default function CoursesPage() {
	return <CoursesClient />;
}
