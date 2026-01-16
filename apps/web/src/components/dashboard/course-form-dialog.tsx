"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import z from "zod";
import {
	postCoursesMutation,
	putCoursesByCourseIdMutation,
} from "@/api-client/@tanstack/react-query.gen";
import type { CourseSummary } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
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

const formSchema = z.object({
	name: z.string().min(3, "Course name must be at least 3 characters"),
	description: z.string(),
});

export function CourseFormDialog({
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
