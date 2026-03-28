"use client";

import { useMutation } from "@tanstack/react-query";
import { HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

import { postCoursesByCourseIdModulesByModuleIdQuizzesByQuizIdSubmitMutation } from "@/api-client/@tanstack/react-query.gen";
import type {
	Quiz,
	QuizAnswer,
	QuizSubmitRequest,
	QuizSubmitResponse,
} from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

import { QuizPlayer } from "./quiz-player";

export function CourseQuizCard({
	quiz,
	courseId,
	moduleId,
	onSaveResult,
	onEnsureUsername,
}: {
	quiz: Quiz;
	courseId: string;
	moduleId?: string;
	onSaveResult: (result: QuizSubmitResponse) => void;
	onEnsureUsername?: () => Promise<boolean>;
}) {
	const [isPlaying, setIsPlaying] = useState(false);

	const existingResult =
		typeof window !== "undefined" && quiz.uuid
			? localStorage.getItem(`quizResult:${quiz.uuid}`)
			: null;
	const existingAnswers =
		typeof window !== "undefined" && quiz.uuid
			? localStorage.getItem(`quizAnswers:${quiz.uuid}`)
			: null;
	const mutation = useMutation(
		postCoursesByCourseIdModulesByModuleIdQuizzesByQuizIdSubmitMutation(),
	);

	const handleSubmitAnswers = async (
		answers: QuizAnswer[],
		attemptStartedAt?: string,
	): Promise<QuizSubmitResponse> => {
		if (!quiz.uuid) {
			throw new Error("Quiz UUID is required");
		}

		const body: QuizSubmitRequest = { answers, attemptStartedAt };
		const response = await mutation.mutateAsync({
			path: { courseId, moduleId: moduleId ?? "", quizId: quiz.uuid },
			body,
		});

		localStorage.setItem(`quizResult:${quiz.uuid}`, JSON.stringify(response));
		localStorage.setItem(`quizAnswers:${quiz.uuid}`, JSON.stringify(answers));

		return response;
	};

	const handleStartQuiz = async () => {
		if (onEnsureUsername) {
			const ready = await onEnsureUsername();
			if (!ready) {
				return;
			}
		}

		setIsPlaying(true);
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="group bg-card/40 hover:border-primary/30 flex items-start gap-4 rounded-none border border-white/5 p-4 backdrop-blur-sm transition-colors duration-300"
		>
			<div className="bg-primary/10 flex size-12 shrink-0 items-center justify-center rounded-lg">
				<HelpCircle className="text-primary size-6" />
			</div>

			<div className="flex-1 overflow-hidden">
				<h3 className="text-foreground text-sm font-semibold">{quiz.title}</h3>
				<div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
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
				<Button
					variant="outline"
					size="sm"
					onClick={handleStartQuiz}
					className="text-muted-foreground hover:border-primary/30 hover:text-primary shrink-0 border-white/10"
				>
					{existingResult ? "View Results" : "Start Quiz"}
				</Button>
				<DialogContent
					showCloseButton={false}
					className="max-h-[90vh] overflow-y-auto sm:max-w-2xl"
				>
					<DialogTitle className="sr-only">Quiz: {quiz.title}</DialogTitle>
					<QuizPlayer
						quizUuid={quiz.uuid ?? ""}
						courseId={courseId}
						moduleId={moduleId}
						initialSubmittedResult={existingResult ? JSON.parse(existingResult) : null}
						initialAnswers={existingAnswers ? JSON.parse(existingAnswers) : null}
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
