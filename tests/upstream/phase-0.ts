import { expect, it } from "vitest";
import { apiGet, phase } from "./phase-utils.ts";

phase(0, ({ page }) => {
	it("Test / is a valid page", async () => {
		const nav = await page(`${process.env.RUN_URL}/`);
		expect(nav.res.headers()["content-type"]).toContain("text/html");
		expect(await nav.page.content()).toContain("Hello TdA");
	});
	it("Test /api/ is a valid endpoint", async () => {
		const res = await fetch(`${process.env.RUN_URL}/api/`);
		console.log(await res.clone().text());
		expect(res.status).not.toBeGreaterThanOrEqual(400);
		expect(res.headers.get("content-type")).toContain("application/json");
		expect(await res.json()).toEqual({ organization: "Student Cyber Games" });
	});
});
