import * as playwright from "playwright";
import { describe } from "vitest";
import type {
	Course,
	FeedItem,
	Material,
	Quiz,
	QuizSubmitRequest,
	QuizSubmitResponse,
} from "./generated/types";

const baseUrl = process.env.RUN_URL;

const TEST_PHASE = process.env.TEST_PHASE;

function shouldRunPhase(phaseNum: number) {
	if (!TEST_PHASE) return true;

	const [min, max] = TEST_PHASE.split(":").map(Number);

	if (Number.isNaN(min)) {
		return phaseNum === parseInt(TEST_PHASE, 10);
	}

	if (Number.isNaN(max)) {
		return phaseNum <= min;
	}

	return phaseNum >= min && phaseNum <= max;
}

export function phase(
	phaseNum: number,
	callback: (context: PhaseContext) => void,
) {
	if (!shouldRunPhase(phaseNum)) {
		describe.skip(`Phase ${phaseNum}`, () => callback(context));
		return;
	}

	describe(`Phase ${phaseNum}`, () => callback(context));
}

interface PhaseContext {
	page: (
		url: string,
	) => Promise<{ page: playwright.Page; res: playwright.Response }>;
}

const context: PhaseContext = {
	page: async (url: string) => {
		const browser = await playwright.chromium.launch();
		const page = await browser.newPage();
		const res = await page.goto(url);

		await page.waitForLoadState("networkidle");

		const result = { page, res: res as playwright.Response };

		setTimeout(async () => {
			await page.close();
			await browser.close();
		}, 5000);

		return result;
	},
};

export async function apiGet<T>(
	path: string,
): Promise<{ data: T; response: Response }> {
	const response = await fetch(`${baseUrl}/api${path}`);
	const data = await response.json();
	return { data, response };
}

export async function apiPost<T>(
	path: string,
	body: unknown,
): Promise<{ data: T; response: Response }> {
	const isFormData = body instanceof FormData;

	const response = await fetch(`${baseUrl}/api${path}`, {
		method: "POST",
		headers: isFormData ? {} : { "Content-Type": "application/json" },
		body: isFormData ? (body as FormData) : JSON.stringify(body),
	});

	const data = response.status !== 204 ? await response.json() : null;
	return { data, response };
}

export async function apiPut<T>(
	path: string,
	body: unknown,
): Promise<{ data: T; response: Response }> {
	const isFormData = body instanceof FormData;

	const response = await fetch(`${baseUrl}/api${path}`, {
		method: "PUT",
		headers: isFormData ? {} : { "Content-Type": "application/json" },
		body: isFormData ? (body as FormData) : JSON.stringify(body),
	});

	const data = response.status !== 204 ? await response.json() : null;
	return { data, response };
}

export async function apiDelete(path: string) {
	const response = await fetch(`${baseUrl}/api${path}`, { method: "DELETE" });
	return { response };
}

export type {
	Course,
	Material,
	Quiz,
	FeedItem,
	QuizSubmitRequest,
	QuizSubmitResponse,
};
