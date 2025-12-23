"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { env } from "@/env";
import { Button } from "../animate-ui/components/buttons/button";
import BackgroundGrid from "../background-grid";

export default function Hero() {
	const { data, isLoading, error } = useQuery({
		queryKey: ["heroData"],
		queryFn: async () => {
			const response = await fetch(env.NEXT_PUBLIC_API_BASE);
			return response.json();
		},
	});

	return (
		<section className="relative flex min-h-screen items-center justify-center pt-20">
			<pre className="absolute top-30 z-10">
				{error
					? JSON.stringify(error)
					: isLoading
						? "Loading..."
						: JSON.stringify(data, null, 2)}
			</pre>

			<BackgroundGrid />

			<div className="relative z-10 mx-auto max-w-7xl px-6 text-center">
				<div className="mb-12 flex justify-center">
					<div className="relative">
						<motion.div
							animate={{
								scale: [1, 1.1, 1],
							}}
							transition={{
								duration: 10,
								repeat: Number.POSITIVE_INFINITY,
								repeatType: "reverse",
							}}
							className="-inset-10 absolute rounded-full bg-primary/20 blur-2xl"
						/>
						<Image
							src="/logo/logo.svg"
							alt="Think different Academy"
							width={160}
							height={176}
							className="relative h-44 w-40 drop-shadow-[0_0_25px_rgba(var(--primary),0.3)]"
							priority
						/>
					</div>
				</div>

				<div>
					<h1 className="mb-8 font-bold text-5xl tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
						<span className="text-foreground">Think </span>
						<span className="bg-linear-to-r from-primary to-blue-400 bg-clip-text text-transparent">
							different
						</span>
						<span className="text-foreground">.</span>
						<br />
						<span className="bg-linear-to-r from-accent to-green-400 bg-clip-text text-transparent">
							Learn
						</span>
						<span className="text-foreground"> different.</span>
					</h1>
				</div>

				<p className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground sm:text-xl md:text-2xl">
					An educational platform that proves learning doesn't have to mean
					endless reading. It can be{" "}
					<span className="font-semibold text-accent decoration-2 decoration-accent underline-offset-4 hover:underline">
						engaging
					</span>
					,{" "}
					<span className="font-semibold text-primary decoration-2 decoration-primary underline-offset-4 hover:underline">
						interactive
					</span>
					, and{" "}
					<span className="font-semibold text-foreground">fully online</span>.
				</p>

				<div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
					<Link href="/courses">
						<Button
							variant="accent"
							size="lg"
							className="h-14 min-w-[200px] border-none bg-accent text-accent-foreground text-lg hover:bg-accent/90"
						>
							Explore Courses
						</Button>
					</Link>
					<Link href="#about">
						<Button
							variant="outline"
							size="lg"
							className="h-14 min-w-[200px] border-muted-foreground/20 text-lg hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
						>
							Learn More
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}
