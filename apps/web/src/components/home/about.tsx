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
			<div className="bg-card/80 rounded-xl border border-white/10 p-3 shadow-xl backdrop-blur-md">
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
						<h2 className="mb-6 text-3xl font-bold sm:text-4xl">
							Our <span className="text-accent">Mission</span>
						</h2>
						<div className="text-muted-foreground space-y-6 text-base sm:text-lg">
							<p>
								Think different Academy is a{" "}
								<span className="text-foreground font-semibold">non-profit organization</span> with
								a focus on developing critical and creative thinking among students and the general
								public.
							</p>
							<p>
								We believe that education should be engaging, interactive, and accessible to
								everyone, anywhere in the world.
							</p>
							<p>
								Our goal is to make online teaching easier and more enjoyable for lecturers by
								providing them with tools that help them share their knowledge and expertise with
								greater impact.
							</p>
						</div>

						<div className="mt-12 grid grid-cols-3 gap-8 border-t border-white/5 pt-8">
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
									<div className={`mb-1 text-3xl font-bold ${stat.color}`}>{stat.value}</div>
									<div className="text-muted-foreground text-sm font-medium tracking-wider uppercase">
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
							<div className="from-primary/20 to-accent/20 absolute inset-0 rounded-full bg-linear-to-br blur-[100px]" />

							<div className="bg-card/30 relative z-10 rounded-3xl border border-white/10 p-8 backdrop-blur-sm md:p-16">
								<Image
									src="/logo/logo-official-dark.svg"
									alt="Think different Academy"
									width={240}
									height={176}
									className="h-auto w-48 drop-shadow-2xl md:w-64"
								/>
							</div>

							<FloatingIcon
								src="/icons/Beginner/zarivka_beginner_blue.svg"
								alt="Beginner"
								className="absolute -top-6 -left-2 z-20 md:-top-8 md:-left-8"
								delay={0}
							/>
							<FloatingIcon
								src="/icons/Medium/zarivka_medium_blue.svg"
								alt="Medium"
								className="absolute -right-4 -bottom-2 z-20 md:-right-12 md:-bottom-4"
								delay={1}
							/>
							<FloatingIcon
								src="/icons/Hard/zarivka_hard_blue.svg"
								alt="Hard"
								className="absolute top-1/3 -right-2 z-20 md:-right-6"
								delay={2}
							/>
						</div>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
