import { defineConfig } from "@hey-api/openapi-ts";

export default defineConfig({
	input: "./server-schema.yml",
	output: {
		postProcess: ["biome:format", "biome:lint"],
		path: "./src/api-client",
	},
	plugins: [
		"zod",
		{
			enums: "javascript",
			name: "@hey-api/typescript",
		},
		{
			name: "@hey-api/sdk",
		},
		{
			name: "@tanstack/react-query",
			queryOptions: true,
			mutationOptions: true,
		},
	],
});
