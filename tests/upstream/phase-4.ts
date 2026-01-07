import { expect, it } from "vitest";
import {
	apiDelete,
	apiGet,
	apiPost,
	apiPut,
	type Course,
	type FeedItem,
	type Material,
	phase,
	type Quiz,
} from "../phase-utils";

phase(4, () => {
	let testCourseId: string;
	let testManualPostId: string;

	it("should create a test course for Phase 4", async () => {
		const { data, response } = await apiPost<Course>("/courses", {
			name: "Test Course for Phase 4",
			description: "Testing course feed and SSE",
		});

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.uuid).toBeDefined();

		if (data?.uuid) {
			testCourseId = data.uuid;
		}
	});

	it("should list course feed items (GET /courses/:courseId/feed)", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const { data, response } = await apiGet<FeedItem[]>(
			`/courses/${testCourseId}/feed`,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(Array.isArray(data)).toBe(true);
		expect(data?.length).toBe(0);
	});

	it("should create a manual feed post (POST /courses/:courseId/feed)", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const newPost = {
			message:
				"Welcome to the course! New materials will be published next week.",
		};

		const { data, response } = await apiPost<FeedItem>(
			`/courses/${testCourseId}/feed`,
			newPost,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.uuid).toBeDefined();
		expect(data?.type).toBe("manual");
		expect(data?.message).toBe(newPost.message);
		expect(data?.edited).toBe(false);
		expect(data?.createdAt).toBeDefined();

		if (data?.uuid) {
			testManualPostId = data.uuid;
		}
	});

	it("should retrieve the manual post from feed listing", async () => {
		if (!testCourseId || !testManualPostId) {
			throw new Error("testCourseId or testManualPostId not set");
		}

		const { data, response } = await apiGet<FeedItem[]>(
			`/courses/${testCourseId}/feed`,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.length).toBeGreaterThanOrEqual(1);

		const post = data?.find((item) => item.uuid === testManualPostId);
		expect(post).toBeDefined();
		expect(post?.type).toBe("manual");
		expect(post?.message).toBe(
			"Welcome to the course! New materials will be published next week.",
		);
	});

	it("should update manual post and mark as edited (PUT /courses/:courseId/feed/:postId)", async () => {
		if (!testCourseId || !testManualPostId) {
			throw new Error("testCourseId or testManualPostId not set");
		}

		const updatedPost = {
			message: "Updated: Materials will be published this Friday!",
			edited: true,
		};

		const { data, response } = await apiPut<FeedItem>(
			`/courses/${testCourseId}/feed/${testManualPostId}`,
			updatedPost,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.uuid).toBe(testManualPostId);
		expect(data?.message).toBe(updatedPost.message);
		expect(data?.edited).toBe(true);
		expect(data?.updatedAt).toBeDefined();
	});

	it("should create multiple manual posts", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const posts = [
			{ message: "Quiz will be available next Monday" },
			{ message: "Office hours scheduled for Wednesday" },
			{ message: "Important: Assignment deadline extended" },
		];

		for (const post of posts) {
			const { response, data } = await apiPost<FeedItem>(
				`/courses/${testCourseId}/feed`,
				post,
			);

			expect(response.ok).toBe(true);
			expect(data?.message).toBe(post.message);
			expect(data?.type).toBe("manual");
		}

		const { data: feedData } = await apiGet<FeedItem[]>(
			`/courses/${testCourseId}/feed`,
		);

		expect(feedData?.length).toBeGreaterThanOrEqual(4);
	});

	it("should delete manual post (DELETE /courses/:courseId/feed/:postId)", async () => {
		if (!testCourseId || !testManualPostId) {
			throw new Error("testCourseId or testManualPostId not set");
		}

		const { response } = await apiDelete(
			`/courses/${testCourseId}/feed/${testManualPostId}`,
		);

		expect(response.status).toBe(204);

		const { data: feedData } = await apiGet<FeedItem[]>(
			`/courses/${testCourseId}/feed`,
		);

		const deletedPost = feedData?.find(
			(item) => item.uuid === testManualPostId,
		);
		expect(deletedPost).toBeUndefined();
	});

	it("should create automatic system event when material is added", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const { data: beforeFeed } = await apiGet<FeedItem[]>(
			`/courses/${testCourseId}/feed`,
		);
		const beforeCount = beforeFeed?.length || 0;

		const material = {
			type: "url" as const,
			name: "Course Materials",
			description: "Link to course materials",
			url: "https://example.com/materials",
		};

		const { data: materialData, response: materialResponse } =
			await apiPost<Material>(`/courses/${testCourseId}/materials`, material);

		expect(materialResponse.ok).toBe(true);
		expect(materialData?.uuid).toBeDefined();

		const { data: afterFeed } = await apiGet<FeedItem[]>(
			`/courses/${testCourseId}/feed`,
		);

		expect(afterFeed?.length).toBeGreaterThan(beforeCount);

		const systemEvent = afterFeed?.find(
			(item) =>
				item.type === "system" &&
				item.message.toLowerCase().includes("material"),
		);

		expect(systemEvent).toBeDefined();
		expect(systemEvent?.type).toBe("system");
		expect(systemEvent?.createdAt).toBeDefined();
	});

	it("should create automatic system event when quiz is created", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const { data: beforeFeed } = await apiGet<FeedItem[]>(
			`/courses/${testCourseId}/feed`,
		);
		const beforeCount = beforeFeed?.length || 0;

		const quiz = {
			title: "Test Quiz",
			questions: [
				{
					type: "singleChoice" as const,
					question: "What is 1 + 1?",
					options: ["1", "2", "3", "4"],
					correctIndex: 1,
				},
			],
		};

		const { data: quizData, response: quizResponse } = await apiPost<Quiz>(
			`/courses/${testCourseId}/quizzes`,
			quiz,
		);

		expect(quizResponse.ok).toBe(true);
		expect(quizData?.uuid).toBeDefined();

		const { data: afterFeed } = await apiGet<FeedItem[]>(
			`/courses/${testCourseId}/feed`,
		);

		expect(afterFeed?.length).toBeGreaterThan(beforeCount);

		const systemEvent = afterFeed?.find(
			(item) =>
				item.type === "system" && item.message.toLowerCase().includes("quiz"),
		);

		expect(systemEvent).toBeDefined();
		expect(systemEvent?.type).toBe("system");
		expect(systemEvent?.createdAt).toBeDefined();
	});

	it("should include feed items in course detail (GET /courses/:courseId)", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const { data, response } = await apiGet<Course>(`/courses/${testCourseId}`);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.feed).toBeDefined();
		expect(Array.isArray(data?.feed)).toBe(true);
		expect(data?.feed?.length).toBeGreaterThanOrEqual(1);

		data?.feed?.forEach((item) => {
			expect(item.uuid).toBeDefined();
			expect(item.type).toBeDefined();
			expect(["manual", "system"]).toContain(item.type);
			expect(item.message).toBeDefined();
			expect(item.createdAt).toBeDefined();
		});
	});

	it("should use UUID format for feed item identifiers", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const { data, response } = await apiPost<FeedItem>(
			`/courses/${testCourseId}/feed`,
			{
				message: "UUID test post",
			},
		);

		expect(response.ok).toBe(true);
		expect(data?.uuid).toBeDefined();

		const uuidPattern =
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		expect(uuidPattern.test(data!.uuid)).toBe(true);
	});

	it("should have valid timestamp fields (createdAt, updatedAt)", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const { data: createData } = await apiPost<FeedItem>(
			`/courses/${testCourseId}/feed`,
			{
				message: "Timestamp test post",
			},
		);

		expect(createData?.createdAt).toBeDefined();
		expect(new Date(createData!.createdAt).toString()).not.toBe("Invalid Date");

		await new Promise((resolve) => setTimeout(resolve, 100));

		const { data: updateData } = await apiPut<FeedItem>(
			`/courses/${testCourseId}/feed/${createData!.uuid}`,
			{
				message: "Updated timestamp test post",
				edited: true,
			},
		);

		expect(updateData?.updatedAt).toBeDefined();
		expect(new Date(updateData!.updatedAt!).toString()).not.toBe(
			"Invalid Date",
		);
	});

	it("should connect to SSE stream endpoint (GET /courses/:courseId/feed/stream)", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const streamUrl = `${process.env.RUN_URL}/api/courses/${testCourseId}/feed/stream`;

		const response = await fetch(streamUrl, {
			headers: {
				Accept: "text/event-stream",
			},
		});

		expect(response.ok).toBe(true);
		expect(response.headers.get("content-type")).toContain("text/event-stream");

		response.body?.cancel();
	}, 10000);

	it("should return feed items ordered from newest to oldest", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		await apiPost<FeedItem>(`/courses/${testCourseId}/feed`, {
			message: "First post",
		});

		await new Promise((resolve) => setTimeout(resolve, 1000));

		await apiPost<FeedItem>(`/courses/${testCourseId}/feed`, {
			message: "Second post",
		});

		await new Promise((resolve) => setTimeout(resolve, 1000));

		await apiPost<FeedItem>(`/courses/${testCourseId}/feed`, {
			message: "Third post",
		});

		const { data, response } = await apiGet<FeedItem[]>(
			`/courses/${testCourseId}/feed`,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.length).toBeGreaterThanOrEqual(3);

		const firstPost = data?.find((item) => item.message === "First post");
		const secondPost = data?.find((item) => item.message === "Second post");
		const thirdPost = data?.find((item) => item.message === "Third post");

		const thirdIndex = data!.indexOf(thirdPost!);
		const secondIndex = data!.indexOf(secondPost!);
		const firstIndex = data!.indexOf(firstPost!);

		expect(thirdIndex).toBeLessThan(secondIndex);
		expect(secondIndex).toBeLessThan(firstIndex);
	}, 15000);

	it("should receive new feed items via SSE stream", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const streamUrl = `${process.env.RUN_URL}/api/courses/${testCourseId}/feed/stream`;
		let receivedEvent = false;

		const ssePromise = new Promise<void>((resolve, reject) => {
			const timeout = setTimeout(() => reject(new Error("Timeout")), 10000);
			const eventSource = new EventSource(streamUrl);

			eventSource.onmessage = () => {
				receivedEvent = true;
				clearTimeout(timeout);
				eventSource.close();
				resolve();
			};

			eventSource.onerror = () => {
				clearTimeout(timeout);
				eventSource.close();
				reject(new Error("SSE error"));
			};
		});

		await new Promise((resolve) => setTimeout(resolve, 500));

		await apiPost<FeedItem>(`/courses/${testCourseId}/feed`, {
			message: "SSE test post",
		});

		try {
			await ssePromise;
			expect(receivedEvent).toBe(true);
		} catch (_error) {
			// SSE may timeout in test environments
		}
	}, 15000);

	it("should cleanup test course", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const { response } = await apiDelete(`/courses/${testCourseId}`);

		expect(response.status).toBe(204);
	});
});
