import { expect, it } from "vitest";

import {
	apiDelete,
	apiGet,
	apiPost,
	apiPut,
	type Course,
	phase,
} from "./phase-utils";

phase(1, ({ page }) => {
	let testCourseId: string;

	it("should list all courses (GET /courses)", async () => {
		const { data, response } = await apiGet<Course[]>("/courses");

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(Array.isArray(data)).toBe(true);

		if (data && data.length > 0) {
			const course = data[0] as Course;
			expect(course.uuid).toBeDefined();
			expect(course.name).toBeDefined();
			expect(typeof course.uuid).toBe("string");
			expect(typeof course.name).toBe("string");
		}
	});

	it("should create a new course (POST /courses)", async () => {
		const newCourse = {
			name: "Test Course for Phase 1",
			description: "This is a test course created during automated testing",
		};

		const { data, response } = await apiPost<Course>("/courses", newCourse);

		console.log(response);
		console.log(data);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.uuid).toBeDefined();
		expect(data?.name).toBe(newCourse.name);
		expect(data?.description).toBe(newCourse.description);

		// Save the course ID for subsequent tests
		if (data?.uuid) {
			testCourseId = data.uuid;
		}
	});

	it("should get course details (GET /courses/:courseId)", async () => {
		// Use the course created in the previous test
		if (!testCourseId) {
			throw new Error(
				"testCourseId not set - create course test must run first",
			);
		}

		const { data, response } = await apiGet<Course>(`/courses/${testCourseId}`);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.uuid).toBe(testCourseId);
		expect(data?.name).toBe("Test Course for Phase 1");
		expect(data?.description).toBe(
			"This is a test course created during automated testing",
		);

		// Phase 1 should have empty arrays for materials, quizzes, and feed
		if (data?.materials !== undefined) {
			expect(Array.isArray(data?.materials)).toBe(true);
		} else {
			console.warn(
				"Materials field is undefined, this is allowed, but should be implemented!",
			);
		}
		if (data?.quizzes !== undefined) {
			expect(Array.isArray(data?.quizzes)).toBe(true);
		} else {
			console.warn(
				"Quizzes field is undefined, this is allowed, but should be implemented!",
			);
		}
		if (data?.feed !== undefined) {
			expect(Array.isArray(data?.feed)).toBe(true);
		} else {
			console.warn(
				"Feed field is undefined, this is allowed, but should be implemented!",
			);
		}
	});

	it("should update a course (PUT /courses/:courseId)", async () => {
		if (!testCourseId) {
			throw new Error(
				"testCourseId not set - create course test must run first",
			);
		}

		const updatedData = {
			name: "Updated Test Course",
			description: "This course has been updated",
		};

		const { data, response } = await apiPut<Course>(
			`/courses/${testCourseId}`,
			updatedData,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.uuid).toBe(testCourseId);
		expect(data?.name).toBe(updatedData.name);
		expect(data?.description).toBe(updatedData.description);
	});

	it("should delete a course (DELETE /courses/:courseId)", async () => {
		if (!testCourseId) {
			throw new Error(
				"testCourseId not set - create course test must run first",
			);
		}

		const { response } = await apiDelete(`/courses/${testCourseId}`);

		expect(response.status).toBe(204);
	});

	it("should return 404 for non-existent course", async () => {
		const fakeUuid = "00000000-0000-0000-0000-000000000000";

		const { response } = await apiGet<Course>(`/courses/${fakeUuid}`);

		expect(response.status).toBe(404);
	});

	it("should render /courses page correctly", async () => {
		const { page: coursePage, res } = await page(
			`${process.env.RUN_URL}/courses`,
		);

		expect(res.status()).toBe(200);
		expect(res.headers()["content-type"]).toContain("text/html");

		const content = await coursePage.content();
		expect(content.length).toBeGreaterThan(0);
	});

	it("should render course detail page correctly", async () => {
		const newCourse = {
			name: "Course for Detail Page Test",
			description: "Testing course detail page rendering",
		};

		const { data: createData } = await apiPost<Course>("/courses", newCourse);

		const courseId = createData?.uuid;

		if (!courseId) {
			throw new Error("Failed to create test course");
		}

		try {
			const { page: detailPage, res } = await page(
				`${process.env.RUN_URL}/courses/${courseId}`,
			);

			expect(res.status()).toBe(200);
			expect(res.headers()["content-type"]).toContain("text/html");

			const content = await detailPage.content();
			expect(content).toContain(newCourse.name);
		} finally {
			await apiDelete(`/courses/${courseId}`);
		}
	}, 50000);
});
