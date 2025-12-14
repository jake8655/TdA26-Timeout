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
}: {
	icon: string;
	title: string;
	description: string;
	color: "primary" | "accent";
	alt: string;
}) {
	return (
		<Card className="bg-card/50 transition-all duration-300 hover:bg-card">
			<CardHeader>
				<div
					className={cn(
						"mb-2 flex size-14 items-center justify-center rounded-lg",
						color === "primary" ? "bg-primary/10" : "bg-accent/10",
					)}
				>
					<Image
						src={icon}
						alt={alt}
						width={32}
						height={32}
						className="size-8"
					/>
				</div>
				<CardTitle
					className={cn(
						"text-lg",
						color === "primary" ? "text-primary" : "text-accent",
					)}
				>
					{title}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<CardDescription className="text-sm/relaxed">
					{description}
				</CardDescription>
			</CardContent>
		</Card>
	);
}

export default function Features() {
	return (
		<section className="py-24">
			<div className="mx-auto max-w-7xl px-6">
				<div className="mb-16 text-center">
					<h2 className="mb-4 font-bold text-3xl sm:text-4xl">
						Why <span className="text-primary">Think different</span> Academy?
					</h2>
					<p className="mx-auto max-w-2xl text-muted-foreground">
						We're revolutionizing education by making learning an adventure, not
						a chore.
					</p>
				</div>

				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
					{features.map((feature) => (
						<FeatureCard key={feature.title} {...feature} />
					))}
				</div>
			</div>
		</section>
	);
}
