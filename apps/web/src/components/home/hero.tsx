"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function BackgroundGrid() {
	return (
		<div className="absolute inset-0 z-0 overflow-hidden">
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]" />
			<div className="absolute top-0 right-0 left-0 h-[500px] bg-linear-to-b from-background via-background/95 to-transparent" />
			<div className="absolute right-0 bottom-0 left-0 h-[500px] bg-linear-to-t from-background via-background/95 to-transparent" />
			<div className="-top-[40%] -left-[20%] absolute size-[800px] rounded-full bg-primary/10 opacity-40 blur-[100px]" />
			<div className="-right-[20%] -bottom-[40%] absolute size-[800px] rounded-full bg-accent/10 opacity-40 blur-[100px]" />
		</div>
	);
}

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
								rotate: [0, 5, -5, 0],
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
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button
								variant="accent"
								size="lg"
								className="h-14 min-w-[200px] border-none bg-accent text-accent-foreground text-lg shadow-[0_0_20px_-5px_var(--color-accent)] hover:bg-accent/90 hover:shadow-[0_0_30px_-5px_var(--color-accent)]"
							>
								Explore Courses
							</Button>
						</motion.div>
					</Link>
					<Link href="#about">
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button
								variant="outline"
								size="lg"
								className="h-14 min-w-[200px] border-muted-foreground/20 text-lg hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
							>
								Learn More
							</Button>
						</motion.div>
					</Link>
				</div>
			</div>
		</section>
	);
}
