import { useEffect, useRef, useState } from "react";
import { client } from "@/api-client/client.gen";
import type { FeedItem } from "@/api-client/types.gen";

type KickPayload = {
	reason?: string;
	status?: string;
	effectiveAt?: string;
};

type ModuleRevealPayload = {
	moduleId: string;
	title?: string;
	revealedAt?: string;
};

export function useCourseFeedStream(courseId: string) {
	const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
	const [isConnected, setIsConnected] = useState(false);
	const [kickPayload, setKickPayload] = useState<KickPayload | null>(null);
	const [moduleRevealPayload, setModuleRevealPayload] =
		useState<ModuleRevealPayload | null>(null);
	const eventSourceRef = useRef<EventSource | null>(null);

	useEffect(() => {
		let mounted = true;

		const baseUrl = client.getConfig().baseUrl;
		const url = `${baseUrl}/courses/${courseId}/feed/stream`;
		const eventSource = new EventSource(url, { withCredentials: true });

		eventSource.onopen = () => {
			if (mounted) {
				setIsConnected(true);
			}
		};

		eventSource.onerror = () => {
			if (mounted) {
				setIsConnected(false);
			}
		};

		const handleFeedItem = (event: MessageEvent) => {
			if (!mounted) return;
			try {
				const data = JSON.parse(event.data) as FeedItem;
				setFeedItems((prev) => {
					const existingIndex = prev.findIndex(
						(item) => item.uuid === data.uuid,
					);
					if (existingIndex >= 0) {
						const updated = [...prev];
						updated[existingIndex] = data;
						return updated.sort(
							(a, b) =>
								new Date(b.createdAt).getTime() -
								new Date(a.createdAt).getTime(),
						);
					}
					return [data, ...prev].sort(
						(a, b) =>
							new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
					);
				});
			} catch (error) {
				console.error("Failed to parse SSE message:", error);
			}
		};

		eventSource.addEventListener("new_post", handleFeedItem);
		eventSource.addEventListener("system_event", handleFeedItem);

		eventSource.addEventListener("course_kick", (event) => {
			if (!mounted) return;
			try {
				const data = JSON.parse(event.data) as KickPayload;
				setKickPayload(data);
			} catch (error) {
				console.error("Failed to parse kick event:", error);
			}
		});

		eventSource.addEventListener("module_revealed", (event) => {
			if (!mounted) return;
			try {
				const data = JSON.parse(event.data) as ModuleRevealPayload;
				setModuleRevealPayload(data);
			} catch (error) {
				console.error("Failed to parse module revealed event:", error);
			}
		});

		eventSourceRef.current = eventSource;

		return () => {
			mounted = false;
			eventSource.close();
		};
	}, [courseId]);

	const clearKick = () => setKickPayload(null);
	const clearModuleReveal = () => setModuleRevealPayload(null);
	return {
		feedItems,
		isConnected,
		kickPayload,
		moduleRevealPayload,
		clearKick,
		clearModuleReveal,
	};
}
