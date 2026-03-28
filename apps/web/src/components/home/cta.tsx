"use client";

import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { getCountryPathFromPathname } from "@/lib/tenant-routing";

import { Button } from "../animate-ui/components/buttons/button";

export default function CallToAction() {
	const pathname = usePathname();
	const countryPath = getCountryPathFromPathname(pathname);

	return (
		<section className="relative py-32">
			<div className="pointer-events-none absolute inset-0">
				<div className="bg-primary/10 absolute top-0 left-1/2 size-96 -translate-x-1/2 rounded-full blur-[100px]" />
				<div className="bg-accent/10 absolute right-0 bottom-0 size-96 rounded-full blur-[100px]" />
			</div>

			<div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					whileInView={{ opacity: 1, scale: 1 }}
					viewport={{ once: true }}
					className="mb-8 flex justify-center"
				>
					<div className="relative">
						<div className="bg-primary/20 absolute inset-0 animate-pulse rounded-full blur-xl" />
						<div className="bg-card/50 relative rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
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
					className="mb-6 text-4xl font-bold sm:text-5xl"
				>
					Ready to <span className="text-primary">think</span>{" "}
					<span className="text-accent">different</span>?
				</motion.h2>

				<motion.p
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.2 }}
					className="text-muted-foreground mx-auto mb-12 max-w-2xl text-base sm:text-lg"
				>
					Join our community of learners and discover a new way of education. It's free, it's
					online, and it's designed for you.
				</motion.p>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ delay: 0.4 }}
				>
					<Button variant="accent" size="lg" className="h-14 px-12 text-lg" asChild>
						<Link href={`${countryPath}/courses`}>Start Learning Today</Link>
					</Button>
				</motion.div>

				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ delay: 0.6 }}
					className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm sm:gap-12"
				>
					{["No registration required", "100% free content", "Learn at your pace"].map((item) => (
						<div key={item} className="text-muted-foreground flex items-center gap-3">
							<div className="bg-primary/10 flex size-6 items-center justify-center rounded-full">
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
