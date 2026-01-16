"use client";

import { useQuery } from "@tanstack/react-query";
import { Check, Loader2, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { getCoursesByCourseIdQuizzesByQuizIdOptions } from "@/api-client/@tanstack/react-query.gen";
import type { QuizAnswer, QuizSubmitResponse } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { QuizQuestion } from "./quiz-question";

interface QuizPlayerProps {
	initialSubmittedResult?: QuizSubmitResponse | null;
	quizUuid: string;
	courseId: string;
	onCancel: () => void;
	onSubmitComplete: (result: QuizSubmitResponse) => void;
	onSubmitAnswers: (answers: QuizAnswer[]) => Promise<QuizSubmitResponse>;
}

export function QuizPlayer({
	initialSubmittedResult = null,
	quizUuid,
	courseId,
	onCancel,
	onSubmitComplete,
	onSubmitAnswers,
}: QuizPlayerProps) {
	const [answers, setAnswers] = useState<Record<number, number | number[]>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submittedResult, setSubmittedResult] =
		useState<QuizSubmitResponse | null>(initialSubmittedResult);

	const {
		data: quiz,
		isPending,
		isError,
	} = useQuery({
		...getCoursesByCourseIdQuizzesByQuizIdOptions({
			path: { courseId, quizId: quizUuid },
		}),
	});

	if (isPending) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="size-8 animate-spin text-primary" />
			</div>
		);
	}

	if (isError || !quiz) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="py-8 text-center text-muted-foreground"
			>
				<p>Failed to load quiz. Please try again later.</p>
				<Button variant="outline" size="sm" className="mt-4" onClick={onCancel}>
					Go Back
				</Button>
			</motion.div>
		);
	}

	const handleAnswerChange = (
		questionIndex: number,
		answer: number | number[],
	) => {
		setAnswers((prev) => ({ ...prev, [questionIndex]: answer }));
	};

	const handleSubmit = async () => {
		if (!quiz) return;

		setIsSubmitting(true);
		try {
			const answerArray: QuizAnswer[] = quiz.questions.map(
				(question, index) => {
					const selectedAnswer = answers[index];
					const base = { uuid: question.uuid };

					if (question.type === "multipleChoice") {
						return {
							...base,
							selectedIndices: Array.isArray(selectedAnswer)
								? selectedAnswer
								: [],
						};
					}

					return {
						...base,
						selectedIndex:
							typeof selectedAnswer === "number" ? selectedAnswer : undefined,
					};
				},
			);

			const result = await onSubmitAnswers(answerArray);
			setSubmittedResult(result);
			onSubmitComplete(result);
		} finally {
			setIsSubmitting(false);
		}
	};

	const allAnswered = quiz.questions.every(
		(_, index) => answers[index] !== undefined,
	);

	return (
		<div className="space-y-4">
			<div className="mb-4 flex items-start justify-between gap-4">
				<div className="flex-1">
					<h2 className="font-semibold text-foreground text-lg">
						{quiz.title}
					</h2>
					<p className="text-muted-foreground text-sm">
						{quiz.questions.length} question
						{quiz.questions.length !== 1 ? "s" : ""}
					</p>
				</div>
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={onCancel}
					disabled={isSubmitting}
				>
					<X className="size-4" />
				</Button>
			</div>

			<AnimatePresence mode="popLayout">
				{!submittedResult ? (
					<>
						<div className="space-y-3">
							{quiz.questions.map((question, index) => (
								<QuizQuestion
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
						<div className="border border-green-500/50 bg-green-500/10 p-4 text-center">
							<p className="font-semibold text-green-400 text-lg">
								Quiz Submitted!
							</p>
							<p className="mt-2 text-foreground">
								Your score:{" "}
								<span className="font-bold">
									{submittedResult.score} / {submittedResult.maxScore}
								</span>
							</p>
							{submittedResult.correctPerQuestion && (
								<p className="mt-1 text-muted-foreground text-sm">
									{submittedResult.correctPerQuestion.filter((c) => c).length}{" "}
									of {submittedResult.correctPerQuestion.length} questions
									correct
								</p>
							)}
						</div>

						<div className="space-y-3">
							{quiz.questions.map((question, index) => (
								<QuizQuestion
									key={question.uuid ?? index}
									question={question}
									questionIndex={index}
									selectedAnswer={answers[index]}
									onAnswerChange={() => {}}
									isReadOnly
									isCorrect={
										submittedResult.correctPerQuestion?.[index] ?? null
									}
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
