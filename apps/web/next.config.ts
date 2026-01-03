import type { NextConfig } from "next";

import "./src/env.ts";

const nextConfig: NextConfig = {
	output: "standalone",
	reactStrictMode: true,
	typedRoutes: true,
	typescript: {
		ignoreBuildErrors: true,
	},
	reactCompiler: true,
};

export default nextConfig;
