import { useEffect, useRef, useState } from "react";
import { client } from "@/api-client/client.gen";
import type { CourseStatsResponse } from "@/api-client/types.gen";

export function useCourseStatsStream(
	courseId: string,
	{ enabled = true }: { enabled?: boolean } = {},
) {
	const [stats, setStats] = useState<CourseStatsResponse | null>(null);
	const [isConnected, setIsConnected] = useState(false);
	const eventSourceRef = useRef<EventSource | null>(null);

	useEffect(() => {
		if (!enabled) {
			setIsConnected(false);
			return;
		}

		let mounted = true;

		const baseUrl = client.getConfig().baseUrl;
		const url = `${baseUrl}/courses/${courseId}/stats/stream`;
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

		eventSource.addEventListener("stats_update", (event) => {
			if (!mounted) return;
			try {
				const data = JSON.parse(event.data) as CourseStatsResponse;
				setStats(data);
			} catch (error) {
				console.error("Failed to parse stats_update event:", error);
			}
		});

		eventSourceRef.current = eventSource;

		return () => {
			mounted = false;
			eventSource.close();
		};
	}, [courseId, enabled]);

	return { stats, isConnected };
}
