"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart3, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useMemo, useState } from "react";

import {
	getCoursesByCourseIdModulesByModuleIdQuizzesByQuizIdOptions,
	getCoursesByCourseIdModulesByModuleIdQuizzesByQuizIdResultsOptions,
	getCoursesByCourseIdModulesByModuleIdQuizzesByQuizIdStatsOptions,
} from "@/api-client/@tanstack/react-query.gen";
import EmptyState from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

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

	const {
		data: participantResults,
		isPending: participantPending,
		isError: participantFailed,
		refetch: refetchParticipants,
	} = useQuery({
		...getCoursesByCourseIdModulesByModuleIdQuizzesByQuizIdResultsOptions({
			path: { courseId, moduleId: moduleId ?? "", quizId },
			query: { latestPerParticipant: true },
		}),
	});

	const [selectedParticipantId, setSelectedParticipantId] = useState<string>("all");

	if (isPending || statsPending || participantPending) {
		return (
			<Dialog>
				<DialogTrigger render={trigger} />
				<DialogContent showCloseButton={false} className="sm:max-w-2xl">
					<div className="flex justify-center py-12">
						<Loader2 className="text-primary size-8 animate-spin" />
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

	const participants = useMemo(() => {
		const list = participantResults ?? [];
		return list.map((result) => ({
			id: result.resultUuid ?? result.participantSessionToken ?? `${result.submittedAt}`,
			label: result.participantUsername ?? "Anonymous",
			result,
		}));
	}, [participantResults]);

	const selectedParticipant =
		selectedParticipantId === "all"
			? null
			: participants.find((participant) => participant.id === selectedParticipantId) ?? null;

	if (isError || statsFailed || participantFailed || !quiz) {
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
									refetchParticipants();
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
						<div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
							<BarChart3 className="size-3.5" />
							<span>Quiz Statistics</span>
						</div>
						<h2 className="text-foreground text-lg font-semibold">{quizTitle}</h2>
						{statsData && (
							<p className="text-muted-foreground mt-1 text-sm">
								{statsData.totalSubmissions} submission
								{statsData.totalSubmissions !== 1 ? "s" : ""}
							</p>
						)}
					</div>
				</div>

				{participants.length > 0 && (
					<div className="mb-4 flex flex-wrap gap-2">
						<Button
							variant={selectedParticipantId === "all" ? "default" : "outline"}
							size="sm"
							onClick={() => setSelectedParticipantId("all")}
						>
							All
						</Button>
						{participants.map((participant) => (
							<Button
								key={participant.id}
								variant={selectedParticipantId === participant.id ? "default" : "outline"}
								size="sm"
								onClick={() => setSelectedParticipantId(participant.id)}
							>
								{participant.label}
							</Button>
						))}
					</div>
				)}

				{selectedParticipant && (
					<div className="border-primary/20 bg-primary/5 mb-4 rounded-none border p-3 text-sm">
						<p className="text-foreground font-medium">Selected: {selectedParticipant.label}</p>
						<p className="text-muted-foreground text-xs">
							Latest attempt at {selectedParticipant.result.submittedAt ?? "unknown"}
							{selectedParticipant.result.durationSeconds !== undefined &&
								selectedParticipant.result.durationSeconds !== null &&
								` · ${selectedParticipant.result.durationSeconds}s`}
						</p>
					</div>
				)}

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
										// oxlint-disable-next-line react/no-array-index-key
										key={question.uuid ?? index}
										question={question}
										questionIndex={index}
										questionStats={questionStats}
										viewMode={selectedParticipant ? "participant" : "aggregate"}
										selectedIndices={
											selectedParticipant?.result.answers
												?.find((answer) => answer.questionUuid === questionStats.questionUuid)
												?.selectedIndices ?? []
										}
										totalSubmissionsOverride={selectedParticipant ? 1 : undefined}
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
