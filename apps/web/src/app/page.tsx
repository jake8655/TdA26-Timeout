import type { Metadata } from "next";

import About from "@/components/home/about";
import CallToAction from "@/components/home/cta";
import Features from "@/components/home/features";
import Hero from "@/components/home/hero";
import { Separator } from "@/components/ui/separator";

export const metadata: Metadata = {
	description:
		"An educational platform that makes learning engaging, interactive, and fully online. Explore courses designed to develop critical and creative thinking.",
};

export default function Home() {
	return (
		<div className="min-h-screen overflow-x-hidden">
			<main>
				<Hero />
				<Features />
				<div className="mx-auto max-w-7xl px-6 md:hidden lg:block">
					<Separator />
				</div>
				<About />
				<div className="mx-auto max-w-7xl px-6 md:hidden lg:block">
					<Separator />
				</div>
				<CallToAction />
			</main>
		</div>
	);
}
