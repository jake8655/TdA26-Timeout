"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, Loader2, X } from "lucide-react";
import { motion } from "motion/react";
import { getCoursesByCourseIdQuizzesByQuizIdOptions } from "@/api-client/@tanstack/react-query.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { env } from "@/env";
import { QuizStatsQuestion } from "./quiz-stats-question";

interface QuizStatsDialogProps {
	quizId: string;
	courseId: string;
	quizTitle: string;
	trigger: React.ReactElement;
}

interface QuizStatsResponse {
	quizUuid: string;
	quizTitle: string;
	totalSubmissions: number;
	questions: Array<{
		questionUuid: string;
		type: "singleChoice" | "multipleChoice";
		question: string;
		options: string[];
		correctIndex?: number;
		correctIndices?: number[];
		optionCounts: Record<string, number>;
	}>;
}

export function QuizStatsDialog({
	quizId,
	courseId,
	quizTitle,
	trigger,
}: QuizStatsDialogProps) {
	const {
		data: quiz,
		isPending,
		isError,
	} = useQuery({
		...getCoursesByCourseIdQuizzesByQuizIdOptions({
			path: { courseId, quizId },
		}),
	});

	const { data: stats, isPending: statsPending } = useQuery({
		queryKey: ["quiz-stats", courseId, quizId],
		queryFn: async () => {
			const response = await fetch(
				`${env.NEXT_PUBLIC_API_BASE}/api/courses/${courseId}/quizzes/${quizId}/stats`,
			);
			if (!response.ok) {
				throw new Error("Failed to fetch quiz stats");
			}
			return response.json() as Promise<QuizStatsResponse>;
		},
	});

	if (isPending || statsPending) {
		return (
			<Dialog>
				<DialogTrigger render={trigger} />
				<DialogContent showCloseButton={false} className="sm:max-w-2xl">
					<div className="flex justify-center py-12">
						<Loader2 className="size-8 animate-spin text-primary" />
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	if (isError || !quiz || !stats) {
		return (
			<Dialog>
				<DialogTrigger render={trigger} />
				<DialogContent showCloseButton={false} className="sm:max-w-2xl">
					<div className="py-8 text-center text-muted-foreground">
						<p>Failed to load quiz. Please try again later.</p>
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog>
			<DialogTrigger render={trigger} />
			<DialogContent showCloseButton={false} className="sm:max-w-2xl">
				<DialogTitle className="sr-only">Quiz Results: {quizTitle}</DialogTitle>

				<div className="mb-4 flex items-start justify-between gap-4">
					<div className="flex-1">
						<div className="mb-2 flex items-center gap-2 text-muted-foreground text-xs">
							<BarChart3 className="size-3.5" />
							<span>Quiz Statistics</span>
						</div>
						<h2 className="font-semibold text-foreground text-lg">
							{quizTitle}
						</h2>
						{stats && (
							<p className="mt-1 text-muted-foreground text-sm">
								{stats.totalSubmissions} submission
								{stats.totalSubmissions !== 1 ? "s" : ""}
							</p>
						)}
					</div>
					<Button variant="ghost" size="icon-sm">
						<X className="size-4" />
					</Button>
				</div>

				{stats && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-4"
					>
						<div className="space-y-3">
							{quiz.questions.map((question, index) => {
								const questionStats = stats.questions[index];
								if (!questionStats) return null;

								return (
									<QuizStatsQuestion
										key={question.uuid ?? index}
										question={question}
										questionIndex={index}
										questionStats={questionStats}
									/>
								);
							})}
						</div>
					</motion.div>
				)}

				{stats && stats.totalSubmissions === 0 && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="border border-white/10 bg-card/40 p-6 text-center backdrop-blur-sm"
					>
						<p className="text-muted-foreground text-sm">
							No submissions yet. Once students submit their answers, you'll see
							their response statistics here.
						</p>
					</motion.div>
				)}
			</DialogContent>
		</Dialog>
	);
}
