import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CallToAction() {
	return (
		<section className="relative overflow-hidden py-24">
			{/* Background effects */}
			<div className="pointer-events-none absolute inset-0">
				<div className="-translate-x-1/2 absolute top-0 left-1/2 size-64 rounded-full bg-primary/20 blur-3xl" />
				<div className="absolute right-1/4 bottom-0 size-64 rounded-full bg-accent/20 blur-3xl" />
			</div>

			<div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
				<div className="mb-8 flex justify-center">
					<div className="rounded-2xl border bg-card/50 p-6 backdrop-blur-sm">
						<Image
							src="/icons/Idea/zarivka_idea_blue.svg"
							alt="Lightbulb Icon Idea"
							width={64}
							height={64}
							className="size-16"
						/>
					</div>
				</div>

				<h2 className="mb-6 font-bold text-3xl sm:text-4xl md:text-5xl">
					Ready to <span className="text-primary">think</span>{" "}
					<span className="text-accent">different</span>?
				</h2>

				<p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground">
					Join our community of learners and discover a new way of education.
					It's free, it's online, and it's designed for you.
				</p>

				<Link href="/courses">
					<Button variant="accent" size="lg" className="px-12 text-base">
						Start Learning Today
					</Button>
				</Link>

				<div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-muted-foreground text-sm">
					<div className="flex items-center gap-2">
						<Image
							src="/icons/O/O_blue.svg"
							alt="Blue Circle"
							width={20}
							height={20}
							className="size-5"
						/>
						<span>No registration required</span>
					</div>
					<div className="flex items-center gap-2">
						<Image
							src="/icons/O/O_blue.svg"
							alt="Blue Circle"
							width={20}
							height={20}
							className="size-5"
						/>
						<span>100% free content</span>
					</div>
					<div className="flex items-center gap-2">
						<Image
							src="/icons/O/O_blue.svg"
							alt="Blue Circle"
							width={20}
							height={20}
							className="size-5"
						/>
						<span>Learn at your pace</span>
					</div>
				</div>
			</div>
		</section>
	);
}
