"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import z from "zod";
import {
	deleteCoursesByCourseIdModulesByModuleIdQuizzesByQuizIdMutation,
	postCoursesByCourseIdModulesByModuleIdQuizzesMutation,
	putCoursesByCourseIdModulesByModuleIdQuizzesByQuizIdMutation,
} from "@/api-client/@tanstack/react-query.gen";
import type {
	MultipleChoiceQuestion,
	Question,
	Quiz,
	SingleChoiceQuestion,
} from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useAppForm } from "@/hooks/form";
import { Switch } from "../ui/switch";

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
						.array(z.string().nonempty("Option text is required"))
						.min(2, "At least 2 options are required"),
					correctIndex: z.number(),
				}),
				z.object({
					uuid: z.string(),
					question: z.string().min(1, "Question text is required"),
					type: z.literal("multipleChoice"),
					options: z
						.array(z.string().nonempty("Option text is required"))
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
	moduleId?: string;
	quiz?: Quiz;
	trigger: React.ReactElement;
}

function QuizFormDialog({
	mode,
	courseId,
	moduleId,
	quiz,
	trigger,
}: QuizFormDialogProps) {
	const [open, setOpen] = useState(false);

	const createMutation = useMutation({
		...postCoursesByCourseIdModulesByModuleIdQuizzesMutation(),
	});

	const updateMutation = useMutation({
		...putCoursesByCourseIdModulesByModuleIdQuizzesByQuizIdMutation(),
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
					path: { courseId, moduleId: moduleId ?? "" },
					body: {
						title: value.title,
						questions: value.questions,
					},
				});
			} else if (quiz) {
				await updateMutation.mutateAsync({
					path: {
						courseId,
						moduleId: moduleId ?? "",
						quizId: quiz.uuid as string,
					},
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
							/>
						)}
					</form.AppField>

					<div className="space-y-4">
						<form.Subscribe selector={(state) => state.values.questions}>
							{(questions) => (
								<div className="space-y-4">
									{questions.map((q, index) => (
										<Card
											key={q.uuid}
											className="relative border-border/50 bg-card/50 py-4"
										>
											<CardContent className="space-y-4">
												<div className="flex items-start justify-between gap-4">
													<div className="flex-1 space-y-1">
														<div className="mb-2 flex items-center justify-between">
															<Label className="font-medium text-muted-foreground text-xs">
																Question {index + 1}
															</Label>
															<div className="ml-auto flex items-center gap-2">
																<Label
																	htmlFor={`question-type-${index}`}
																	className="font-normal text-muted-foreground text-xs"
																>
																	Multiple Choice
																</Label>
																<form.AppField
																	name={`questions[${index}].type`}
																>
																	{(field) => (
																		<Switch
																			id={`question-type-${index}`}
																			checked={
																				field.state.value === "multipleChoice"
																			}
																			onCheckedChange={(checked) => {
																				field.handleChange(
																					checked
																						? "multipleChoice"
																						: "singleChoice",
																				);

																				if (checked) {
																					form.setFieldValue(
																						`questions[${index}].correctIndices`,
																						[0],
																					);
																				} else {
																					form.setFieldValue(
																						`questions[${index}].correctIndex`,
																						0,
																					);
																				}
																			}}
																		/>
																	)}
																</form.AppField>
															</div>
															<Button
																type="button"
																variant="ghost"
																size="icon-sm"
																onClick={() => {
																	form.setFieldValue("questions", (current) =>
																		current.filter((_, i) => i !== index),
																	);
																}}
																className="ml-4 shrink-0 text-muted-foreground hover:text-destructive"
																aria-label={`Remove question ${index + 1}`}
															>
																<Trash2 />
															</Button>
														</div>
														<form.AppField
															name={`questions[${index}].question`}
														>
															{(field) => (
																<field.TextField placeholder="Enter question text" />
															)}
														</form.AppField>
													</div>
												</div>

												<div className="space-y-2">
													<form.Subscribe
														selector={(state) => state.values.questions}
													>
														{(qValues) => {
															const qType = qValues[index]?.type;
															const options = qValues[index]?.options ?? [];
															const correctIndex =
																qType === "singleChoice"
																	? (qValues[index] as SingleChoiceQuestion)
																			.correctIndex
																	: undefined;

															const renderOptionRow = (
																optIndex: number,
																control: React.ReactNode,
															) => (
																<div
																	key={optIndex}
																	className="flex items-center gap-2"
																>
																	{control}
																	<form.AppField
																		name={`questions[${index}].options[${optIndex}]`}
																	>
																		{(field) => (
																			<field.TextField
																				placeholder={`Option ${optIndex + 1}`}
																			/>
																		)}
																	</form.AppField>
																	{options.length > 2 && (
																		<Button
																			type="button"
																			variant="ghost"
																			size="icon-sm"
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

																						return structuredClone(current);
																					},
																				);
																			}}
																			className="shrink-0 text-muted-foreground hover:text-destructive"
																		>
																			<X className="size-3.5" />
																		</Button>
																	)}
																</div>
															);

															if (qType === "singleChoice") {
																return (
																	<RadioGroup
																		value={String(correctIndex ?? 0)}
																		onValueChange={(value) => {
																			form.setFieldValue(
																				`questions[${index}].correctIndex`,
																				Number.parseInt(value as string, 10),
																			);
																		}}
																		className="grid gap-2"
																	>
																		{options.map((_, optIndex) =>
																			renderOptionRow(
																				optIndex,
																				<RadioGroupItem
																					value={optIndex.toString()}
																					id={`q${index}-opt${optIndex}`}
																				/>,
																			),
																		)}
																	</RadioGroup>
																);
															}

															return (
																<div className="grid gap-2">
																	{options.map((_, optIndex) =>
																		renderOptionRow(
																			optIndex,
																			<Checkbox
																				checked={(
																					(
																						qValues[
																							index
																						] as MultipleChoiceQuestion
																					)?.correctIndices ?? []
																				).includes(optIndex)}
																				onCheckedChange={(checked) => {
																					const current =
																						(
																							qValues[
																								index
																							] as MultipleChoiceQuestion
																						)?.correctIndices ?? [];

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
																			/>,
																		),
																	)}
																</div>
															);
														}}
													</form.Subscribe>

													<form.Subscribe
														selector={(state) => state.values.questions}
													>
														{(qValues) => (
															<Button
																type="button"
																variant="ghost"
																size="sm"
																disabled={
																	(qValues[index]?.options.length ?? 0) >= 6
																}
																onClick={() => {
																	form.setFieldValue("questions", (current) => {
																		const question = current[index] as Question;

																		current[index] = {
																			...question,
																			options: [...question.options, ""],
																		};
																		return structuredClone(current);
																	});
																}}
																className="gap-1 text-muted-foreground text-xs hover:text-foreground"
															>
																<Plus className="size-3" />
																Add Option
															</Button>
														)}
													</form.Subscribe>
												</div>
											</CardContent>
										</Card>
									))}

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
										className="w-full gap-2"
									>
										<Plus className="size-4" />
										Add Question
									</Button>
								</div>
							)}
						</form.Subscribe>
					</div>

					<DialogFooter>
						<DialogClose
							render={
								<Button variant="outline" className="h-9 px-4 py-2 text-sm">
									Cancel
								</Button>
							}
						/>
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
	moduleId,
	trigger,
}: {
	quiz: Quiz;
	courseId: string;
	moduleId?: string;
	trigger: React.ReactElement;
}) {
	const [open, setOpen] = useState(false);

	const deleteMutation = useMutation({
		...deleteCoursesByCourseIdModulesByModuleIdQuizzesByQuizIdMutation(),
		onSuccess: () => {
			setOpen(false);
		},
	});

	const handleDelete = async () => {
		await deleteMutation.mutateAsync({
			path: { courseId, moduleId: moduleId ?? "", quizId: quiz.uuid as string },
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
						{deleteMutation.isPending ? (
							<Loader2 className="animate-spin text-muted-foreground" />
						) : (
							"Delete"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}

export { QuizFormDialog, DeleteQuizDialog };
