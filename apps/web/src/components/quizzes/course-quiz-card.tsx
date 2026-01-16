"use client";

import { useMutation } from "@tanstack/react-query";
import { HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { postCoursesByCourseIdQuizzesByQuizIdSubmitMutation } from "@/api-client/@tanstack/react-query.gen";
import type {
	Quiz,
	QuizAnswer,
	QuizSubmitRequest,
	QuizSubmitResponse,
} from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import {
	Dialog,
	DialogContent,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { QuizPlayer } from "./quiz-player";

interface CourseQuizCardProps {
	quiz: Quiz;
	courseId: string;
	onSaveResult: (result: QuizSubmitResponse) => void;
}

export function CourseQuizCard({
	quiz,
	courseId,
	onSaveResult,
}: CourseQuizCardProps) {
	const [isPlaying, setIsPlaying] = useState(false);

	const existingResult =
		typeof window !== "undefined" && quiz.uuid
			? localStorage.getItem(`quizResult:${quiz.uuid}`)
			: null;
	const hasTaken = !!existingResult;
	const mutation = useMutation(
		postCoursesByCourseIdQuizzesByQuizIdSubmitMutation(),
	);

	const handleSubmitAnswers = async (
		answers: QuizAnswer[],
	): Promise<QuizSubmitResponse> => {
		if (!quiz.uuid) {
			throw new Error("Quiz UUID is required");
		}

		const body: QuizSubmitRequest = { answers };
		const response = await mutation.mutateAsync({
			path: { courseId, quizId: quiz.uuid },
			body,
		});

		localStorage.setItem(`quizResult:${quiz.uuid}`, JSON.stringify(response));

		return response;
	};

	if (hasTaken && !isPlaying) {
		return (
			<div className="border border-white/5 bg-card/40 p-4 text-center text-muted-foreground">
				<p className="font-medium">You have already taken this quiz.</p>
			</div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="group flex items-start gap-4 rounded-none border border-white/5 bg-card/40 p-4 backdrop-blur-sm transition-colors duration-300 hover:border-primary/30"
		>
			<div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
				<HelpCircle className="size-6 text-primary" />
			</div>

			<div className="flex-1 overflow-hidden">
				<h3 className="font-semibold text-foreground text-sm">{quiz.title}</h3>
				<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
					<span>
						{quiz.questions.length} question
						{quiz.questions.length !== 1 ? "s" : ""}
					</span>
					{quiz.attemptsCount !== undefined && (
						<>
							<span className="text-white/20">•</span>
							<span>
								{quiz.attemptsCount} attempt
								{quiz.attemptsCount !== 1 ? "s" : ""}
							</span>
						</>
					)}
				</div>
			</div>

			<Dialog open={isPlaying} onOpenChange={setIsPlaying}>
				<DialogTrigger
					render={
						<Button
							variant="outline"
							size="sm"
							className="shrink-0 border-white/10 text-muted-foreground hover:border-primary/30 hover:text-primary"
						>
							Start Quiz
						</Button>
					}
				/>
				<DialogContent showCloseButton={false} className="sm:max-w-2xl">
					<DialogTitle className="sr-only">Quiz: {quiz.title}</DialogTitle>
					<QuizPlayer
						quizUuid={quiz.uuid ?? ""}
						courseId={courseId}
						initialSubmittedResult={
							existingResult ? JSON.parse(existingResult) : null
						}
						onCancel={() => setIsPlaying(false)}
						onSubmitComplete={(result: QuizSubmitResponse) => {
							onSaveResult(result);
						}}
						onSubmitAnswers={handleSubmitAnswers}
					/>
				</DialogContent>
			</Dialog>
		</motion.div>
	);
}
