"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "../animate-ui/components/buttons/button";
import BackgroundGrid from "../background-grid";

export default function Hero() {
	return (
		<section className="relative flex min-h-screen items-center justify-center pt-20">
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
							className="bg-primary/10 absolute -inset-10 rounded-full blur-2xl"
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
					<h1 className="mb-8 text-5xl font-bold tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
						<span className="text-foreground">Think </span>
						<span className="from-primary bg-linear-to-r to-blue-400 bg-clip-text text-transparent">
							different
						</span>
						<span className="text-foreground">.</span>
						<br />
						<span className="from-accent bg-linear-to-r to-green-400 bg-clip-text text-transparent">
							Learn
						</span>
						<span className="text-foreground"> different.</span>
					</h1>
				</div>

				<p className="text-muted-foreground mx-auto mb-12 max-w-2xl text-base sm:text-lg md:text-xl">
					An educational platform that proves learning doesn't have to mean endless reading. It can
					be <span className="text-accent font-semibold">engaging</span>,{" "}
					<span className="text-primary font-semibold">interactive</span>, and{" "}
					<span className="text-foreground font-semibold">fully online</span>.
				</p>

				<div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
					<Button
						variant="accent"
						size="lg"
						className="bg-accent text-accent-foreground hover:bg-accent/90 h-14 min-w-[200px] border-none text-lg"
						asChild
					>
						<Link href="/courses">Explore Courses</Link>
					</Button>
					<Button
						variant="outline"
						size="lg"
						className="border-muted-foreground/20 hover:border-primary/50 hover:bg-primary/5 hover:text-primary h-14 min-w-[200px] text-lg"
						asChild
					>
						<Link href="#about">Learn More</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
