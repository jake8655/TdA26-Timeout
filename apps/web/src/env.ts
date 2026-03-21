import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const env = createEnv({
	server: {
		NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
	},
	client: {
		NEXT_PUBLIC_API_BASE: z.string().min(1),
	},

	// Only client-side variables need to be destructured manually
	experimental__runtimeEnv: {
		NEXT_PUBLIC_API_BASE: process.env.NEXT_PUBLIC_API_BASE,
	},

	emptyStringAsUndefined: true,
	skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});
