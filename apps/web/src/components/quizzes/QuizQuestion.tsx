"use client";

import { motion } from "motion/react";
import type {
	MultipleChoiceQuestion,
	Question,
	SingleChoiceQuestion,
} from "@/api-client/types.gen";
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

	const handleSingleChoiceChange = (value: string) => {
		if (isReadOnly) return;
		onAnswerChange(parseInt(value, 10));
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

			<fieldset
				className="mt-4 space-y-2"
				data-testid={`question-${questionIndex}`}
			>
				<legend className="sr-only">
					Answer options for question {questionIndex + 1}
				</legend>
				{options.map((option: string, index: number) => {
					const inputId = `q${questionIndex}-opt${index}`;
					const checked = isChecked(index);

					return (
						<motion.label
							key={inputId}
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.05 }}
							className={cn(
								"group flex items-center gap-3 rounded-none border p-3 transition-colors duration-200",
								getOptionStyle(index),
								isReadOnly && "cursor-not-allowed",
								!isReadOnly && "cursor-pointer",
							)}
							htmlFor={inputId}
						>
							<input
								id={inputId}
								type={isMultipleChoice ? "checkbox" : "radio"}
								name={`question-${questionIndex}`}
								value={index}
								checked={checked}
								onChange={(e) => {
									if (isMultipleChoice) {
										handleMultipleChoiceChange(index, e.target.checked);
									} else {
										handleSingleChoiceChange(e.target.value);
									}
								}}
								disabled={isReadOnly}
								className={cn(
									"size-4 shrink-0 appearance-none rounded-none border border-input bg-background outline-none transition-colors",
									"checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 checked:border-primary checked:bg-primary checked:after:absolute checked:after:top-1/2 checked:after:left-1/2 checked:after:content-['']",
									"focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
									"disabled:cursor-not-allowed disabled:opacity-50",
									isMultipleChoice
										? "rounded-none checked:after:top-1 checked:after:left-0.5 checked:after:size-1.5"
										: "rounded-full checked:after:size-1.5",
								)}
								data-testid={`${inputId}-input`}
							/>
							<span className="text-foreground text-sm">{option}</span>
							{isReadOnly && isOptionCorrect(index) === true && (
								<span className="ml-auto text-green-500 text-xs">Correct</span>
							)}
							{isReadOnly && isOptionCorrect(index) === false && checked && (
								<span className="ml-auto text-red-500 text-xs">Incorrect</span>
							)}
						</motion.label>
					);
				})}
			</fieldset>
		</motion.div>
	);
}
