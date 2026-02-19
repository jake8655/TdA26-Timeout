"use client";

import {
	ChartColumnDecreasing,
	Edit2,
	HelpCircle,
	Loader2,
	Plus,
	Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { CourseDetail, Quiz } from "@/api-client/types.gen";
import { CourseStatus } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import {
	DeleteQuizDialog,
	QuizFormDialog,
} from "@/components/dashboard/quiz-form-dialog";
import EmptyState from "@/components/empty-state";
import { QuizStatsDialog } from "@/components/quizzes/quiz-stats-dialog";

export function CourseQuizzesSection({
	course,
	quizzes,
	loading,
	error,
	onRetry,
}: {
	course: CourseDetail;
	quizzes: Quiz[] | undefined;
	loading: boolean;
	error: boolean;
	onRetry: () => void;
}) {
	return (
		<div className="space-y-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="flex items-center justify-between"
			>
				<h2 className="font-semibold text-foreground text-xl">
					Course Quizzes
				</h2>
				<QuizFormDialog
					mode="create"
					courseId={course.uuid}
					trigger={
						<Button
							variant="accent"
							size="sm"
							disabled={course.status !== CourseStatus.DRAFT}
						>
							<Plus />
							Add Quiz
						</Button>
					}
				/>
			</motion.div>

			{loading ? (
				<div className="flex justify-center py-12">
					<Loader2 className="size-8 animate-spin text-primary" />
				</div>
			) : error ? (
				<EmptyState
					title="Unable to load quizzes"
					description="Please try again in a moment."
					icon={<HelpCircle className="size-7 text-primary" />}
					action={
						<Button variant="outline" size="sm" onClick={onRetry}>
							Retry
						</Button>
					}
				/>
			) : !quizzes || quizzes.length === 0 ? (
				<EmptyState
					title="No quizzes yet"
					description="Create your first quiz to test student knowledge."
					icon={<Plus className="size-7 text-primary" />}
					action={
						<QuizFormDialog
							mode="create"
							courseId={course.uuid}
							trigger={
								<Button
									variant="accent"
									className="gap-2"
									disabled={course.status !== CourseStatus.DRAFT}
								>
									<Plus className="size-4" />
									Create Your First Quiz
								</Button>
							}
						/>
					}
					className="border-dashed"
				/>
			) : (
				<div className="flex flex-col gap-3">
					<AnimatePresence mode="popLayout">
						{quizzes.map((quiz, index) => (
							<DashboardQuizCard
								key={quiz.uuid}
								quiz={quiz}
								courseId={course.uuid}
								courseStatus={course.status ?? CourseStatus.DRAFT}
								index={index}
							/>
						))}
					</AnimatePresence>
				</div>
			)}
		</div>
	);
}

function DashboardQuizCard({
	quiz,
	courseId,
	courseStatus,
	index,
}: {
	quiz: Quiz;
	courseId: string;
	courseStatus: CourseStatus;
	index: number;
}) {
	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.3, delay: index * 0.03 }}
			className="group flex items-start gap-4 rounded-none border border-white/5 bg-card/40 p-4 backdrop-blur-sm transition-colors duration-300 hover:border-white/10"
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

			<div className="flex gap-1 transition-opacity group-hover:opacity-100 lg:opacity-0">
				<QuizStatsDialog
					quizId={quiz.uuid ?? quiz.title}
					courseId={courseId}
					quizTitle={quiz.title}
					trigger={
						<Button
							variant="ghost"
							size="icon-sm"
							className="size-8 text-muted-foreground hover:text-primary dark:hover:bg-primary/10"
							aria-label="View quiz statistics"
						>
							<ChartColumnDecreasing />
						</Button>
					}
				/>
				<QuizFormDialog
					mode="edit"
					courseId={courseId}
					quiz={quiz}
					trigger={
						<Button
							variant="ghost"
							size="icon-sm"
							className="size-8 text-muted-foreground hover:text-primary dark:hover:bg-primary/10"
							aria-label="Edit quiz"
							disabled={courseStatus !== CourseStatus.DRAFT}
						>
							<Edit2 />
						</Button>
					}
				/>
				<DeleteQuizDialog
					courseId={courseId}
					quiz={quiz}
					trigger={
						<Button
							variant="ghost"
							size="icon-sm"
							className="size-8 text-muted-foreground hover:text-destructive dark:hover:bg-destructive/10"
							aria-label="Delete quiz"
							disabled={courseStatus !== CourseStatus.DRAFT}
						>
							<Trash2 />
						</Button>
					}
				/>
			</div>
		</motion.div>
	);
}
