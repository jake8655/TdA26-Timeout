"use client";

import { useMutation } from "@tanstack/react-query";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import z from "zod";
import {
	deleteCoursesByCourseIdQuizzesByQuizIdMutation,
	postCoursesByCourseIdQuizzesMutation,
	putCoursesByCourseIdQuizzesByQuizIdMutation,
} from "@/api-client/@tanstack/react-query.gen";
import type { Question, Quiz } from "@/api-client/types.gen";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAppForm } from "@/hooks/form";

const quizFormSchema = z.object({
	title: z.string().min(1, "Title is required"),
	questions: z
		.array(
			z.discriminatedUnion("type", [
				z.object({
					uuid: z.string(),
					question: z.string().min(1, "Question text is required"),
					type: z.literal("singleChoice"),
					options: z
						.array(z.string())
						.min(2, "At least 2 options are required"),
					correctIndex: z.number(),
				}),
				z.object({
					uuid: z.string(),
					question: z.string().min(1, "Question text is required"),
					type: z.literal("multipleChoice"),
					options: z
						.array(z.string())
						.min(2, "At least 2 options are required"),
					correctIndices: z
						.array(z.number())
						.min(1, "At least one correct answer must be selected"),
				}),
			]),
		)
		.min(1, "At least 1 question is required"),
});

interface QuizFormDialogProps {
	mode: "create" | "edit";
	courseId: string;
	quiz?: Quiz;
	trigger: React.ReactElement;
}

function QuizFormDialog({
	mode,
	courseId,
	quiz,
	trigger,
}: QuizFormDialogProps) {
	const [open, setOpen] = useState(false);

	const createMutation = useMutation({
		...postCoursesByCourseIdQuizzesMutation(),
	});

	const updateMutation = useMutation({
		...putCoursesByCourseIdQuizzesByQuizIdMutation(),
	});

	const form = useAppForm({
		defaultValues: {
			title: quiz?.title ?? "",
			questions: quiz?.questions ?? [
				{
					uuid: crypto.randomUUID(),
					question: "",
					type: "singleChoice",
					options: ["", ""],
					correctIndex: 0,
				},
			],
		},
		validators: {
			onChange: quizFormSchema,
		},
		onSubmit: async ({ value }) => {
			if (mode === "create") {
				await createMutation.mutateAsync({
					path: { courseId },
					body: {
						title: value.title,
						questions: value.questions,
					},
				});
			} else if (quiz) {
				await updateMutation.mutateAsync({
					path: { courseId, quizId: quiz.uuid as string },
					body: {
						title: value.title,
						questions: value.questions,
					},
				});
			}
			form.reset();
			setOpen(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={trigger} />
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>
						{mode === "create" ? "Create New Quiz" : "Edit Quiz"}
					</DialogTitle>
					<DialogDescription>
						{mode === "create"
							? "Add a quiz to your course with questions and answer options."
							: "Update quiz details, questions, and answer options."}
					</DialogDescription>
				</DialogHeader>

				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-6"
				>
					<form.AppField name="title">
						{(field) => (
							<field.TextField
								label="Quiz Title"
								placeholder="Enter quiz title"
								className="h-10"
							/>
						)}
					</form.AppField>

					<div className="space-y-4">
						<form.Subscribe selector={(state) => state.values.questions}>
							{(questions) => (
								<div className="space-y-6">
									{questions.map((q, index) => (
										<div
											key={q.uuid}
											className="space-y-4 border border-white/5 bg-card/40 p-4"
										>
											<div className="mb-4">
												<Label
													htmlFor={`question-type-${index}`}
													className="font-medium text-sm"
												>
													Question {index + 1}
												</Label>
												<form.AppField name={`questions[${index}].type`}>
													{(typeField) => (
														<Select
															value={typeField.state.value}
															onValueChange={(newType) => {
																typeField.handleChange(
																	newType as "singleChoice" | "multipleChoice",
																);
															}}
														>
															<SelectTrigger name={`question-type-${index}`}>
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="singleChoice">
																	Single Choice
																</SelectItem>
																<SelectItem value="multipleChoice">
																	Multiple Choice
																</SelectItem>
															</SelectContent>
														</Select>
													)}
												</form.AppField>

												<form.AppField name={`questions[${index}].question`}>
													{(field) => (
														<field.TextField
															label="Question"
															placeholder="Enter question text"
															className="h-10"
														/>
													)}
												</form.AppField>
											</div>

											<div className="space-y-3">
												<form.Subscribe
													selector={(state) => state.values.questions}
												>
													{(qValues) => (
														<>
															{qValues[index]?.options.map((_, optIndex) => (
																<div
																	// biome-ignore lint/suspicious/noArrayIndexKey: dont have anything else
																	key={optIndex}
																	className="flex items-center gap-2"
																>
																	<form.AppField
																		name={`questions[${index}].options[${optIndex}]`}
																	>
																		{(field) => (
																			<field.TextField
																				label={`Option ${optIndex + 1}`}
																				placeholder={`Option ${optIndex + 1}`}
																				className="h-8 flex-1"
																			/>
																		)}
																	</form.AppField>
																	{(qValues[index]?.options.length ?? 0) >
																		2 && (
																		<Button
																			type="button"
																			variant="ghost"
																			size="icon-xs"
																			onClick={() => {
																				form.setFieldValue(
																					"questions",
																					(current) => {
																						const question = current[
																							index
																						] as Question;

																						current[index] = {
																							...question,
																							options: question.options.filter(
																								(_, i) => i !== optIndex,
																							),
																						};

																						return current;
																					},
																				);
																			}}
																			className="shrink-0 text-muted-foreground hover:text-destructive"
																		>
																			<Trash2 className="size-3" />
																		</Button>
																	)}
																</div>
															))}

															<form.Subscribe
																selector={(state) => state.values.questions}
															>
																{(qValues) => (
																	<Button
																		type="button"
																		variant="ghost"
																		size="xs"
																		disabled={
																			(qValues[index]?.options.length ?? 0) >= 6
																		}
																		onClick={() => {
																			form.setFieldValue(
																				"questions",
																				(current) => {
																					const question = current[
																						index
																					] as Question;

																					current[index] = {
																						...question,
																						options: [...question.options, ""],
																					};

																					return current;
																				},
																			);
																		}}
																		className="gap-1 text-muted-foreground text-xs hover:text-foreground"
																	>
																		Add Option
																	</Button>
																)}
															</form.Subscribe>
														</>
													)}
												</form.Subscribe>

												<form.Subscribe
													selector={(state) => state.values.questions}
												>
													{(qValues) => {
														const qType = qValues[index]?.type;
														const correctIndex =
															qType === "singleChoice"
																? (qValues[index] as { correctIndex: number })
																		.correctIndex
																: undefined;
														return (
															<RadioGroup
																value={
																	qType === "singleChoice"
																		? String(correctIndex ?? 0)
																		: undefined
																}
																onValueChange={(value) => {
																	if (qType !== "singleChoice") return;
																	form.setFieldValue(
																		`questions[${index}].correctIndex`,
																		Number.parseInt(String(value), 10),
																	);
																}}
															>
																{qValues[index]?.options.map((_, optIndex) => (
																	<div
																		// biome-ignore lint/suspicious/noArrayIndexKey: dont have anything else
																		key={optIndex}
																		className="flex items-center gap-2"
																	>
																		<RadioGroupItem
																			value={optIndex.toString()}
																			id={`correct-radio-${index}-${optIndex}`}
																			className={
																				qType === "multipleChoice"
																					? "pointer-events-none opacity-30"
																					: ""
																			}
																		/>
																		<form.AppField
																			name={`questions[${index}].correctIndices`}
																		>
																			{(_field) => (
																				<Checkbox
																					name={`correct-checkbox-${index}-${optIndex}`}
																					checked={
																						qType === "multipleChoice"
																							? (
																									qValues[index]
																										?.correctIndices ?? []
																								).includes(optIndex)
																							: false
																					}
																					onCheckedChange={(checked) => {
																						if (qType !== "multipleChoice")
																							return;

																						const current =
																							qValues[index]?.correctIndices ??
																							[];

																						const updated = checked
																							? [...current, optIndex]
																							: current.filter(
																									(i) => i !== optIndex,
																								);

																						form.setFieldValue(
																							`questions[${index}].correctIndices`,
																							updated,
																						);
																					}}
																					className={
																						qType === "singleChoice"
																							? "pointer-events-none opacity-30"
																							: ""
																					}
																				/>
																			)}
																		</form.AppField>
																	</div>
																))}
															</RadioGroup>
														);
													}}
												</form.Subscribe>

												{questions.length > 1 && (
													<Button
														type="button"
														variant="ghost"
														size="icon-sm"
														onClick={() => {
															form.setFieldValue("questions", (current) =>
																current.filter((_, i) => i !== index),
															);
														}}
														className="shrink-0 text-muted-foreground hover:text-destructive"
														aria-label={`Remove question ${index + 1}`}
													>
														<Trash2 className="size-3.5" />
													</Button>
												)}
											</div>
										</div>
									))}

									<form.Subscribe selector={(state) => state.values.questions}>
										{(_qValues) => (
											<Button
												type="button"
												variant="outline"
												size="sm"
												onClick={() => {
													form.setFieldValue("questions", (current) => [
														...current,
														{
															uuid: crypto.randomUUID(),
															question: "",
															type: "singleChoice",
															options: ["", ""],
															correctIndex: 0,
														},
													]);
												}}
												className="w-full"
											>
												Add Question
											</Button>
										)}
									</form.Subscribe>
								</div>
							)}
						</form.Subscribe>
					</div>

					<DialogFooter>
						<DialogClose render={<Button variant="outline">Cancel</Button>} />
						<form.AppForm>
							<form.SubscribeButton
								label={mode === "create" ? "Create Quiz" : "Save Changes"}
							/>
						</form.AppForm>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function DeleteQuizDialog({
	quiz,
	courseId,
	trigger,
}: {
	quiz: Quiz;
	courseId: string;
	trigger: React.ReactElement;
}) {
	const [open, setOpen] = useState(false);

	const deleteMutation = useMutation({
		...deleteCoursesByCourseIdQuizzesByQuizIdMutation(),
		onSuccess: () => {
			setOpen(false);
		},
	});

	const handleDelete = async () => {
		await deleteMutation.mutateAsync({
			path: { courseId, quizId: quiz.uuid as string },
		});
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={trigger} />
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Delete Quiz</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete "
						<span className="text-accent">{quiz.title}</span>"? This action
						cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose render={<Button variant="outline">Cancel</Button>} />
					<Button
						variant="destructive"
						disabled={deleteMutation.isPending}
						onClick={handleDelete}
					>
						{deleteMutation.isPending ? "Deleting..." : "Delete"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export { QuizFormDialog, DeleteQuizDialog };
