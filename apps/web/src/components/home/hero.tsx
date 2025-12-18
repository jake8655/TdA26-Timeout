"use client";

import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { env } from "@/env";

export default function Hero() {
	const { data, isLoading } = useQuery({
		queryKey: ["hero-data"],
		queryFn: async () => {
			const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}`);
			return res.json();
		},
	});

	return (
		<section className="relative min-h-[80vh] pt-40 pb-24">
			{/* Background gradient effects */}
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute top-1/4 left-1/4 size-96 rounded-full bg-primary/10 blur-3xl" />
				<div className="absolute right-1/4 bottom-1/4 size-96 rounded-full bg-accent/10 blur-3xl" />
			</div>

			<pre>{isLoading ? "Loading..." : JSON.stringify(data, null, 2)}</pre>

			<div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
				<div className="mb-18 flex justify-center">
					<Image
						src="/logo/logo.svg"
						alt="Think different Academy"
						width={160}
						height={176}
						className="h-44 w-40"
						priority
					/>
				</div>

				<h1 className="mb-6 font-bold text-4xl tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
					<span className="text-foreground">Think </span>
					<span className="text-primary">different</span>
					<span className="text-foreground">.</span>
					<br />
					<span className="text-accent">Learn</span>
					<span className="text-foreground"> different.</span>
				</h1>

				<p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground sm:text-xl">
					An educational platform that proves learning doesn't have to mean
					endless reading. It can be{" "}
					<span className="text-accent">engaging</span>,{" "}
					<span className="text-primary">interactive</span>, and{" "}
					<span className="text-foreground">fully online</span>.
				</p>

				<div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
					<Link href="/courses">
						<Button variant="accent" size="lg" className="w-42 text-base">
							Explore Courses
						</Button>
					</Link>
					<Link href="#about">
						<Button variant="outline" size="lg" className="w-42 text-base">
							Learn More
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}
