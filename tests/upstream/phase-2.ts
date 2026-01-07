import { expect, it } from "vitest";
import {
	apiDelete,
	apiGet,
	apiPost,
	apiPut,
	type Course,
	type Material,
	phase,
} from "../phase-utils";

phase(2, () => {
	let testCourseId: string;
	let testFileMaterialId: string;
	let testUrlMaterialId: string;

	// Setup: Create a test course for all material tests
	it("should create a test course for materials", async () => {
		const { data, response } = await apiPost<Course>("/courses", {
			name: "Test Course for Phase 2",
			description: "Testing course materials",
		});

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.uuid).toBeDefined();

		if (data?.uuid) {
			testCourseId = data.uuid;
		}
	});

	// Test 1: List materials (should be empty initially)
	it("should list course materials (GET /courses/:courseId/materials)", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const { data, response } = await apiGet<Material[]>(
			`/courses/${testCourseId}/materials`,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(Array.isArray(data)).toBe(true);
		expect(data?.length).toBe(0);
	});

	// Test 2: Add URL material
	it("should add URL material to course (POST /courses/:courseId/materials)", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const urlMaterial = {
			type: "url" as const,
			name: "Official Documentation",
			description: "Link to official course documentation",
			url: "https://example.com/docs",
		};

		const { data, response } = await apiPost<Material>(
			`/courses/${testCourseId}/materials`,
			urlMaterial,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.uuid).toBeDefined();
		expect(data?.type).toBe("url");
		expect(data?.name).toBe(urlMaterial.name);
		expect(data?.description).toBe(urlMaterial.description);

		if (data && "url" in data) {
			expect(data.url).toBe(urlMaterial.url);
		}

		if (data?.uuid) {
			testUrlMaterialId = data.uuid;
		}
	});

	// Test 3: Add file material (PDF)
	it("should add file material to course - PDF (POST /courses/:courseId/materials)", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		// Create a test PDF file
		const pdfContent = "%PDF-1.4\n%Test PDF content\n%%EOF";
		const file = new File([pdfContent], "test-document.pdf", {
			type: "application/pdf",
		});

		const formData = new FormData();
		formData.append("type", "file");
		formData.append("name", "Course Syllabus");
		formData.append("description", "PDF document with course syllabus");
		formData.append("file", file);

		const { data, response } = await apiPost<Material>(
			`/courses/${testCourseId}/materials`,
			formData,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.uuid).toBeDefined();
		expect(data?.type).toBe("file");
		expect(data?.name).toBe("Course Syllabus");

		if (data && "fileUrl" in data) {
			expect(data.fileUrl).toBeDefined();
			expect(typeof data.fileUrl).toBe("string");
		}

		if (data && "mimeType" in data) {
			expect(data.mimeType).toBe("application/pdf");
		}

		if (data?.uuid) {
			testFileMaterialId = data.uuid;
		}
	});

	// Test 4: Add file material (Image)
	it("should add file material - image (POST /courses/:courseId/materials)", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		// Create a minimal test PNG
		const pngData = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10]);
		const file = new File([pngData], "diagram.png", { type: "image/png" });

		const formData = new FormData();
		formData.append("type", "file");
		formData.append("name", "Course Diagram");
		formData.append("description", "Visual diagram for the course");
		formData.append("file", file);

		const { data, response } = await apiPost<Material>(
			`/courses/${testCourseId}/materials`,
			formData,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.uuid).toBeDefined();
		expect(data?.type).toBe("file");

		if (data && "mimeType" in data) {
			expect(data.mimeType).toBe("image/png");
		}
	});

	// Test 5: Validate file size limit (should reject files > 30MB)
	it("should reject file larger than 30MB (POST /courses/:courseId/materials)", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		// Create a file larger than 30MB (31MB)
		const largeFileSize = 31 * 1024 * 1024; // 31 MB
		const largeContent = new Uint8Array(largeFileSize);
		const file = new File([largeContent], "large-file.pdf", {
			type: "application/pdf",
		});

		const formData = new FormData();
		formData.append("type", "file");
		formData.append("name", "Large File");
		formData.append("description", "This should fail");
		formData.append("file", file);

		const { response } = await apiPost<Material>(
			`/courses/${testCourseId}/materials`,
			formData,
		);

		expect(response.status).toBe(400);
	});

	// Test 6: Validate unsupported file format
	it("should reject unsupported file format (POST /courses/:courseId/materials)", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		// Create an unsupported file type (.exe)
		const file = new File(["fake executable"], "malware.exe", {
			type: "application/x-msdownload",
		});

		const formData = new FormData();
		formData.append("type", "file");
		formData.append("name", "Invalid File");
		formData.append("description", "This should fail");
		formData.append("file", file);

		const { response } = await apiPost<Material>(
			`/courses/${testCourseId}/materials`,
			formData,
		);

		expect(response.status).toBe(400);
	});

	// Test 7: List all materials (should show multiple materials)
	it("should list all course materials with correct count", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const { data, response } = await apiGet<Material[]>(
			`/courses/${testCourseId}/materials`,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(Array.isArray(data)).toBe(true);
		expect(data?.length).toBeGreaterThanOrEqual(3); // At least URL, PDF, and PNG

		// Verify each material has required fields
		data?.forEach((material) => {
			expect(material.uuid).toBeDefined();
			expect(material.type).toBeDefined();
			expect(material.name).toBeDefined();
			expect(["file", "url"]).toContain(material.type);
		});
	});

	// Test 8: Verify materials appear in course detail
	it("should include materials in course detail (GET /courses/:courseId)", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const { data, response } = await apiGet<Course>(`/courses/${testCourseId}`);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.materials).toBeDefined();
		expect(Array.isArray(data?.materials)).toBe(true);
		expect(data?.materials?.length).toBeGreaterThanOrEqual(3);
	});

	// Test 9: Update URL material
	it("should update URL material (PUT /courses/:courseId/materials/:materialId)", async () => {
		if (!testCourseId || !testUrlMaterialId) {
			throw new Error("testCourseId or testUrlMaterialId not set");
		}

		const updatedData = {
			name: "Updated Documentation Link",
			description: "Updated description for the documentation",
			url: "https://example.com/updated-docs",
		};

		const { data, response } = await apiPut<Material>(
			`/courses/${testCourseId}/materials/${testUrlMaterialId}`,
			updatedData,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.uuid).toBe(testUrlMaterialId);
		expect(data?.name).toBe(updatedData.name);
		expect(data?.description).toBe(updatedData.description);

		if (data && "url" in data) {
			expect(data.url).toBe(updatedData.url);
		}
	});

	// Test 10: Update file material metadata (without replacing file)
	it("should update file material metadata (PUT /courses/:courseId/materials/:materialId)", async () => {
		if (!testCourseId || !testFileMaterialId) {
			throw new Error("testCourseId or testFileMaterialId not set");
		}

		const updatedData = {
			name: "Updated Syllabus Title",
			description: "Updated syllabus description",
		};

		const { data, response } = await apiPut<Material>(
			`/courses/${testCourseId}/materials/${testFileMaterialId}`,
			updatedData,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.uuid).toBe(testFileMaterialId);
		expect(data?.name).toBe(updatedData.name);
		expect(data?.description).toBe(updatedData.description);
	});

	// Test 11: Update file material (replace file)
	it("should replace file in material (PUT /courses/:courseId/materials/:materialId)", async () => {
		if (!testCourseId || !testFileMaterialId) {
			throw new Error("testCourseId or testFileMaterialId not set");
		}

		const newFile = new File(
			["%PDF-1.4\n%Updated content\n%%EOF"],
			"updated-syllabus.pdf",
			{
				type: "application/pdf",
			},
		);

		const formData = new FormData();
		formData.append("name", "Replaced Syllabus");
		formData.append("file", newFile);

		const { data, response } = await apiPut<Material>(
			`/courses/${testCourseId}/materials/${testFileMaterialId}`,
			formData,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.uuid).toBe(testFileMaterialId);
		expect(data?.name).toBe("Replaced Syllabus");
	});

	// Test 12: Delete URL material
	it("should delete URL material (DELETE /courses/:courseId/materials/:materialId)", async () => {
		if (!testCourseId || !testUrlMaterialId) {
			throw new Error("testCourseId or testUrlMaterialId not set");
		}

		const { response } = await apiDelete(
			`/courses/${testCourseId}/materials/${testUrlMaterialId}`,
		);

		expect(response.status).toBe(204);

		// Verify it's actually deleted
		const { data: materials } = await apiGet<Material[]>(
			`/courses/${testCourseId}/materials`,
		);

		const deletedMaterial = materials?.find(
			(m) => m.uuid === testUrlMaterialId,
		);
		expect(deletedMaterial).toBeUndefined();
	});

	// Test 13: Delete file material
	it("should delete file material (DELETE /courses/:courseId/materials/:materialId)", async () => {
		if (!testCourseId || !testFileMaterialId) {
			throw new Error("testCourseId or testFileMaterialId not set");
		}

		const { response } = await apiDelete(
			`/courses/${testCourseId}/materials/${testFileMaterialId}`,
		);

		expect(response.status).toBe(204);
	});

	// Test 14: Verify material ordering (newest first)
	it("should return materials ordered from newest to oldest", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		// Add multiple materials with delays to ensure different timestamps
		await apiPost<Material>(`/courses/${testCourseId}/materials`, {
			type: "url" as const,
			name: "First Material",
			description: "Added first",
			url: "https://example.com/1",
		});

		await new Promise((resolve) => setTimeout(resolve, 1000));

		await apiPost<Material>(`/courses/${testCourseId}/materials`, {
			type: "url" as const,
			name: "Second Material",
			description: "Added second",
			url: "https://example.com/2",
		});

		await new Promise((resolve) => setTimeout(resolve, 1000));

		await apiPost<Material>(`/courses/${testCourseId}/materials`, {
			type: "url" as const,
			name: "Third Material",
			description: "Added third",
			url: "https://example.com/3",
		});

		const { data, response } = await apiGet<Material[]>(
			`/courses/${testCourseId}/materials`,
		);

		expect(response.ok).toBe(true);
		expect(data).toBeDefined();
		expect(data?.length).toBeGreaterThanOrEqual(3);

		// The newest material (Third Material) should appear first
		const thirdMaterialIndex = data?.findIndex(
			(m) => m.name === "Third Material",
		);
		const secondMaterialIndex = data?.findIndex(
			(m) => m.name === "Second Material",
		);
		const firstMaterialIndex = data?.findIndex(
			(m) => m.name === "First Material",
		);

		expect(secondMaterialIndex).toBeDefined();
		expect(firstMaterialIndex).toBeDefined();
		expect(thirdMaterialIndex).toBeLessThan(secondMaterialIndex!);
		expect(secondMaterialIndex).toBeLessThan(firstMaterialIndex!);
	}, 50000);

	// Test 15: Verify UUID format
	it("should use UUID format for material identifiers", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const { data, response } = await apiPost<Material>(
			`/courses/${testCourseId}/materials`,
			{
				type: "url" as const,
				name: "UUID Test Material",
				description: "Testing UUID format",
				url: "https://example.com/uuid-test",
			},
		);

		expect(response.ok).toBe(true);
		expect(data?.uuid).toBeDefined();

		// UUID v4 regex pattern
		const uuidPattern =
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
		expect(uuidPattern.test(data!.uuid)).toBe(true);
	});

	// Test 16: Test all supported file formats
	it("should accept all supported file formats", async () => {
		if (!testCourseId) {
			throw new Error("testCourseId not set");
		}

		const supportedFormats = [
			{ ext: "txt", mime: "text/plain", content: "Text content" },
			{
				ext: "jpg",
				mime: "image/jpeg",
				content: new Uint8Array([0xff, 0xd8, 0xff]),
			},
			{
				ext: "jpeg",
				mime: "image/jpeg",
				content: new Uint8Array([0xff, 0xd8, 0xff]),
			},
			{ ext: "gif", mime: "image/gif", content: "GIF89a" },
			{ ext: "mp3", mime: "audio/mpeg", content: "ID3" },
			{
				ext: "mp4",
				mime: "video/mp4",
				content: new Uint8Array([0x00, 0x00, 0x00, 0x18]),
			},
			{
				ext: "docx",
				mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
				content: "PK",
			},
		];

		for (const format of supportedFormats) {
			const file = new File([format.content], `test.${format.ext}`, {
				type: format.mime,
			});

			const formData = new FormData();
			formData.append("type", "file");
			formData.append("name", `Test ${format.ext.toUpperCase()} File`);
			formData.append("description", `Testing ${format.ext} format`);
			formData.append("file", file);

			const { data, response } = await apiPost<Material>(
				`/courses/${testCourseId}/materials`,
				formData,
			);

			expect(response.ok).toBe(true);
			expect(data).toBeDefined();
			expect(data?.type).toBe("file");

			if (data && "mimeType" in data) {
				expect(data.mimeType).toBe(format.mime);
			}
		}
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
