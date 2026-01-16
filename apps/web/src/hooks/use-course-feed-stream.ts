import { useEffect, useRef, useState } from "react";
import { client } from "@/api-client/client.gen";
import type { FeedItem } from "@/api-client/types.gen";

export function useCourseFeedStream(courseId: string) {
	const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
	const [isConnected, setIsConnected] = useState(false);
	const eventSourceRef = useRef<EventSource | null>(null);

	useEffect(() => {
		let mounted = true;

		const baseUrl = client.getConfig().baseUrl;
		const url = `${baseUrl}/courses/${courseId}/feed/stream`;
		const eventSource = new EventSource(url);

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

		eventSource.addEventListener("new_post", (event) => {
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
		});

		eventSourceRef.current = eventSource;

		return () => {
			mounted = false;
			eventSource.close();
		};
	}, [courseId]);

	return { feedItems, isConnected };
}
