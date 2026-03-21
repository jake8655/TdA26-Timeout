"use client";

import { CheckCircle } from "lucide-react";
import { motion } from "motion/react";

import type {
	MultipleChoiceQuestion,
	Question,
	SingleChoiceQuestion,
} from "@/api-client/types.gen";
import { cn } from "@/lib/utils";

export function QuizStatsQuestion({
	question,
	questionIndex,
	questionStats,
}: {
	question: Question;
	questionIndex: number;
	questionStats: {
		questionUuid: string;
		type: "singleChoice" | "multipleChoice";
		question: string;
		options: string[];
		correctIndex?: number;
		correctIndices?: number[];
		optionCounts: Record<string, number>;
	};
}) {
	const isSingleChoice = question.type === "singleChoice";
	const isMultipleChoice = question.type === "multipleChoice";

	const optionCountsValues = Object.values(questionStats.optionCounts || {}).map(
		(v) => v,
	) as number[];
	const totalSubmissions: number = optionCountsValues.reduce(
		(sum: number, count: number) => sum + count,
		0,
	);

	const isCorrect = (index: number): boolean => {
		if (isSingleChoice) {
			const q = question as SingleChoiceQuestion;
			return index === q.correctIndex;
		}
		const q = question as MultipleChoiceQuestion;
		return q.correctIndices?.includes(index) ?? false;
	};

	const getOptionStyle = (index: number) => {
		if (isCorrect(index)) {
			return "border-green-500/50 bg-green-500/10";
		}
		return "border-white/5 bg-card/40";
	};

	const questionText = "question" in question ? question.question : "";
	const options = "options" in question ? question.options : [];

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className="bg-card/40 border border-white/5 p-6 backdrop-blur-sm"
		>
			<div className="mb-4 flex items-start justify-between gap-4">
				<div className="flex-1">
					<div className="text-muted-foreground mb-2 flex items-center gap-2 text-xs">
						<span className="font-medium">Question {questionIndex + 1}</span>
						<span>•</span>
						<span>{isMultipleChoice ? "Multiple choice" : "Single choice"}</span>
					</div>
					<p className="text-foreground text-sm leading-relaxed">{questionText}</p>
				</div>
			</div>

			<div className="mt-4 space-y-2">
				{options.map((option, index) => {
					const count = questionStats.optionCounts?.[String(index)] || 0;
					const percentage = totalSubmissions > 0 ? (count / totalSubmissions) * 100 : 0;
					const correct = isCorrect(index);

					return (
						<div
							// oxlint-disable-next-line react/no-array-index-key
							key={`${questionStats.questionUuid}-${index}`}
							className={cn(
								"relative overflow-hidden rounded-none border p-3 transition-colors duration-200",
								getOptionStyle(index),
							)}
						>
							<div
								className={cn(
									"bg-primary/20 absolute top-0 left-0 h-full transition-all duration-500",
									{
										"bg-green-500/20": correct,
									},
								)}
								style={{ width: `${percentage}%` }}
							/>
							<div className="relative flex items-center justify-between gap-3">
								<div className="flex items-center gap-3">
									<span className="text-foreground text-sm leading-relaxed">{option}</span>
									{correct && <CheckCircle className="size-4 text-green-500" />}
								</div>
								<div className="flex items-center gap-2">
									<span className="text-foreground text-sm font-medium">{count}</span>
									<span className="text-muted-foreground text-xs">({percentage.toFixed(1)}%)</span>
								</div>
							</div>
						</div>
					);
				})}
			</div>
		</motion.div>
	);
}
