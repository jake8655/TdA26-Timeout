"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import {
	getCoursesByCourseIdModulesByModuleIdQuizzesByQuizIdOptions,
	getCoursesByCourseIdModulesByModuleIdQuizzesByQuizIdStatsOptions,
} from "@/api-client/@tanstack/react-query.gen";
import EmptyState from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { QuizStatsQuestion } from "./quiz-stats-question";

export function QuizStatsDialog({
	quizId,
	courseId,
	moduleId,
	quizTitle,
	trigger,
}: {
	quizId: string;
	courseId: string;
	moduleId?: string;
	quizTitle: string;
	trigger: React.ReactElement;
}) {
	const {
		data: quiz,
		isPending,
		isError,
		refetch: refetchQuiz,
	} = useQuery({
		...getCoursesByCourseIdModulesByModuleIdQuizzesByQuizIdOptions({
			path: { courseId, moduleId: moduleId ?? "", quizId },
		}),
	});

	const {
		data: statsResult,
		isPending: statsPending,
		refetch: refetchStats,
		isError: statsFailed,
	} = useQuery({
		...getCoursesByCourseIdModulesByModuleIdQuizzesByQuizIdStatsOptions({
			path: { courseId, moduleId: moduleId ?? "", quizId },
		}),
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

	const statsData = statsResult || { totalSubmissions: 0, questions: [] };

	const questionStatsByUuid = new Map(
		(statsData?.questions ?? []).map((questionStats) => [
			questionStats.questionUuid,
			questionStats,
		]),
	);

	if (isError || statsFailed || !quiz) {
		return (
			<Dialog>
				<DialogTrigger render={trigger} />
				<DialogContent showCloseButton={false} className="sm:max-w-2xl">
					<EmptyState
						title="Unable to load quiz stats"
						description="Please try again in a moment."
						action={
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									refetchQuiz();
									refetchStats();
								}}
							>
								Retry
							</Button>
						}
					/>
				</DialogContent>
			</Dialog>
		);
	}

	return (
		<Dialog>
			<DialogTrigger render={trigger} />
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
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
						{statsData && (
							<p className="mt-1 text-muted-foreground text-sm">
								{statsData.totalSubmissions} submission
								{statsData.totalSubmissions !== 1 ? "s" : ""}
							</p>
						)}
					</div>
				</div>

				{statsData.totalSubmissions === 0 ? (
					<EmptyState
						title="No submissions yet"
						description="Once students submit answers, you'll see response statistics here."
						className="border-dashed"
					/>
				) : (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-4"
					>
						<div className="space-y-3">
							{quiz.questions.map((question, index) => {
								const questionStats = question.uuid
									? questionStatsByUuid.get(question.uuid)
									: statsData.questions[index];
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
			</DialogContent>
		</Dialog>
	);
}
