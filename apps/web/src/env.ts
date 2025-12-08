import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z
			.enum(["development", "test", "production"])
			.default("development"),
	},
	client: {},

	// Only client-side variables need to be destructured manually
	experimental__runtimeEnv: {},

	emptyStringAsUndefined: true,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
