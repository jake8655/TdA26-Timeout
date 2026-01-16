import { useQuery } from "@tanstack/react-query";
import { Clock, Loader2, MessageSquare } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { getCoursesByCourseIdFeedOptions } from "@/api-client/@tanstack/react-query.gen";
import type { FeedItem } from "@/api-client/types.gen";
import { useCourseFeedStream } from "@/hooks/use-course-feed-stream";

type CourseFeedProps = {
	courseId: string;
	showActions?: boolean;
	editTrigger?: (item: FeedItem) => React.ReactNode;
	deleteTrigger?: (item: FeedItem) => React.ReactNode;
};

export function CourseFeed({
	courseId,
	showActions = false,
	editTrigger,
	deleteTrigger,
}: CourseFeedProps) {
	const { feedItems: streamItems, isConnected } = useCourseFeedStream(courseId);

	const { data: initialItems, isPending } = useQuery({
		...getCoursesByCourseIdFeedOptions({
			path: { courseId },
		}),
	});

	const allItems = (() => {
		if (!initialItems) return streamItems;

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
				new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
		);
	})();

	if (isPending) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="size-8 animate-spin text-primary" />
			</div>
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

			{allItems.length === 0 ? (
				<motion.div
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="flex flex-col items-center justify-center rounded-none border border-white/10 border-dashed py-16 text-center"
				>
					<MessageSquare className="mb-4 size-12 text-muted-foreground/50" />
					<p className="text-muted-foreground">No posts yet</p>
				</motion.div>
			) : (
				<AnimatePresence mode="popLayout">
					{allItems.map((item, index) => (
						<FeedItemCard
							key={item.uuid}
							item={item}
							showActions={showActions}
							editTrigger={editTrigger}
							deleteTrigger={deleteTrigger}
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
	index,
}: {
	item: FeedItem;
	showActions: boolean;
	editTrigger?: (item: FeedItem) => React.ReactNode;
	deleteTrigger?: (item: FeedItem) => React.ReactNode;
	index: number;
}) {
	const isSystem = item.type === "system";

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ duration: 0.3, delay: index * 0.03 }}
			className={`flex gap-3 rounded-none border bg-card/40 p-4 backdrop-blur-sm transition-colors duration-300 ${
				isSystem ? "border-white/5" : "border-white/5 hover:border-white/10"
			}`}
		>
			<div
				className={`flex size-10 shrink-0 items-center justify-center rounded-lg ${
					isSystem ? "bg-primary/10" : "bg-accent/10"
				}`}
			>
				<MessageSquare
					className={`size-5 ${isSystem ? "text-primary" : "text-accent"}`}
				/>
			</div>

			<div className="flex-1 space-y-2">
				<div className="flex items-start justify-between gap-2">
					<div className="flex-1">
						<p className="text-foreground leading-relaxed">{item.message}</p>
					</div>

					{showActions && !isSystem && (
						<div className="flex gap-1">
							{editTrigger?.(item)}
							{deleteTrigger?.(item)}
						</div>
					)}
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
