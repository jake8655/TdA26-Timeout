"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Rocket } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import z from "zod";
import {
	getCoursesOptions,
	postCoursesMutation,
	putCoursesByCourseIdMutation,
} from "@/api-client/@tanstack/react-query.gen";
import type { CourseSummary } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import BackgroundGrid from "@/components/background-grid";
import EmptyState from "@/components/empty-state";
import LoadingPlaceholder from "@/components/loading-placeholder";
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
import { useRequireAuth } from "@/hooks/use-require-auth";

const formSchema = z.object({
	name: z.string().min(3, "Course name must be at least 3 characters"),
	description: z.string(),
});

function CourseFormDialog({
	mode,
	course,
	trigger,
}: {
	mode: "add" | "edit";
	course?: CourseSummary;
	trigger: React.ReactElement;
}) {
	const [open, setOpen] = useState(false);
	const addCourseMutation = useMutation({
		...postCoursesMutation(),
	});
	const updateCourseMutation = useMutation({
		...putCoursesByCourseIdMutation(),
	});

	const form = useAppForm({
		defaultValues: {
			name: course?.name ?? "",
			description: course?.description ?? "",
		},
		validators: {
			onChange: formSchema,
		},
		onSubmit: async ({ value }) => {
			if (mode === "add") {
				await addCourseMutation.mutateAsync({
					body: {
						name: value.name,
						description: value.description,
					},
				});
			} else if (course) {
				await updateCourseMutation.mutateAsync({
					path: { courseId: course.uuid },
					body: {
						name: value.name,
						description: value.description,
					},
				});
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

export default function Dashboard() {
	const {
		data: courses,
		isPending,
		isError,
		refetch,
	} = useQuery({
		...getCoursesOptions(),
	});
	const { data } = useRequireAuth();

	if (!data) {
		return <LoadingPlaceholder />;
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
							{data.username}
						</span>
					</h1>
					<p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
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

				{isPending ? (
					<Loader2 className="mx-auto size-16 animate-spin text-primary" />
				) : isError ? (
					<EmptyState
						title="Unable to load courses"
						description="Please try again in a moment."
						icon={<Rocket className="size-7 text-primary" />}
						action={
							<Button variant="outline" size="sm" onClick={() => refetch()}>
								Retry
							</Button>
						}
					/>
				) : (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5, delay: 0.2 }}
							className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
						>
							<AnimatePresence mode="popLayout">
								{courses.map((course, index) => (
									<CourseCard key={course.uuid} course={course} index={index} />
								))}
							</AnimatePresence>
						</motion.div>

						{courses.length === 0 && (
							<EmptyState
								title="No courses yet"
								description="Create your first course to get started."
								icon={<Plus className="size-7 text-primary" />}
								action={
									<CourseFormDialog
										mode="add"
										trigger={
											<Button variant="accent" className="gap-2">
												<Plus className="size-4" />
												Create Your First Course
											</Button>
										}
									/>
								}
							/>
						)}
					</>
				)}
			</div>
		</section>
	);
}

function CourseCard({
	course,
	index,
}: {
	course: CourseSummary;
	index: number;
}) {
	return (
		<motion.div
			layout
			initial={{ opacity: 0, scale: 0.9 }}
			animate={{ opacity: 1, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			transition={{ duration: 0.3, delay: index * 0.05 }}
			className="h-full"
		>
			<Link href={`/dashboard/courses/${course.uuid}`} className="block h-full">
				<Card className="group h-full border-white/5 bg-card/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:shadow-xl">
					<CardHeader className="pb-2">
						<CardTitle className="font-bold text-lg text-primary">
							{course.name}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<CardDescription className="line-clamp-2 min-h-[3rem] text-muted-foreground text-sm leading-relaxed">
							{course.description || (
								<span className="italic">No description available</span>
							)}
						</CardDescription>
						<div className="mt-4 inline-flex items-center gap-2 text-muted-foreground text-xs">
							<span className="uppercase tracking-[0.2em]">Open course</span>
						</div>
					</CardContent>
				</Card>
			</Link>
		</motion.div>
	);
}
