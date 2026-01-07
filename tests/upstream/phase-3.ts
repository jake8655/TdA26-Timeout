import { expect, it } from "vitest";
import {
	apiDelete,
	apiGet,
	apiPost,
	apiPut,
	type Course,
	phase,
	type Quiz,
	type QuizSubmitRequest,
	type QuizSubmitResponse,
} from "./phase-utils";

phase(3, () => {
	let testCourseId: string;
	let testQuizId: string;
	let singleChoiceQuestionUuid: string;
	let multipleChoiceQuestionUuid: string;

	// Setup: Create a test course for all quiz tests
	it("should create a test course for quizzes", async () => {
		const { data, response } = await apiPost<Course>("/courses", {
			name: "Test Course for Phase 3",
			description: "Testing course quizzes",
		});

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.uuid).toBeDefined();

		if (data?.uuid) {
			testCourseId = data.uuid;
		}
	});

	// Test 1: List quizzes (should be empty initially)
	it("should list course quizzes (GET /courses/:courseId/quizzes)", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const { data, response } = await apiGet<Quiz[]>(
			`/courses/${testCourseId}/quizzes`,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(Array.isArray(data)).toBe(true);
		expect(data?.length).toBe(0);
	});

	// Test 2: Create a quiz with singleChoice questions
	it("should create a quiz with singleChoice questions (POST /courses/:courseId/quizzes)", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const newQuiz = {
			title: "Introduction Quiz",
			questions: [
				{
					type: "singleChoice" as const,
					question: "What is 2 + 2?",
					options: ["3", "4", "5", "6"],
					correctIndex: 1,
				},
			],
		};

		const { data, response } = await apiPost<Quiz>(
			`/courses/${testCourseId}/quizzes`,
			newQuiz,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.uuid).toBeDefined();
		expect(data?.title).toBe(newQuiz.title);
		expect(data?.questions).toBeDefined();
		expect(data?.questions?.length).toBe(1);

		const firstQuestion = data?.questions?.[0];
		expect(firstQuestion?.type).toBe("singleChoice");
		expect(firstQuestion?.question).toBe("What is 2 + 2?");
		expect(firstQuestion?.uuid).toBeDefined();

		if (data?.uuid) {
			testQuizId = data.uuid;
		}
		if (firstQuestion?.uuid) {
			singleChoiceQuestionUuid = firstQuestion.uuid;
		}
	});

	// Test 3: Get quiz details
	it("should get quiz details (GET /courses/:courseId/quizzes/:quizId)", async () => {
		if (!testCourseId || !testQuizId) {
			throw new Error("testCourseId or testQuizId not set");
		}

		const { data, response } = await apiGet<Quiz>(
			`/courses/${testCourseId}/quizzes/${testQuizId}`,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.uuid).toBe(testQuizId);
		expect(data?.title).toBe("Introduction Quiz");
		expect(data?.questions).toBeDefined();
		expect(data?.questions.length).toBe(1);
	});

	// Test 4: Update quiz title
	it("should update quiz title (PUT /courses/:courseId/quizzes/:quizId)", async () => {
		if (!testCourseId || !testQuizId) {
			throw new Error("testCourseId or testQuizId not set");
		}

		const updatedQuiz = {
			title: "Updated Introduction Quiz",
			questions: [
				{
					type: "singleChoice" as const,
					question: "What is 2 + 2?",
					options: ["3", "4", "5", "6"],
					correctIndex: 1,
				},
			],
		};

		const { data, response } = await apiPut<Quiz>(
			`/courses/${testCourseId}/quizzes/${testQuizId}`,
			updatedQuiz,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.uuid).toBe(testQuizId);
		expect(data?.title).toBe("Updated Introduction Quiz");

		// Update singleChoiceQuestionUuid from response
		const firstQuestion = data?.questions?.[0];
		if (firstQuestion?.uuid) {
			singleChoiceQuestionUuid = firstQuestion.uuid;
		}
	});

	// Test 5: Update quiz with multipleChoice question
	it("should update quiz to add multipleChoice question (PUT /courses/:courseId/quizzes/:quizId)", async () => {
		if (!testCourseId || !testQuizId) {
			throw new Error("testCourseId or testQuizId not set");
		}

		const updatedQuiz = {
			title: "Updated Introduction Quiz",
			questions: [
				{
					type: "singleChoice" as const,
					question: "What is 2 + 2?",
					options: ["3", "4", "5", "6"],
					correctIndex: 1,
				},
				{
					type: "multipleChoice" as const,
					question: "Which are prime numbers?",
					options: ["2", "3", "4", "5"],
					correctIndices: [0, 1, 3],
				},
			],
		};

		const { data, response } = await apiPut<Quiz>(
			`/courses/${testCourseId}/quizzes/${testQuizId}`,
			updatedQuiz,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.questions.length).toBe(2);

		const singleChoiceQ = data?.questions.find(
			(q) => q.type === "singleChoice",
		);
		const multipleChoiceQ = data?.questions.find(
			(q) => q.type === "multipleChoice",
		);
		expect(multipleChoiceQ).toBeDefined();
		expect(multipleChoiceQ?.question).toBe("Which are prime numbers?");

		// Capture UUIDs from response for submission tests
		if (singleChoiceQ?.uuid) {
			singleChoiceQuestionUuid = singleChoiceQ.uuid;
		}
		if (multipleChoiceQ?.uuid) {
			multipleChoiceQuestionUuid = multipleChoiceQ.uuid;
		}
	});

	// Test 6: Submit quiz answers - correct answers
	it("should submit quiz with correct answers (POST /courses/:courseId/quizzes/:quizId/submit)", async () => {
		if (!testCourseId || !testQuizId) {
			throw new Error("testCourseId or testQuizId not set");
		}

		const submission: QuizSubmitRequest = {
			answers: [
				{
					uuid: singleChoiceQuestionUuid,
					selectedIndex: 1,
				},
				{
					uuid: multipleChoiceQuestionUuid,
					selectedIndices: [0, 1, 3],
				},
			],
		};

		const { data, response } = await apiPost<QuizSubmitResponse>(
			`/courses/${testCourseId}/quizzes/${testQuizId}/submit`,
			submission,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.quizUuid).toBe(testQuizId);
		expect(data?.score).toBe(data?.maxScore);
		expect(data?.submittedAt).toBeDefined();
	});

	// Test 7: Submit quiz answers - incorrect answers
	it("should submit quiz with incorrect answers and get lower score", async () => {
		if (!testCourseId || !testQuizId) {
			throw new Error("testCourseId or testQuizId not set");
		}

		const submission: QuizSubmitRequest = {
			answers: [
				{
					uuid: singleChoiceQuestionUuid,
					selectedIndex: 0, // Wrong answer (correct is 1)
				},
				{
					uuid: multipleChoiceQuestionUuid,
					selectedIndices: [0, 2], // Partially wrong (correct is [0, 1, 3])
				},
			],
		};

		const { data, response } = await apiPost<QuizSubmitResponse>(
			`/courses/${testCourseId}/quizzes/${testQuizId}/submit`,
			submission,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.score).toBeLessThan(data?.maxScore ?? 0);
	});

	// Test 8: Quiz should appear in course detail
	it("should include quizzes in course detail (GET /courses/:courseId)", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const { data, response } = await apiGet<Course>(`/courses/${testCourseId}`);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.quizzes).toBeDefined();
		expect(Array.isArray(data?.quizzes)).toBe(true);
		expect(data?.quizzes?.length).toBeGreaterThanOrEqual(1);
	});

	// Test 9: Create another quiz to verify listing
	it("should create second quiz and verify listing", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const secondQuiz = {
			title: "Second Quiz",
			questions: [
				{
					type: "singleChoice" as const,
					question: "What is the capital of France?",
					options: ["London", "Paris", "Berlin", "Madrid"],
					correctIndex: 1,
				},
			],
		};

		const { data: createData, response: createResponse } = await apiPost<Quiz>(
			`/courses/${testCourseId}/quizzes`,
			secondQuiz,
		);

		expect(createResponse.ok).toBe(true);
		expect(createData?.uuid).toBeDefined();

		// Verify listing returns both quizzes
		const { data: listData, response: listResponse } = await apiGet<Quiz[]>(
			`/courses/${testCourseId}/quizzes`,
		);

		expect(listResponse.ok).toBe(true);
		expect(listData).toBeDefined();
		expect(listData?.length).toBeGreaterThanOrEqual(2);
	});

	// Test 10: Verify UUID format
	it("should use UUID format for quiz identifiers", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const { data, response } = await apiPost<Quiz>(
			`/courses/${testCourseId}/quizzes`,
			{
				title: "UUID Test Quiz",
				questions: [
					{
						type: "singleChoice" as const,
						question: "UUID test question?",
						options: ["Yes", "No"],
						correctIndex: 0,
					},
				],
			},
		);

		expect(response.ok).toBe(true);
		expect(data?.uuid).toBeDefined();

		// UUID v4 regex pattern
		const uuidPattern =
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		expect(data?.uuid && uuidPattern.test(data.uuid)).toBe(true);
	});

	// Test 11: Delete quiz
	it("should delete quiz (DELETE /courses/:courseId/quizzes/:quizId)", async () => {
		if (!testCourseId || !testQuizId) {
			throw new Error("testCourseId or testQuizId not set");
		}

		const { response } = await apiDelete(
			`/courses/${testCourseId}/quizzes/${testQuizId}`,
		);

		expect(response.status).toBe(204);

		// Verify it's actually deleted
		const { response: getResponse } = await apiGet<Quiz>(
			`/courses/${testCourseId}/quizzes/${testQuizId}`,
		);

		expect(getResponse.status).toBe(404);
	});

	// Cleanup: Delete test course
	it("should cleanup test course", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const { response } = await apiDelete(`/courses/${testCourseId}`);

		expect(response.status).toBe(204);
	});
});
