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

				<p className="mx-auto mb-12 max-w-2xl text-base text-muted-foreground sm:text-lg md:text-xl">
					An educational platform that proves learning doesn't have to mean
					endless reading. It can be{" "}
					<span className="font-semibold text-accent">engaging</span>,{" "}
					<span className="font-semibold text-primary">interactive</span>, and{" "}
					<span className="font-semibold text-foreground">fully online</span>.
				</p>

				<div className="flex flex-col items-center justify-center gap-6 sm:flex-row">
					<Button
						variant="accent"
						size="lg"
						className="h-14 min-w-[200px] border-none bg-accent text-accent-foreground text-lg hover:bg-accent/90"
						asChild
					>
						<Link href="/courses">Explore Courses</Link>
					</Button>
					<Button
						variant="outline"
						size="lg"
						className="h-14 min-w-[200px] border-muted-foreground/20 text-lg hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
						asChild
					>
						<Link href="#about">Learn More</Link>
					</Button>
				</div>
			</div>
		</section>
	);
}
