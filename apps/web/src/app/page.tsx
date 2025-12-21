import About from "@/components/home/about";
import CallToAction from "@/components/home/cta";
import Features from "@/components/home/features";
import Footer from "@/components/home/footer";
import Hero from "@/components/home/hero";

export default function Home() {
	return (
		<div className="min-h-screen">
			<main>
				<Hero />
				<Features />
				<About />
				<CallToAction />
			</main>
			<Footer />
		</div>
	);
}
