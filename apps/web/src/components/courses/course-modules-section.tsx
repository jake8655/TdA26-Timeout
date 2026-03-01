"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	ChartColumnDecreasing,
	ChevronDown,
	ChevronRight,
	Download,
	Edit2,
	ExternalLink,
	Eye,
	Loader2,
	Plus,
	Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { z } from "zod";
import {
	deleteCoursesByCourseIdModulesByModuleIdMutation,
	getCoursesByCourseIdModulesOptions,
	postCoursesByCourseIdModulesMutation,
	putCoursesByCourseIdModulesByModuleIdMutation,
	putCoursesByCourseIdModulesByModuleIdRevealMutation,
} from "@/api-client/@tanstack/react-query.gen";
import type {
	CourseStatus,
	FileMaterial,
	Module,
	UrlMaterial,
} from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { DeleteMaterialDialog } from "@/components/dashboard/delete-material-dialog";
import { MaterialFormDialog } from "@/components/dashboard/material-form-dialog";
import {
	DeleteQuizDialog,
	QuizFormDialog,
} from "@/components/dashboard/quiz-form-dialog";
import EmptyState from "@/components/empty-state";
import { QuizStatsDialog } from "@/components/quizzes/quiz-stats-dialog";
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
import { useAppForm } from "@/hooks/form";
import { formatFileSize, getFileTypeLabel } from "@/lib/material-utils";

type Material = FileMaterial | UrlMaterial;

export function CourseModulesSection({
	courseId,
	courseStatus,
}: {
	courseId: string;
	courseStatus: CourseStatus;
}) {
	const {
		data: modules,
		isPending,
		isError,
		refetch,
	} = useQuery({
		...getCoursesByCourseIdModulesOptions({
			path: { courseId },
		}),
	});

	if (isPending) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="size-8 animate-spin text-primary" />
			</div>
		);
	}

	if (isError) {
		return (
			<EmptyState
				title="Unable to load modules"
				description="Please try again in a moment."
				action={
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						Retry
					</Button>
				}
			/>
		);
	}

	const moduleList = modules ?? [];

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="font-semibold text-foreground text-xl">Modules</h2>
				<ModuleFormDialog
					mode="create"
					courseId={courseId}
					trigger={
						<Button
							variant="accent"
							size="sm"
							disabled={courseStatus !== "draft"}
						>
							<Plus />
							Create Module
						</Button>
					}
				/>
			</div>

			{moduleList.length === 0 ? (
				<EmptyState
					title="No modules yet"
					description="Create modules and bundle materials and quizzes together."
					icon={<Plus className="size-7 text-primary" />}
					className="border-dashed"
				/>
			) : (
				<div className="space-y-3">
					{moduleList.map((module, index) => (
						<ModuleCard
							key={module.uuid}
							courseId={courseId}
							module={module}
							courseStatus={courseStatus}
							index={index}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function ModuleCard({
	courseId,
	module,
	courseStatus,
	index,
}: {
	courseId: string;
	module: Module;
	courseStatus: CourseStatus;
	index: number;
}) {
	const [expanded, setExpanded] = useState(true);
	const revealMutation = useMutation({
		...putCoursesByCourseIdModulesByModuleIdRevealMutation(),
	});

	const materials = (module.materials ?? []) as Material[];
	const quizzes = module.quizzes ?? [];
	const contentCount = materials.length + quizzes.length;
	const isEmpty = contentCount === 0;

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: index * 0.03 }}
			className="rounded-none border border-white/5 bg-card/40 backdrop-blur-sm"
		>
			<div className="flex flex-wrap items-start justify-between gap-4 p-4">
				<div className="flex min-w-0 flex-1 items-start gap-3">
					<Button
						variant="ghost"
						size="icon-sm"
						onClick={() => setExpanded((value) => !value)}
						className="mt-0.5"
					>
						{expanded ? <ChevronDown /> : <ChevronRight />}
					</Button>
					<div className="min-w-0">
						<div className="flex flex-wrap items-center gap-2">
							<h3 className="font-semibold text-base text-foreground">
								{module.title}
							</h3>
							<span
								className={`rounded-full px-2 py-0.5 font-semibold text-[10px] uppercase tracking-wide ${
									module.visible
										? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
										: "border border-white/10 bg-white/5 text-muted-foreground"
								}`}
							>
								{module.visible ? "Revealed" : "Hidden"}
							</span>
						</div>
						<p className="mt-1 text-muted-foreground text-sm">
							{module.description || (
								<span className="italic">No description</span>
							)}
						</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					{courseStatus === "live" && !module.visible && (
						<>
							<Button
								variant="outline"
								size="sm"
								onClick={() =>
									revealMutation.mutate({
										path: { courseId, moduleId: module.uuid },
									})
								}
								disabled={revealMutation.isPending || isEmpty}
							>
								<Eye className="size-3.5" />
								Reveal
							</Button>
							{isEmpty && (
								<span className="text-muted-foreground text-xs">
									Add a material or quiz first
								</span>
							)}
						</>
					)}
					<ModuleFormDialog
						mode="edit"
						courseId={courseId}
						module={module}
						trigger={
							<Button
								variant="ghost"
								size="icon-sm"
								disabled={courseStatus !== "draft"}
							>
								<Edit2 />
							</Button>
						}
					/>
					<DeleteModuleDialog
						courseId={courseId}
						module={module}
						trigger={
							<Button
								variant="ghost"
								size="icon-sm"
								disabled={courseStatus !== "draft"}
							>
								<Trash2 />
							</Button>
						}
					/>
				</div>
			</div>

			<AnimatePresence>
				{expanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						className="overflow-hidden border-white/5 border-t"
					>
						<div className="space-y-5 p-4">
							<div>
								<div className="mb-3 flex items-center justify-between">
									<h4 className="font-semibold text-foreground text-sm">
										Materials
									</h4>
									<MaterialFormDialog
										mode="add"
										courseId={courseId}
										moduleId={module.uuid}
										trigger={
											<Button
												variant="outline"
												size="sm"
												disabled={courseStatus !== "draft"}
											>
												<Plus className="size-3.5" />
												Add Material
											</Button>
										}
									/>
								</div>
								{materials.length === 0 ? (
									<p className="text-muted-foreground text-xs italic">
										No materials yet.
									</p>
								) : (
									<div className="space-y-2">
										{materials.map((material) => (
											<div
												key={material.uuid}
												className="flex items-center justify-between gap-3 rounded-none border border-white/5 bg-background/20 p-3"
											>
												<div className="min-w-0">
													<p className="truncate font-medium text-foreground text-sm">
														{material.name}
													</p>
													<p className="text-muted-foreground text-xs">
														{material.type === "file"
															? `${getFileTypeLabel(material.mimeType)}${material.sizeBytes ? ` • ${formatFileSize(material.sizeBytes)}` : ""}`
															: new URL(material.url).hostname}
													</p>
												</div>
												<div className="flex gap-1">
													{material.type === "url" ? (
														<Button
															variant="outline"
															size="sm"
															className="shrink-0 gap-1.5 border-white/10 text-muted-foreground hover:border-primary/30 hover:text-primary"
															asChild
														>
															<a
																href={material.url}
																target="_blank"
																rel="noopener noreferrer"
															>
																<ExternalLink className="size-3.5" />
																Visit Site
															</a>
														</Button>
													) : (
														<Button
															variant="outline"
															size="sm"
															className="shrink-0 gap-1.5 border-white/10 text-muted-foreground hover:border-primary/30 hover:text-primary"
															asChild
														>
															<a
																href={material.fileUrl}
																target="_blank"
																rel="noopener noreferrer"
															>
																<Download className="size-3.5" />
																Download
															</a>
														</Button>
													)}
													<MaterialFormDialog
														mode="edit"
														courseId={courseId}
														moduleId={module.uuid}
														material={material}
														trigger={
															<Button
																variant="ghost"
																size="icon-sm"
																disabled={courseStatus !== "draft"}
															>
																<Edit2 />
															</Button>
														}
													/>
													<DeleteMaterialDialog
														courseId={courseId}
														moduleId={module.uuid}
														material={material}
														trigger={
															<Button
																variant="ghost"
																size="icon-sm"
																disabled={courseStatus !== "draft"}
															>
																<Trash2 />
															</Button>
														}
													/>
												</div>
											</div>
										))}
									</div>
								)}
							</div>

							<div>
								<div className="mb-3 flex items-center justify-between">
									<h4 className="font-semibold text-foreground text-sm">
										Quizzes
									</h4>
									<QuizFormDialog
										mode="create"
										courseId={courseId}
										moduleId={module.uuid}
										trigger={
											<Button
												variant="outline"
												size="sm"
												disabled={courseStatus !== "draft"}
											>
												<Plus className="size-3.5" />
												Add Quiz
											</Button>
										}
									/>
								</div>
								{quizzes.length === 0 ? (
									<p className="text-muted-foreground text-xs italic">
										No quizzes yet.
									</p>
								) : (
									<div className="space-y-2">
										{quizzes.map((quiz) => (
											<div
												key={quiz.uuid ?? quiz.title}
												className="flex items-center justify-between gap-3 rounded-none border border-white/5 bg-background/20 p-3"
											>
												<div className="min-w-0">
													<p className="truncate font-medium text-foreground text-sm">
														{quiz.title}
													</p>
													<p className="text-muted-foreground text-xs">
														{quiz.questions.length} question
														{quiz.questions.length !== 1 ? "s" : ""}
													</p>
												</div>
												<div className="flex gap-1">
													<QuizStatsDialog
														quizId={quiz.uuid ?? quiz.title}
														courseId={courseId}
														moduleId={module.uuid}
														quizTitle={quiz.title}
														trigger={
															<Button variant="ghost" size="icon-sm">
																<ChartColumnDecreasing />
															</Button>
														}
													/>
													<QuizFormDialog
														mode="edit"
														courseId={courseId}
														moduleId={module.uuid}
														quiz={quiz}
														trigger={
															<Button
																variant="ghost"
																size="icon-sm"
																disabled={courseStatus !== "draft"}
															>
																<Edit2 />
															</Button>
														}
													/>
													<DeleteQuizDialog
														courseId={courseId}
														moduleId={module.uuid}
														quiz={quiz}
														trigger={
															<Button
																variant="ghost"
																size="icon-sm"
																disabled={courseStatus !== "draft"}
															>
																<Trash2 />
															</Button>
														}
													/>
												</div>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</motion.div>
	);
}

function ModuleFormDialog({
	mode,
	courseId,
	module,
	trigger,
}: {
	mode: "create" | "edit";
	courseId: string;
	module?: Module;
	trigger: React.ReactElement;
}) {
	const [open, setOpen] = useState(false);
	const createMutation = useMutation({
		...postCoursesByCourseIdModulesMutation(),
		onSuccess: () => setOpen(false),
	});
	const updateMutation = useMutation({
		...putCoursesByCourseIdModulesByModuleIdMutation(),
		onSuccess: () => setOpen(false),
	});

	const moduleFormSchema = z.object({
		title: z.string().trim().min(1, "Title is required"),
		description: z.string(),
	});

	const form = useAppForm({
		defaultValues: {
			title: module?.title ?? "",
			description: module?.description ?? "",
		},
		validators: {
			onChange: moduleFormSchema,
		},
		onSubmit: async ({ value }) => {
			if (mode === "create") {
				await createMutation.mutateAsync({
					path: { courseId },
					body: {
						title: value.title,
						description: value.description,
					},
				});
				return;
			}

			if (module) {
				await updateMutation.mutateAsync({
					path: { courseId, moduleId: module.uuid },
					body: {
						title: value.title,
						description: value.description,
					},
				});
			}
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={trigger} />
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{mode === "create" ? "Create Module" : "Edit Module"}
					</DialogTitle>
					<DialogDescription>
						{mode === "create"
							? "Bundle materials and quizzes into a single module."
							: "Update module details."}
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					<form.AppField name="title">
						{(field) => (
							<field.TextField label="Title" placeholder="Module title" />
						)}
					</form.AppField>
					<form.AppField name="description">
						{(field) => (
							<field.TextareaField
								label="Description"
								placeholder="Optional module description"
								rows={3}
							/>
						)}
					</form.AppField>
					<DialogFooter>
						<DialogClose render={<Button variant="outline">Cancel</Button>} />
						<form.AppForm>
							<form.SubscribeButton
								label={mode === "create" ? "Create Module" : "Save Changes"}
							/>
						</form.AppForm>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function DeleteModuleDialog({
	courseId,
	module,
	trigger,
}: {
	courseId: string;
	module: Module;
	trigger: React.ReactElement;
}) {
	const [open, setOpen] = useState(false);
	const deleteMutation = useMutation({
		...deleteCoursesByCourseIdModulesByModuleIdMutation(),
		onSuccess: () => setOpen(false),
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={trigger} />
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Delete Module</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete "
						<span className="text-accent">{module.title}</span>"? This action
						cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose render={<Button variant="outline">Cancel</Button>} />
					<Button
						variant="destructive"
						disabled={deleteMutation.isPending}
						onClick={() =>
							deleteMutation.mutate({
								path: { courseId, moduleId: module.uuid },
							})
						}
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
