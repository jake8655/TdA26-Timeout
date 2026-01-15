"use client";

import { motion } from "motion/react";
import type {
	MultipleChoiceQuestion,
	Question,
	SingleChoiceQuestion,
} from "@/api-client/types.gen";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";

interface QuizQuestionProps {
	question: Question;
	questionIndex: number;
	selectedAnswer?: number | number[];
	onAnswerChange: (answer: number | number[]) => void;
	isReadOnly?: boolean;
	isCorrect?: boolean | null;
}

export function QuizQuestion({
	question,
	questionIndex,
	selectedAnswer,
	onAnswerChange,
	isReadOnly = false,
	isCorrect = null,
}: QuizQuestionProps) {
	const isSingleChoice = question.type === "singleChoice";
	const isMultipleChoice = question.type === "multipleChoice";

	const handleSingleChoiceChange = (value: unknown) => {
		if (isReadOnly) return;
		onAnswerChange(parseInt(String(value), 10));
	};

	const handleMultipleChoiceChange = (index: number, checked: boolean) => {
		if (isReadOnly) return;
		const current = (selectedAnswer as number[]) || [];
		if (checked) {
			onAnswerChange([...current, index]);
		} else {
			onAnswerChange(current.filter((i) => i !== index));
		}
	};

	const isChecked = (index: number): boolean => {
		if (isMultipleChoice) {
			return Array.isArray(selectedAnswer) && selectedAnswer.includes(index);
		}
		return selectedAnswer === index;
	};

	const isOptionCorrect = (index: number): boolean | null => {
		if (!isReadOnly || isCorrect === null) return null;
		if (isMultipleChoice) {
			const q = question as MultipleChoiceQuestion;
			return q.correctIndices?.includes(index) ?? false;
		}
		const q = question as SingleChoiceQuestion;
		return index === q.correctIndex;
	};

	const getOptionStyle = (index: number) => {
		const checked = isChecked(index);
		const correct = isOptionCorrect(index);

		if (isReadOnly) {
			if (correct === true) {
				return "border-green-500/50 bg-green-500/10";
			}
			if (correct === false && checked) {
				return "border-red-500/50 bg-red-500/10";
			}
		}

		return checked
			? "border-primary/50 bg-primary/10"
			: "border-white/10 hover:border-white/20";
	};

	const questionText =
		isSingleChoice && "question" in question
			? question.question
			: isMultipleChoice && "question" in question
				? question.question
				: "";
	const options =
		isSingleChoice && "options" in question
			? question.options
			: isMultipleChoice && "options" in question
				? question.options
				: [];

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, y: -20 }}
			transition={{ duration: 0.3 }}
			className="border border-white/5 bg-card/40 p-6 backdrop-blur-sm"
		>
			<div className="mb-4 flex items-start justify-between gap-4">
				<div className="flex-1">
					<div className="mb-2 flex items-center gap-2 text-muted-foreground text-xs">
						<span className="font-medium">Question {questionIndex + 1}</span>
						<span>•</span>
						<span>
							{isMultipleChoice ? "Multiple choice" : "Single choice"}
						</span>
					</div>
					<p className="text-foreground text-sm leading-relaxed">
						{questionText}
					</p>
				</div>
			</div>

			<RadioGroup
				className="mt-4 space-y-2"
				value={isSingleChoice ? String(selectedAnswer ?? "") : undefined}
				onValueChange={isSingleChoice ? handleSingleChoiceChange : undefined}
			>
				{options.map((option, index) => {
					const inputId = `q${questionIndex}-opt${index}`;
					const checked = isChecked(index);

					return (
						<Label
							key={inputId}
							htmlFor={inputId}
							className={cn(
								"group flex items-center gap-3 rounded-none border p-3 transition-colors duration-200",
								getOptionStyle(index),
								isReadOnly && "cursor-not-allowed",
								!isReadOnly && "cursor-pointer",
							)}
						>
							<motion.div
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.05 }}
								className="flex w-full items-center gap-3"
							>
								{isSingleChoice ? (
									<RadioGroupItem
										id={inputId}
										value={index}
										disabled={isReadOnly}
									/>
								) : (
									<Checkbox
										id={inputId}
										checked={checked}
										onCheckedChange={(checked) =>
											handleMultipleChoiceChange(index, checked)
										}
										disabled={isReadOnly}
									/>
								)}
								<span className="text-foreground text-sm">{option}</span>
								{isReadOnly && isOptionCorrect(index) === true && (
									<span className="ml-auto text-green-500 text-xs">
										Correct
									</span>
								)}
								{isReadOnly && isOptionCorrect(index) === false && checked && (
									<span className="ml-auto text-red-500 text-xs">
										Incorrect
									</span>
								)}
							</motion.div>
						</Label>
					);
				})}
			</RadioGroup>
		</motion.div>
	);
}
