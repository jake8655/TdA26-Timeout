"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";

import { deleteCoursesByCourseIdFeedByPostIdMutation } from "@/api-client/@tanstack/react-query.gen";
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

interface DeleteFeedPostDialogProps {
	courseId: string;
	post: FeedItem;
	trigger: React.ReactElement;
}

export function DeleteFeedPostDialog({ courseId, post, trigger }: DeleteFeedPostDialogProps) {
	const [open, setOpen] = useState(false);

	const deleteMutation = useMutation({
		...deleteCoursesByCourseIdFeedByPostIdMutation(),
		onSuccess: () => {
			setOpen(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={trigger} />
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Delete Post</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete this post? This action cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<div className="border-t border-white/5 pt-4">
					<p className="text-muted-foreground text-sm">{post.message}</p>
				</div>
				<DialogFooter>
					<DialogClose render={<Button variant="outline">Cancel</Button>} />
					<Button
						variant="destructive"
						disabled={deleteMutation.isPending}
						onClick={() =>
							deleteMutation.mutate({
								path: { courseId, postId: post.uuid },
							})
						}
					>
						{deleteMutation.isPending ? (
							<Loader2 className="text-muted-foreground animate-spin" />
						) : (
							"Delete"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export function DeleteFeedPostButton({ post, courseId }: { post: FeedItem; courseId: string }) {
	return (
		<DeleteFeedPostDialog
			courseId={courseId}
			post={post}
			trigger={
				<Button
					variant="ghost"
					size="icon-sm"
					className="text-muted-foreground hover:text-destructive dark:hover:bg-destructive/10 size-8"
				>
					<Trash2 />
				</Button>
			}
		/>
	);
}
