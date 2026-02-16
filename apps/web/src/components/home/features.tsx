"use client";

import { motion } from "motion/react";
import Image from "next/image";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";

const features = [
	{
		icon: "/icons/Idea/zarivka_idea_blue.svg",
		title: "Creative Learning",
		description:
			"Move beyond traditional textbooks with engaging, interactive content that sparks curiosity and creativity.",
		color: "primary" as const,
		alt: "Lightbulb Thinking Icon",
	},
	{
		icon: "/icons/Playing/zarivka_playing_white.svg",
		title: "Interactive Experience",
		description:
			"Learn by doing with hands-on exercises, games, and real-world challenges that make knowledge stick.",
		color: "accent" as const,
		alt: "Lightbulb Playing Icon",
	},
	{
		icon: "/icons/Thinking/zarivka_thinking_blue.svg",
		title: "Critical Thinking",
		description:
			"Develop the skills to analyze, question, and solve problems independently in any field.",
		color: "primary" as const,
		alt: "Lightbulb Thinking Icon",
	},
	{
		icon: "/icons/Easy/zarivka_easy_white.svg",
		title: "Accessible to All",
		description:
			"From beginners to experts, our platform adapts to every level with personalized learning paths.",
		color: "accent" as const,
		alt: "Lightbulb Easy Icon",
	},
];

function FeatureCard({
	icon,
	title,
	description,
	color,
	alt,
	index,
}: {
	icon: string;
	title: string;
	description: string;
	color: "primary" | "accent";
	alt: string;
	index: number;
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5, delay: index * 0.1 }}
			viewport={{ once: true }}
			whileHover={{ y: -5 }}
		>
			<Card className="h-full border-white/5 bg-card/40 backdrop-blur-sm transition-colors duration-200">
				<CardHeader>
					<div
						className={cn(
							"mb-4 flex size-16 items-center justify-center rounded-xl shadow-inner",
							color === "primary"
								? "bg-primary/10 shadow-primary/10"
								: "bg-accent/10 shadow-accent/10",
						)}
					>
						<Image
							src={icon}
							alt={alt}
							width={36}
							height={36}
							className="size-9"
						/>
					</div>
					<CardTitle
						className={cn(
							"font-bold text-xl",
							color === "primary" ? "text-primary" : "text-accent",
						)}
					>
						{title}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<CardDescription className="text-base text-muted-foreground leading-relaxed">
						{description}
					</CardDescription>
				</CardContent>
			</Card>
		</motion.div>
	);
}

export default function Features() {
	return (
		<section className="relative py-24">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute top-0 right-0 h-[500px] w-1/2 bg-linear-to-b from-primary/5 to-transparent blur-3xl" />
				<div className="absolute bottom-0 left-0 h-[500px] w-1/2 bg-linear-to-t from-accent/5 to-transparent blur-3xl" />
			</div>

			<div className="relative z-10 mx-auto max-w-7xl px-6">
				<div className="mb-20 text-center">
					<motion.h2
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						className="mb-6 font-bold text-3xl tracking-tight sm:text-4xl md:text-5xl"
					>
						Why <span className="text-primary">Think different</span> Academy?
					</motion.h2>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ delay: 0.2 }}
						className="mx-auto max-w-2xl text-lg text-muted-foreground"
					>
						We're revolutionizing education by making learning an adventure, not
						a chore.
					</motion.p>
				</div>

				<div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
					{features.map((feature, index) => (
						<FeatureCard key={feature.title} {...feature} index={index} />
					))}
				</div>
			</div>
		</section>
	);
}
