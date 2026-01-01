"use client";

import { Edit2, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import { z } from "zod";
import { Button } from "@/components/animate-ui/components/buttons/button";
import BackgroundGrid from "@/components/background-grid";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { useAppForm } from "@/hooks/form";
import {
	addCourse,
	deleteCourse,
	getCourses,
	getCurrentUser,
	getIsLoggedIn,
	subscribe,
	updateCourse,
} from "@/lib/auth-store";

const courseSchema = z.object({
	name: z.string().min(3, "Course name must be at least 3 characters"),
	description: z.string().min(10, "Description must be at least 10 characters"),
});

function useAuthStore(): (
	| { isLoggedIn: true; currentUser: { username: string } }
	| { isLoggedIn: false; currentUser: null }
) & {
	courses: {
		id: string;
		name: string;
		description: string;
	}[];
} {
	const isLoggedIn = useSyncExternalStore(
		subscribe,
		getIsLoggedIn,
		getIsLoggedIn,
	);
	const currentUser = useSyncExternalStore(
		subscribe,
		getCurrentUser,
		getCurrentUser,
	);
	const courses = useSyncExternalStore(subscribe, getCourses, getCourses);

	if (!isLoggedIn) {
		return { isLoggedIn: false, currentUser: null, courses };
	}

	return {
		isLoggedIn: true,
		currentUser: currentUser as { username: string },
		courses,
	};
}

function CourseFormDialog({
	mode,
	course,
	trigger,
}: {
	mode: "add" | "edit";
	course?: { id: string; name: string; description: string };
	trigger: React.ReactElement;
}) {
	const [open, setOpen] = useState(false);

	const form = useAppForm({
		defaultValues: {
			name: course?.name ?? "",
			description: course?.description ?? "",
		},
		validators: {
			onChange: courseSchema,
		},
		onSubmit: async ({ value }) => {
			if (mode === "add") {
				addCourse(value.name, value.description);
			} else if (course) {
				updateCourse(course.id, value.name, value.description);
			}
			form.reset();
			setOpen(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={trigger} />
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>
						{mode === "add" ? "Add New Course" : "Edit Course"}
					</DialogTitle>
					<DialogDescription>
						{mode === "add"
							? "Create a new course for your students."
							: "Update the course details."}
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					<form.AppField name="name">
						{(field) => (
							<field.TextField
								label="Course Name"
								placeholder="Enter course name"
								className="h-10"
							/>
						)}
					</form.AppField>

					<form.AppField name="description">
						{(field) => (
							<field.TextField
								label="Description"
								placeholder="Enter course description"
								className="h-10"
							/>
						)}
					</form.AppField>

					<DialogFooter>
						<DialogClose render={<Button variant="outline">Cancel</Button>} />
						<form.AppForm>
							<form.SubscribeButton
								label={mode === "add" ? "Add Course" : "Save Changes"}
							/>
						</form.AppForm>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function DeleteCourseDialog({
	course,
	trigger,
}: {
	course: { id: string; name: string };
	trigger: React.ReactElement;
}) {
	return (
		<Dialog>
			<DialogTrigger render={trigger} />
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Delete Course</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete "
						<span className="text-accent">{course.name}</span>"? This action
						cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose render={<Button variant="outline">Cancel</Button>} />
					<DialogClose
						render={
							<Button
								variant="destructive"
								onClick={() => deleteCourse(course.id)}
							>
								Delete
							</Button>
						}
					/>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default function Dashboard() {
	const router = useRouter();
	const { isLoggedIn, currentUser, courses } = useAuthStore();

	useEffect(() => {
		if (!isLoggedIn) {
			router.push("/login");
		}
	}, [isLoggedIn, router]);

	if (!isLoggedIn) {
		return <div className="min-h-screen" />;
	}

	return (
		<section className="relative min-h-screen overflow-hidden pt-28 pb-16">
			<BackgroundGrid />

			<div className="relative z-10 mx-auto max-w-6xl px-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="mb-12"
				>
					<h1 className="mb-2 font-bold text-3xl text-foreground sm:text-4xl">
						Welcome back,{" "}
						<span className="bg-linear-to-r from-primary to-accent-4 bg-clip-text text-transparent">
							{currentUser.username}
						</span>
					</h1>
					<p className="text-lg text-muted-foreground">
						Manage your courses and track student progress.
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="mb-8 flex items-center justify-between"
				>
					<h2 className="font-semibold text-foreground text-xl">
						Your Courses
					</h2>
					<CourseFormDialog
						mode="add"
						trigger={
							<Button variant="accent" size="sm">
								<Plus />
								Add Course
							</Button>
						}
					/>
				</motion.div>

				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
				>
					<AnimatePresence mode="popLayout">
						{courses.map((course, index) => (
							<CourseCard key={course.id} course={course} index={index} />
						))}
					</AnimatePresence>
				</motion.div>

				{courses.length === 0 && (
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
						className="mt-12 text-center"
					>
						<div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-primary/10">
							<Plus className="size-10 text-primary" />
						</div>
						<h3 className="mb-2 font-semibold text-foreground text-lg">
							No courses yet
						</h3>
						<p className="mb-6 text-muted-foreground">
							Create your first course to get started.
						</p>
						<CourseFormDialog
							mode="add"
							trigger={
								<Button variant="accent" className="gap-2">
									<Plus className="size-4" />
									Create Your First Course
								</Button>
							}
						/>
					</motion.div>
				)}
			</div>
		</section>
	);
}

function CourseCard({
	course,
	index,
}: {
	course: { id: string; name: string; description: string };
	index: number;
}) {
	return (
		<motion.div
			key={course.id}
			layout
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			transition={{ duration: 0.3, delay: index * 0.05 }}
		>
			<Card className="group h-full border-white/5 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:shadow-xl">
				<CardHeader className="pb-2">
					<div className="flex items-start justify-between gap-2">
						<CardTitle className="font-bold text-lg text-primary">
							{course.name}
						</CardTitle>
						<div className="flex gap-1 transition-opacity group-hover:opacity-100 lg:opacity-0">
							<CourseFormDialog
								mode="edit"
								course={course}
								trigger={
									<Button
										variant="ghost"
										size="icon-sm"
										className="size-8 text-muted-foreground hover:text-primary dark:hover:bg-primary/10"
									>
										<Edit2 />
									</Button>
								}
							/>
							<DeleteCourseDialog
								course={course}
								trigger={
									<Button
										variant="ghost"
										size="icon-sm"
										className="size-8 text-muted-foreground hover:text-destructive dark:hover:bg-destructive/10"
									>
										<Trash2 />
									</Button>
								}
							/>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<CardDescription className="text-muted-foreground text-sm leading-relaxed">
						{course.description}
					</CardDescription>
				</CardContent>
			</Card>
		</motion.div>
	);
}
