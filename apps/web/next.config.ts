import type { NextConfig } from "next";

import "./src/env.ts";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	typedRoutes: true,
	typescript: {
		ignoreBuildErrors: true,
	},
};

export default nextConfig;
