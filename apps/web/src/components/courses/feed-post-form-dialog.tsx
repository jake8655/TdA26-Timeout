"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MessageSquarePlus } from "lucide-react";
import { useState } from "react";
import z from "zod";
import {
	postCoursesByCourseIdFeedMutation,
	putCoursesByCourseIdFeedByPostIdMutation,
} from "@/api-client/@tanstack/react-query.gen";
import type { FeedItem } from "@/api-client/types.gen";
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
	message: z.string().min(1, "Message is required"),
});

interface FeedPostFormDialogProps {
	mode: "add" | "edit";
	courseId: string;
	post?: FeedItem;
	trigger: React.ReactElement;
}

export function FeedPostFormDialog({
	mode,
	courseId,
	post,
	trigger,
}: FeedPostFormDialogProps) {
	const [open, setOpen] = useState(false);
	const queryClient = useQueryClient();

	const createMutation = useMutation({
		...postCoursesByCourseIdFeedMutation(),
	});

	const updateMutation = useMutation({
		...putCoursesByCourseIdFeedByPostIdMutation(),
	});

	const form = useAppForm({
		defaultValues: {
			message: post?.message ?? "",
		},
		validators: {
			onChange: formSchema,
		},
		onSubmit: async ({ value }) => {
			if (mode === "add") {
				await createMutation.mutateAsync({
					path: { courseId },
					body: {
						message: value.message,
					},
				});
			} else if (post) {
				await updateMutation.mutateAsync({
					path: { courseId, postId: post.uuid },
					body: {
						message: value.message,
						edited: true,
					},
				});
			}
			form.reset();
			setOpen(false);
			await queryClient.invalidateQueries();
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={trigger} />
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{mode === "add" ? "Create Post" : "Edit Post"}
					</DialogTitle>
					<DialogDescription>
						{mode === "add"
							? "Share an update with your students."
							: "Update your post. Edited posts will be marked."}
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
					<form.AppField name="message">
						{(field) => (
							<field.TextareaField
								label="Message"
								placeholder="What's new?"
								rows={5}
							/>
						)}
					</form.AppField>

					<DialogFooter>
						<DialogClose render={<Button variant="outline">Cancel</Button>} />
						<form.AppForm>
							<form.SubscribeButton
								label={mode === "add" ? "Post" : "Save Changes"}
							/>
						</form.AppForm>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export function CreateFeedPostButton({ courseId }: { courseId: string }) {
	return (
		<FeedPostFormDialog
			mode="add"
			courseId={courseId}
			trigger={
				<Button variant="accent" size="sm">
					<MessageSquarePlus className="size-4" />
					<span className="hidden sm:inline">Create Post</span>
				</Button>
			}
		/>
	);
}

export function EditFeedPostButton({
	post,
	courseId,
}: {
	post: FeedItem;
	courseId: string;
}) {
	return (
		<FeedPostFormDialog
			mode="edit"
			courseId={courseId}
			post={post}
			trigger={
				<Button
					variant="ghost"
					size="icon-sm"
					className="size-8 text-muted-foreground hover:text-primary dark:hover:bg-primary/10"
				>
					<MessageSquarePlus className="size-4 rotate-0" />
				</Button>
			}
		/>
	);
}
