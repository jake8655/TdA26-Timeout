"use client";

import { motion } from "motion/react";
import Image from "next/image";

function FloatingIcon({
	src,
	alt,
	className,
	delay,
}: {
	src: string;
	alt: string;
	className: string;
	delay: number;
}) {
	return (
		<motion.div
			animate={{
				y: [0, -10, 0],
				rotate: [0, 5, -5, 0],
			}}
			transition={{
				duration: 6,
				delay: delay,
				repeat: Number.POSITIVE_INFINITY,
				ease: "easeInOut",
			}}
			className={className}
		>
			<div className="rounded-xl border border-white/10 bg-card/80 p-3 shadow-xl backdrop-blur-md transition-transform hover:scale-110">
				<Image src={src} alt={alt} width={32} height={32} />
			</div>
		</motion.div>
	);
}

export default function About() {
	return (
		<section id="about" className="relative py-24">
			<div className="mx-auto max-w-7xl px-6">
				<div className="grid items-center gap-16 lg:grid-cols-2">
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<h2 className="mb-6 font-bold text-3xl sm:text-4xl md:text-5xl">
							Our <span className="text-accent">Mission</span>
						</h2>
						<div className="space-y-6 text-lg text-muted-foreground">
							<p>
								Think different Academy is a{" "}
								<span className="font-semibold text-foreground">
									non-profit organization
								</span>{" "}
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

						<div className="mt-12 grid grid-cols-3 gap-8 border-white/5 border-t pt-8">
							{[
								{
									value: "100%",
									label: "Free Access",
									color: "text-primary",
								},
								{
									value: "Online",
									label: "Learning",
									color: "text-accent",
								},
								{
									value: "24/7",
									label: "Available",
									color: "text-primary",
								},
							].map((stat, i) => (
								<motion.div
									key={stat.label}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									viewport={{ once: true }}
									transition={{ delay: 0.2 + i * 0.1 }}
									className="text-center"
								>
									<div className={`font-bold text-3xl ${stat.color} mb-1`}>
										{stat.value}
									</div>
									<div className="font-medium text-muted-foreground text-sm uppercase tracking-wider">
										{stat.label}
									</div>
								</motion.div>
							))}
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
						className="relative flex justify-center"
					>
						<div className="relative">
							<div className="absolute inset-0 rounded-full bg-linear-to-br from-primary/20 to-accent/20 blur-[100px]" />

							<motion.div
								whileHover={{ scale: 1.02 }}
								transition={{ type: "spring", stiffness: 300 }}
								className="relative z-10 rounded-3xl border border-white/10 bg-card/30 p-8 backdrop-blur-sm md:p-16"
							>
								<Image
									src="/logo/logo-official-dark.svg"
									alt="Think different Academy"
									width={240}
									height={176}
									className="h-auto w-48 drop-shadow-2xl md:w-64"
								/>
							</motion.div>

							<FloatingIcon
								src="/icons/Beginner/zarivka_beginner_blue.svg"
								alt="Beginner"
								className="-left-2 -top-6 md:-left-8 md:-top-8 absolute z-20"
								delay={0}
							/>
							<FloatingIcon
								src="/icons/Medium/zarivka_medium_blue.svg"
								alt="Medium"
								className="-bottom-2 -right-4 md:-bottom-4 md:-right-12 absolute z-20"
								delay={1}
							/>
							<FloatingIcon
								src="/icons/Hard/zarivka_hard_blue.svg"
								alt="Hard"
								className="-right-2 md:-right-6 absolute top-1/3 z-20"
								delay={2}
							/>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
