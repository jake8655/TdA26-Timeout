"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/animate-ui/components/buttons/button";
import BackgroundGrid from "@/components/background-grid";

export default function NotFound() {
	const router = useRouter();

	return (
		<div className="bg-background relative flex min-h-screen flex-col items-center justify-center overflow-hidden font-sans">
			<BackgroundGrid />

			<div className="relative z-10 flex flex-col items-center px-6 text-center">
				<div className="relative mb-8">
					<div className="bg-primary/20 absolute inset-0 animate-pulse rounded-full blur-xl" />
					<motion.div
						animate={{ y: [0, -10, 0] }}
						transition={{
							duration: 4,
							repeat: Number.POSITIVE_INFINITY,
							ease: "easeInOut",
						}}
					>
						<Image
							src="/icons/Thinking/zarivka_thinking_blue.svg"
							alt="Thinking Icon"
							width={120}
							height={120}
							className="relative z-10 drop-shadow-[0_0_15px_rgba(var(--primary),0.5)]"
						/>
					</motion.div>
				</div>

				<h1 className="mb-4 text-7xl font-bold tracking-tight sm:text-9xl">
					<span className="from-primary to-accent-4 bg-linear-to-r bg-clip-text text-transparent">
						404
					</span>
				</h1>

				<h2 className="text-foreground mb-4 text-2xl font-semibold sm:text-3xl">
					Lost in thought?
				</h2>

				<p className="text-muted-foreground mb-10 max-w-md text-base sm:text-lg">
					The page you're looking for seems to have wandered off. It might be learning something new
					elsewhere.
				</p>

				<div className="flex flex-col gap-4 sm:flex-row">
					<Button variant="accent" size="lg" className="min-w-40" asChild>
						<Link href="/">Go Home</Link>
					</Button>
					<Button variant="outline" size="lg" className="min-w-40" onClick={() => router.back()}>
						Go back
					</Button>
				</div>
			</div>

			<div className="text-muted-foreground/50 absolute bottom-8 text-sm">
				Think different. Even when you're lost.
			</div>
		</div>
	);
}
