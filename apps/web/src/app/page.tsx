import About from "@/components/home/about";
import CallToAction from "@/components/home/cta";
import Features from "@/components/home/features";
import Footer from "@/components/home/footer";
import Hero from "@/components/home/hero";
import { Separator } from "@/components/ui/separator";

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
			<Footer />
		</div>
	);
}
