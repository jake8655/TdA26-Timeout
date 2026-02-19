"use client";

import { useQuery } from "@tanstack/react-query";
import { CalendarClock, ClipboardCheck, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { getCoursesByCourseIdQuizzesByQuizIdResultsOptions } from "@/api-client/@tanstack/react-query.gen";
import type { Quiz } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import EmptyState from "@/components/empty-state";
import { formatCourseTime } from "@/lib/course-date-utils";

export function CourseArchivedResults({
	courseId,
	quizzes,
}: {
	courseId: string;
	quizzes: Quiz[];
}) {
	if (quizzes.length === 0) {
		return (
			<EmptyState
				title="No submitted quizzes"
				description="Your submissions will appear here once they're available."
				icon={<ClipboardCheck className="size-7 text-primary" />}
				className="border-dashed"
			/>
		);
	}

	return (
		<div className="flex flex-col gap-3">
			{quizzes.map((quiz, index) => (
				<ArchivedQuizCard
					key={quiz.uuid ?? quiz.title}
					quiz={quiz}
					courseId={courseId}
					index={index}
				/>
			))}
		</div>
	);
}

function ArchivedQuizCard({
	quiz,
	courseId,
	index,
}: {
	quiz: Quiz;
	courseId: string;
	index: number;
}) {
	const {
		data: results,
		isPending,
		isError,
		refetch,
	} = useQuery({
		...getCoursesByCourseIdQuizzesByQuizIdResultsOptions({
			path: { courseId, quizId: quiz.uuid ?? "" },
		}),
		enabled: Boolean(quiz.uuid),
	});

	const latestResult = results?.[0];

	return (
		<motion.div
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: index * 0.03 }}
			className="rounded-none border border-white/5 bg-card/40 p-4 backdrop-blur-sm"
		>
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div>
					<h3 className="font-semibold text-foreground text-sm">
						{quiz.title}
					</h3>
					<p className="mt-1 text-muted-foreground text-xs">
						{quiz.questions.length} question
						{quiz.questions.length !== 1 ? "s" : ""}
					</p>
				</div>
				{isPending ? (
					<div className="flex items-center gap-2 text-muted-foreground text-xs">
						<Loader2 className="size-4 animate-spin" />
						Loading results
					</div>
				) : isError ? (
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						Retry
					</Button>
				) : latestResult ? (
					<div className="text-right text-muted-foreground text-xs">
						<div className="font-semibold text-foreground">
							Score {latestResult.score}/{latestResult.maxScore}
						</div>
						<div className="mt-1 inline-flex items-center gap-2">
							<CalendarClock className="size-3" />
							Submitted {formatCourseTime(latestResult.submittedAt)}
						</div>
					</div>
				) : (
					<span className="text-muted-foreground text-xs">No results yet</span>
				)}
			</div>
		</motion.div>
	);
}
