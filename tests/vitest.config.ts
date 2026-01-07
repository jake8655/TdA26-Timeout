import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		globals: true,
		environment: "node",
		include: ["upstream/phase-*.ts"],
		setupFiles: ["./vitest.setup.ts"],
		maxWorkers: 1,
		isolate: false,
	},
});
