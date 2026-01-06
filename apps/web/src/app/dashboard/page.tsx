"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { ChevronRight, Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import z from "zod";
import {
	deleteCoursesByCourseIdMutation,
	getCoursesOptions,
	postCoursesMutation,
	putCoursesByCourseIdMutation,
} from "@/api-client/@tanstack/react-query.gen";
import type { CourseSummary } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import BackgroundGrid from "@/components/background-grid";
import LoadingPlaceholder from "@/components/loading-placeholder";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
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
import { useAuth } from "@/hooks/use-auth";

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

function DeleteCourseDialog({
	course,
	trigger,
}: {
	course: CourseSummary;
	trigger: React.ReactElement;
}) {
	const [open, setOpen] = useState(false);

	const deleteCourseMutation = useMutation({
		...deleteCoursesByCourseIdMutation(),
		onSuccess: () => {
			setOpen(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
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
					<Button
						variant="destructive"
						disabled={deleteCourseMutation.isPending}
						onClick={() =>
							deleteCourseMutation.mutate({
								// @ts-expect-error TdA is incompetent and I need to send all requests as json
								body: {},
								path: { courseId: course.uuid },
							})
						}
					>
						{deleteCourseMutation.isPending ? (
							<Loader2 className="animate-spin text-muted-foreground" />
						) : (
							"Delete"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export default function Dashboard() {
	const router = useRouter();
	const {
		data: courses,
		isPending,
		isError,
	} = useQuery({
		...getCoursesOptions(),
	});
	const { data, isPending: authLoading } = useAuth();

	useEffect(() => {
		if (!data && !authLoading) {
			router.push("/login");
		}
	}, [data, router, authLoading]);

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

				{isPending ? (
					<Loader2 className="mx-auto size-16 animate-spin text-primary" />
				) : isError ? (
					<div className="text-destructive">Error loading courses.</div>
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
						{course.description || (
							<span className="italic">No description available</span>
						)}
					</CardDescription>
				</CardContent>
				<CardFooter className="p-0">
					<Link
						href={`/dashboard/courses/${course.uuid}`}
						className="flex w-full items-center justify-between px-4 py-3 text-muted-foreground text-sm transition-colors hover:bg-primary/5 hover:text-primary"
					>
						Manage Materials
						<ChevronRight className="size-4" />
					</Link>
				</CardFooter>
			</Card>
		</motion.div>
	);
}
