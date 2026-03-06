import { useQuery } from "@tanstack/react-query";
import { Clock, Loader2, Maximize2, MessageSquare } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
	getCoursesByCourseIdFeedOptions,
	getCoursesLecturerByCourseIdFeedOptions,
} from "@/api-client/@tanstack/react-query.gen";
import type { FeedItem } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import EmptyState from "@/components/empty-state";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { useCourseFeedStream } from "@/hooks/use-course-feed-stream";
import { cn } from "@/lib/utils";

export function CourseFeed({
	courseId,
	showActions = false,
	isLecturer = false,
	editTrigger,
	deleteTrigger,
	viewTrigger,
	onKick,
	onModuleReveal,
	onModuleHidden,
}: {
	courseId: string;
	showActions?: boolean;
	isLecturer?: boolean;
	editTrigger?: (item: FeedItem) => React.ReactNode;
	deleteTrigger?: (item: FeedItem) => React.ReactNode;
	viewTrigger?: (item: FeedItem) => React.ReactNode;
	onKick?: (payload: {
		reason?: string;
		status?: string;
		effectiveAt?: string;
	}) => void;
	onModuleReveal?: (payload: {
		moduleId: string;
		title?: string;
		revealedAt?: string;
	}) => void;
	onModuleHidden?: (payload: {
		moduleId: string;
		title?: string;
		hiddenAt?: string;
	}) => void;
}) {
	const {
		feedItems: streamItems,
		isConnected,
		kickPayload,
		moduleRevealPayload,
		moduleHiddenPayload,
		clearKick,
		clearModuleReveal,
		clearModuleHidden,
	} = useCourseFeedStream(courseId, { isLecturer });

	useEffect(() => {
		if (kickPayload) {
			onKick?.(kickPayload);
			clearKick();
		}
	}, [kickPayload, onKick, clearKick]);

	useEffect(() => {
		if (moduleRevealPayload) {
			onModuleReveal?.(moduleRevealPayload);
			clearModuleReveal();
		}
	}, [moduleRevealPayload, onModuleReveal, clearModuleReveal]);

	useEffect(() => {
		if (moduleHiddenPayload) {
			onModuleHidden?.(moduleHiddenPayload);
			clearModuleHidden();
		}
	}, [moduleHiddenPayload, onModuleHidden, clearModuleHidden]);

	const {
		data: initialItems,
		isPending,
		isError,
		refetch,
	} = useQuery({
		...(isLecturer
			? getCoursesLecturerByCourseIdFeedOptions({
					path: { courseId },
				})
			: getCoursesByCourseIdFeedOptions({
					path: { courseId },
				})),
	});

	const allItems = (() => {
		if (!Array.isArray(initialItems)) return streamItems;

		const combined = [...initialItems];
		for (const streamItem of streamItems) {
			const existingIndex = combined.findIndex(
				(item) => item.uuid === streamItem.uuid,
			);
			if (existingIndex >= 0) {
				combined[existingIndex] = streamItem;
			} else {
				combined.push(streamItem);
			}
		}

		return combined.sort(
			(a, b) =>
				new Date(b.updatedAt ?? b.createdAt).getTime() -
				new Date(a.updatedAt ?? a.createdAt).getTime(),
		);
	})();

	const visibleItems = allItems.filter(
		(item) =>
			item.type === "manual" ||
			item.message.startsWith("Module revealed:") ||
			item.message.startsWith("Module hidden:"),
	);

	if (isPending) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="size-8 animate-spin text-primary" />
			</div>
		);
	}

	if (isError && streamItems.length === 0) {
		return (
			<EmptyState
				title="Unable to load the feed"
				description="Please try again in a moment."
				action={
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						Retry
					</Button>
				}
			/>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			{isConnected && (
				<div className="flex items-center gap-2 text-muted-foreground text-xs">
					<div className="size-2 animate-pulse rounded-full bg-green-500" />
					<span>Live updates enabled</span>
				</div>
			)}

			{visibleItems.length === 0 ? (
				<EmptyState
					title="No posts yet"
					description={
						showActions
							? "Share updates, announcements, or resources with your students."
							: "There are no posts in this feed yet."
					}
					icon={<MessageSquare className="size-7 text-primary" />}
					className="border-dashed"
				/>
			) : (
				<AnimatePresence mode="popLayout">
					{visibleItems.map((item, index) => (
						<FeedItemCard
							key={item.uuid}
							item={item}
							showActions={showActions}
							editTrigger={editTrigger}
							deleteTrigger={deleteTrigger}
							viewTrigger={viewTrigger}
							index={index}
						/>
					))}
				</AnimatePresence>
			)}
		</div>
	);
}

function FeedItemCard({
	item,
	showActions,
	editTrigger,
	deleteTrigger,
	viewTrigger,
	index,
}: {
	item: FeedItem;
	showActions: boolean;
	editTrigger?: (item: FeedItem) => React.ReactNode;
	deleteTrigger?: (item: FeedItem) => React.ReactNode;
	viewTrigger?: (item: FeedItem) => React.ReactNode;
	index: number;
}) {
	const isSystem = item.type === "system";
	const title = item.message.startsWith("Module revealed:")
		? "Module Revealed"
		: item.message.startsWith("Module hidden:")
			? "Module Hidden"
			: isSystem
				? "System Message"
				: "Post";
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const MAX_MESSAGE_LENGTH = 200;
	const isTruncated = item.message.length > MAX_MESSAGE_LENGTH;
	const truncatedMessage = isTruncated
		? `${item.message.slice(0, MAX_MESSAGE_LENGTH)}...`
		: item.message;

	return (
		<>
			<motion.div
				layout
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95 }}
				transition={{ duration: 0.3, delay: index * 0.03 }}
				className={cn(
					"group flex gap-3 rounded-none border bg-card/40 p-4 backdrop-blur-sm transition-colors duration-200",
					isSystem ? "border-white/5" : "border-white/5",
				)}
			>
				<div
					className={cn(
						"flex size-10 shrink-0 items-center justify-center rounded-lg",
						isSystem ? "bg-primary/10" : "bg-accent/10",
					)}
				>
					<MessageSquare
						className={cn("size-5", isSystem ? "text-primary" : "text-accent")}
					/>
				</div>

				<div className="flex-1 space-y-2">
					<div className="flex items-start justify-between gap-2">
						<div className="flex-1">
							<p className="text-foreground leading-relaxed">
								{truncatedMessage}
							</p>
						</div>

						<div className="flex gap-1 transition-opacity group-hover:opacity-100 lg:opacity-0">
							{viewTrigger ? (
								viewTrigger(item)
							) : (
								<Button
									variant="ghost"
									size="icon-sm"
									className="size-8 text-muted-foreground hover:text-foreground dark:hover:bg-white/5"
									onClick={() => setIsDialogOpen(true)}
								>
									<Maximize2 />
								</Button>
							)}
							{showActions && !isSystem && (
								<>
									{editTrigger?.(item)}
									{deleteTrigger?.(item)}
								</>
							)}
						</div>
					</div>

					<div className="flex items-center gap-2 text-muted-foreground text-xs">
						<Clock className="size-3" />
						<span>{formatDate(item.createdAt)}</span>
						{item.edited && (
							<>
								<span className="text-white/20">•</span>
								<span className="italic">Edited</span>
							</>
						)}
					</div>
				</div>
			</motion.div>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="sm:max-w-2xl">
					<DialogHeader>
						<DialogTitle className="text-lg">{title}</DialogTitle>
						<DialogDescription className="flex items-center gap-2 pt-1">
							<Clock className="size-3.5" />
							<span>{formatFullDate(item.createdAt)}</span>
						</DialogDescription>
					</DialogHeader>
					<div className="max-h-[60vh] overflow-y-auto py-2">
						<p className="whitespace-pre-wrap text-base text-foreground leading-relaxed">
							{item.message}
						</p>
					</div>
					{item.edited && (
						<div className="text-muted-foreground text-sm italic">
							This post was edited
						</div>
					)}
				</DialogContent>
			</Dialog>
		</>
	);
}

function formatDate(dateString: string) {
	const date = new Date(dateString);
	const now = new Date();
	const diffMs = now.getTime() - date.getTime();
	const diffMins = Math.floor(diffMs / 60000);
	const diffHours = Math.floor(diffMins / 60);
	const diffDays = Math.floor(diffHours / 24);

	if (diffMins < 1) return "Just now";
	if (diffMins < 60) return `${diffMins}m ago`;
	if (diffHours < 24) return `${diffHours}h ago`;
	if (diffDays < 7) return `${diffDays}d ago`;

	return date.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
	});
}

function formatFullDate(dateString: string) {
	const date = new Date(dateString);
	return date.toLocaleString("en-US", {
		weekday: "long",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit",
		hour12: true,
	});
}
