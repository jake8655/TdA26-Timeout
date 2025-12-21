"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CallToAction() {
	return (
		<section className="relative overflow-hidden py-32">
			<div className="pointer-events-none absolute inset-0">
				<div className="-translate-x-1/2 absolute top-0 left-1/2 size-96 rounded-full bg-primary/10 blur-[100px]" />
				<div className="absolute right-0 bottom-0 size-96 rounded-full bg-accent/10 blur-[100px]" />
			</div>

			<div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					whileInView={{ opacity: 1, scale: 1 }}
					viewport={{ once: true }}
					className="mb-8 flex justify-center"
				>
					<div className="relative">
						<div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
						<div className="relative rounded-2xl border border-white/10 bg-card/50 p-6 backdrop-blur-sm">
							<Image
								src="/icons/Idea/zarivka_idea_blue.svg"
								alt="Lightbulb Icon Idea"
								width={64}
								height={64}
								className="size-16"
							/>
						</div>
					</div>
				</motion.div>

				<motion.h2
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-6 font-bold text-4xl sm:text-5xl md:text-6xl"
				>
					Ready to <span className="text-primary">think</span>{" "}
					<span className="text-accent">different</span>?
				</motion.h2>

				<motion.p
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2 }}
					className="mx-auto mb-12 max-w-2xl text-lg text-muted-foreground sm:text-xl"
				>
					Join our community of learners and discover a new way of education.
					It's free, it's online, and it's designed for you.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.4 }}
				>
					<Link href="/courses">
						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Button
								variant="accent"
								size="lg"
								className="h-14 px-12 text-lg shadow-[0_0_30px_-5px_var(--color-accent)] hover:shadow-[0_0_50px_-10px_var(--color-accent)]"
							>
								Start Learning Today
							</Button>
						</motion.div>
					</Link>
				</motion.div>

				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ delay: 0.6 }}
					className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm sm:gap-12"
				>
					{[
						"No registration required",
						"100% free content",
						"Learn at your pace",
					].map((item) => (
						<div
							key={item}
							className="flex items-center gap-3 text-muted-foreground"
						>
							<div className="flex size-6 items-center justify-center rounded-full bg-primary/10">
								<Image
									src="/icons/O/O_blue.svg"
									alt="Blue Circle"
									width={16}
									height={16}
									className="size-4"
								/>
							</div>
							<span className="font-medium">{item}</span>
						</div>
					))}
				</motion.div>
			</div>
		</section>
	);
}
