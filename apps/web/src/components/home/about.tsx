import Image from "next/image";

export default function About() {
	return (
		<section id="about" className="bg-muted/30 py-24">
			<div className="mx-auto max-w-7xl px-6">
				<div className="grid items-center gap-12 lg:grid-cols-2">
					<div>
						<h2 className="mb-6 font-bold text-3xl sm:text-4xl">
							Our <span className="text-accent">Mission</span>
						</h2>
						<div className="space-y-4 text-muted-foreground">
							<p>
								Think different Academy is a{" "}
								<span className="text-foreground">non-profit organization</span>{" "}
								with a focus on developing critical and creative thinking among
								students and the general public.
							</p>
							<p>
								We believe that education should be engaging, interactive, and
								accessible to everyone, anywhere in the world.
							</p>
							<p>
								Our goal is to make online teaching easier and more enjoyable
								for lecturers by providing them with tools that help them share
								their knowledge and expertise with greater impact.
							</p>
						</div>

						<div className="mt-10 grid grid-cols-3 gap-6">
							<div className="text-center">
								<div className="font-bold text-3xl text-primary">100%</div>
								<div className="text-muted-foreground text-sm">Free Access</div>
							</div>
							<div className="text-center">
								<div className="font-bold text-3xl text-accent">Online</div>
								<div className="text-muted-foreground text-sm">Learning</div>
							</div>
							<div className="text-center">
								<div className="font-bold text-3xl text-primary">24/7</div>
								<div className="text-muted-foreground text-sm">Available</div>
							</div>
						</div>
					</div>

					<div className="relative flex justify-center">
						<div className="relative">
							{/* Background glow */}
							<div className="absolute inset-0 rounded-full bg-linear-to-br from-primary/30 to-accent/30 blur-3xl" />

							<div className="rounded-2xl border bg-card/50 p-12 backdrop-blur-sm">
								<Image
									src="/logo/logo-official-dark.svg"
									alt="Think different Academy"
									width={240}
									height={176}
									className="h-44 w-60"
								/>
							</div>

							{/* Floating difficulty icons */}
							<div className="-left-8 -top-4 absolute rounded-lg border bg-card p-3 shadow-lg">
								<Image
									src="/icons/Beginner/zarivka_beginner_blue.svg"
									alt="Beginner"
									width={32}
									height={32}
								/>
							</div>
							<div className="-right-8 -bottom-2 absolute rounded-lg border bg-card p-3 shadow-lg">
								<Image
									src="/icons/Medium/zarivka_medium_blue.svg"
									alt="Medium"
									width={32}
									height={32}
								/>
							</div>
							<div className="-right-4 absolute top-1/3 rounded-lg border bg-card p-3 shadow-lg">
								<Image
									src="/icons/Hard/zarivka_hard_blue.svg"
									alt="Hard"
									width={32}
									height={32}
								/>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
