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
		<div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background font-sans">
			<BackgroundGrid />

			<div className="relative z-10 flex flex-col items-center px-6 text-center">
				<div className="relative mb-8">
					<div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
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

				<h1 className="mb-4 font-bold text-7xl tracking-tight sm:text-9xl">
					<span className="bg-linear-to-r from-primary to-accent-4 bg-clip-text text-transparent">
						404
					</span>
				</h1>

				<h2 className="mb-6 font-semibold text-2xl text-foreground sm:text-3xl">
					Lost in thought?
				</h2>

				<p className="mb-10 max-w-md text-lg text-muted-foreground">
					The page you're looking for seems to have wandered off. It might be
					learning something new elsewhere.
				</p>

				<div className="flex flex-col gap-4 sm:flex-row">
					<Link href="/">
						<Button variant="accent" size="lg" className="min-w-40">
							Go Home
						</Button>
					</Link>
					<Button
						variant="outline"
						size="lg"
						className="min-w-40"
						onClick={() => router.back()}
					>
						Go back
					</Button>
				</div>
			</div>

			<div className="absolute bottom-8 text-muted-foreground/50 text-sm">
				Think different. Even when you're lost.
			</div>
		</div>
	);
}
