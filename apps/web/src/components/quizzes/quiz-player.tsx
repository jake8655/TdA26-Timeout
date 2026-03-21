"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, Medal, Target, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { getCoursesByCourseIdModulesByModuleIdQuizzesByQuizIdOptions } from "@/api-client/@tanstack/react-query.gen";
import type { QuizAnswer, QuizSubmitResponse } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";

import { QuizQuestion } from "./quiz-question";

const convertAnswersToRecord = (answers: QuizAnswer[] | null) => {
	if (!answers) return {};
	const record: Record<number, number | number[]> = {};

	answers.forEach((answer, index) => {
		if (answer.selectedIndex !== undefined) {
			record[index] = answer.selectedIndex;
		} else if (answer.selectedIndices) {
			record[index] = answer.selectedIndices;
		}
	});
	return record;
};

export function QuizPlayer({
	initialSubmittedResult = null,
	initialAnswers = null,
	quizUuid,
	courseId,
	moduleId,
	onCancel,
	onSubmitComplete,
	onSubmitAnswers,
}: {
	initialSubmittedResult?: QuizSubmitResponse | null;
	initialAnswers?: QuizAnswer[] | null;
	quizUuid: string;
	courseId: string;
	moduleId?: string;
	onCancel: () => void;
	onSubmitComplete: (result: QuizSubmitResponse) => void;
	onSubmitAnswers: (answers: QuizAnswer[]) => Promise<QuizSubmitResponse>;
}) {
	const [answers, setAnswers] = useState<Record<number, number | number[]>>(
		initialSubmittedResult ? convertAnswersToRecord(initialAnswers) : {},
	);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submittedResult, setSubmittedResult] = useState<QuizSubmitResponse | null>(
		initialSubmittedResult,
	);

	const {
		data: quiz,
		isPending,
		isError,
	} = useQuery({
		...getCoursesByCourseIdModulesByModuleIdQuizzesByQuizIdOptions({
			path: { courseId, moduleId: moduleId ?? "", quizId: quizUuid },
		}),
	});

	if (isPending) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="text-primary size-8 animate-spin" />
			</div>
		);
	}

	if (isError || !quiz) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="text-muted-foreground py-8 text-center"
			>
				<p>Failed to load quiz. Please try again later.</p>
				<Button variant="outline" size="sm" className="mt-4" onClick={onCancel}>
					Go Back
				</Button>
			</motion.div>
		);
	}

	const handleAnswerChange = (questionIndex: number, answer: number | number[]) => {
		setAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
	};

	const handleSubmit = async () => {
		if (!quiz) return;

		setIsSubmitting(true);
		try {
			const answerArray: QuizAnswer[] = quiz.questions.map((question, index) => {
				const selectedAnswer = answers[index];
				const base = { uuid: question.uuid };

				if (question.type === "multipleChoice") {
					return {
						...base,
						selectedIndices: Array.isArray(selectedAnswer) ? selectedAnswer : [],
					};
				}

				return {
					...base,
					selectedIndex: typeof selectedAnswer === "number" ? selectedAnswer : undefined,
				};
			});

			const result = await onSubmitAnswers(answerArray);
			setSubmittedResult(result);
			onSubmitComplete(result);
		} finally {
			setIsSubmitting(false);
		}
	};

	const allAnswered = quiz.questions.every((_, index) => answers[index] !== undefined);

	return (
		<div className="space-y-4">
			<div className="mb-4 flex items-start justify-between gap-4">
				<div className="flex-1">
					<h2 className="text-foreground text-lg font-semibold">{quiz.title}</h2>
					<p className="text-muted-foreground text-sm">
						{quiz.questions.length} question
						{quiz.questions.length !== 1 ? "s" : ""}
					</p>
				</div>
				<Button variant="ghost" size="icon-sm" onClick={onCancel} disabled={isSubmitting}>
					<X className="size-4" />
				</Button>
			</div>

			<AnimatePresence mode="popLayout">
				{!submittedResult ? (
					<>
						<div className="space-y-3">
							{quiz.questions.map((question, index) => (
								<QuizQuestion
									// oxlint-disable-next-line react/no-array-index-key
									key={question.uuid ?? index}
									question={question}
									questionIndex={index}
									selectedAnswer={answers[index]}
									onAnswerChange={(answer) => handleAnswerChange(index, answer)}
								/>
							))}
						</div>

						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="flex justify-end gap-2 pt-2"
						>
							<Button variant="outline" size="sm" onClick={onCancel}>
								Cancel
							</Button>
							<Button
								variant="default"
								size="sm"
								onClick={handleSubmit}
								disabled={!allAnswered || isSubmitting}
							>
								{isSubmitting ? (
									<Loader2 className="mr-2 size-4 animate-spin" />
								) : (
									<Check className="mr-2 size-4" />
								)}
								Submit Answers
							</Button>
						</motion.div>
					</>
				) : (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-4"
					>
						<div className="bg-card/50 rounded-none border border-white/10 p-5">
							<div className="flex flex-wrap items-center gap-3">
								<div
									className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs ${
										submittedResult.score <= submittedResult.maxScore / 2
											? "bg-red-500/10 text-red-300"
											: "bg-green-500/10 text-green-300"
									}`}
								>
									<Medal className="size-3.5" />
									<span>{initialSubmittedResult ? "Quiz result" : "Quiz submitted"}</span>
								</div>
								<div className="text-muted-foreground flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs">
									<Target className="text-primary size-3.5" />
									<span>
										Score {submittedResult.score}/{submittedResult.maxScore}
									</span>
								</div>
							</div>
							<p className="text-muted-foreground mt-4 text-sm">
								Review the correct answers below to see what you nailed and what to revisit.
							</p>
						</div>

						<div className="space-y-3">
							{quiz.questions.map((question, index) => (
								<QuizQuestion
									// oxlint-disable-next-line react/no-array-index-key
									key={question.uuid ?? index}
									question={question}
									questionIndex={index}
									selectedAnswer={answers[index]}
									onAnswerChange={() => {}}
									isReadOnly
									isCorrect={submittedResult.correctPerQuestion?.[index] ?? null}
								/>
							))}
						</div>

						<motion.div
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="flex justify-end pt-2"
						>
							<Button variant="outline" size="sm" onClick={onCancel}>
								Close
							</Button>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
