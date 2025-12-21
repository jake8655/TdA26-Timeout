import Image from "next/image";

export default function CoursesPage() {
	return (
		<div className="min-h-screen">
			<main className="mx-auto max-w-7xl px-6 pt-40">
				<div className="text-center">
					<h1 className="mb-6 font-bold text-4xl sm:text-5xl">
						<span className="text-primary">Courses</span>
					</h1>
					<p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground">
						Explore our collection of interactive courses designed to develop
						critical and creative thinking.
					</p>

					<div className="rounded-xl border bg-card/50 p-12">
						<div className="mb-6 flex justify-center">
							<Image
								src="/icons/Thinking/zarivka_thinking_blue.svg"
								alt="Lightbulb Icon Thinking"
								width={80}
								height={80}
								className="size-20 opacity-50"
							/>
						</div>
						<h2 className="mb-2 font-semibold text-muted-foreground text-xl">
							Courses Coming Soon
						</h2>
						<p className="text-muted-foreground text-sm">
							We're working on bringing you amazing learning experiences. Check
							back soon!
						</p>
					</div>
				</div>
			</main>
		</div>
	);
}
