"use client";

import type { DragEndEvent, Modifier } from "@dnd-kit/core";
import {
	closestCenter,
	DndContext,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
} from "@dnd-kit/core";
import {
	SortableContext,
	sortableKeyboardCoordinates,
	useSortable,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
	BookOpen,
	ChartColumnDecreasing,
	ChevronDown,
	ChevronRight,
	Download,
	Edit2,
	ExternalLink,
	Eye,
	EyeOff,
	GripVertical,
	Loader2,
	Plus,
	Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { z } from "zod";

import {
	deleteCoursesByCourseIdModulesByModuleIdMutation,
	getCoursesByCourseIdModulesOptions,
	postCoursesByCourseIdModulesMutation,
	putCoursesByCourseIdModulesByModuleIdMutation,
	putCoursesByCourseIdModulesHideLastMutation,
	putCoursesByCourseIdModulesOrderMutation,
	putCoursesByCourseIdModulesRevealNextMutation,
} from "@/api-client/@tanstack/react-query.gen";
import type { CourseStatus, FileMaterial, Module, UrlMaterial } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { DeleteMaterialDialog } from "@/components/dashboard/delete-material-dialog";
import { MaterialFormDialog } from "@/components/dashboard/material-form-dialog";
import { DeleteQuizDialog, QuizFormDialog } from "@/components/dashboard/quiz-form-dialog";
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
import { formatFileSize, getFileTypeLabel, getMaterialIcon } from "@/lib/material-utils";

const restrictToVerticalAxis: Modifier = ({ transform }) => ({
	...transform,
	x: 0,
});

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

	const [orderedModules, setOrderedModules] = useState<Module[]>([]);

	useEffect(() => {
		if (modules) {
			setOrderedModules([...modules]);
		}
	}, [modules]);

	const reorderMutation = useMutation({
		...putCoursesByCourseIdModulesOrderMutation(),
	});

	const revealNextMutation = useMutation({
		...putCoursesByCourseIdModulesRevealNextMutation(),
	});

	const hideLastMutation = useMutation({
		...putCoursesByCourseIdModulesHideLastMutation(),
	});

	const sensors = useSensors(
		useSensor(PointerSensor, {
			activationConstraint: { distance: 5 },
		}),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		}),
	);

	const handleDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const oldIndex = orderedModules.findIndex((m) => m.uuid === active.id);
		const newIndex = orderedModules.findIndex((m) => m.uuid === over.id);
		if (oldIndex === -1 || newIndex === -1) return;

		const newOrder = [...orderedModules];
		const [removed] = newOrder.splice(oldIndex, 1);
		if (!removed) return;
		newOrder.splice(newIndex, 0, removed);
		setOrderedModules(newOrder);

		reorderMutation.mutate({
			path: { courseId },
			body: { moduleIds: newOrder.map((m) => m.uuid) },
		});
	};

	if (isPending) {
		return (
			<div className="flex justify-center py-12">
				<Loader2 className="text-primary size-8 animate-spin" />
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

	const moduleList = orderedModules;
	const isDraft = courseStatus === "draft";
	const isLive = courseStatus === "live";

	const revealedModules = moduleList.filter((m) => m.visible);
	const unrevealedModules = moduleList.filter((m) => !m.visible);
	const nextToReveal = unrevealedModules[0];
	const lastRevealed = revealedModules[revealedModules.length - 1];
	const nextIsEmpty =
		nextToReveal &&
		(nextToReveal.materials ?? []).length === 0 &&
		(nextToReveal.quizzes ?? []).length === 0;

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h2 className="text-foreground text-xl font-semibold">Modules</h2>
				<ModuleFormDialog
					mode="create"
					courseId={courseId}
					trigger={
						<Button variant="accent" size="sm" disabled={!isDraft}>
							<Plus />
							Create Module
						</Button>
					}
				/>
			</div>

			{isLive && moduleList.length > 0 && (
				<div className="bg-card/40 flex flex-wrap items-center gap-3 rounded-none border border-white/5 p-3 backdrop-blur-sm">
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							disabled={!nextToReveal || nextIsEmpty || revealNextMutation.isPending}
							onClick={() =>
								revealNextMutation.mutate({
									path: { courseId },
								})
							}
						>
							{revealNextMutation.isPending ? (
								<Loader2 className="size-3.5 animate-spin" />
							) : (
								<Eye className="size-3.5" />
							)}
							Reveal Next
						</Button>
						<Button
							variant="outline"
							size="sm"
							disabled={!lastRevealed || hideLastMutation.isPending}
							onClick={() =>
								hideLastMutation.mutate({
									path: { courseId },
								})
							}
						>
							{hideLastMutation.isPending ? (
								<Loader2 className="size-3.5 animate-spin" />
							) : (
								<EyeOff className="size-3.5" />
							)}
							Hide Last
						</Button>
					</div>
					<div className="text-muted-foreground text-xs">
						{revealedModules.length}/{moduleList.length} revealed
					</div>
				</div>
			)}

			{moduleList.length === 0 ? (
				<EmptyState
					title="No modules yet"
					description="Create modules and bundle materials and quizzes together."
					icon={<BookOpen className="text-primary size-7" />}
					className="border-dashed"
				/>
			) : isDraft ? (
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					onDragEnd={handleDragEnd}
					modifiers={[restrictToVerticalAxis]}
				>
					<SortableContext
						items={moduleList.map((m) => m.uuid)}
						strategy={verticalListSortingStrategy}
					>
						<div className="space-y-3">
							{moduleList.map((module, index) => (
								<SortableModuleCard
									key={module.uuid}
									courseId={courseId}
									module={module}
									courseStatus={courseStatus}
									index={index}
									nextToRevealId={nextToReveal?.uuid}
								/>
							))}
						</div>
					</SortableContext>
				</DndContext>
			) : (
				<div className="space-y-3">
					{moduleList.map((module, index) => (
						<ModuleCard
							key={module.uuid}
							courseId={courseId}
							module={module}
							courseStatus={courseStatus}
							index={index}
							nextToRevealId={nextToReveal?.uuid}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function SortableModuleCard({
	courseId,
	module,
	courseStatus,
	index,
	nextToRevealId,
}: {
	courseId: string;
	module: Module;
	courseStatus: CourseStatus;
	index: number;
	nextToRevealId?: string;
}) {
	const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
		id: module.uuid,
	});

	const style = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		zIndex: isDragging ? 50 : "auto",
	};

	return (
		<div ref={setNodeRef} style={style as React.CSSProperties}>
			<ModuleCard
				courseId={courseId}
				module={module}
				courseStatus={courseStatus}
				index={index}
				nextToRevealId={nextToRevealId}
				dragHandleProps={{ ...attributes, ...listeners }}
			/>
		</div>
	);
}

function ModuleCard({
	courseId,
	module,
	courseStatus,
	index,
	nextToRevealId,
	dragHandleProps,
}: {
	courseId: string;
	module: Module;
	courseStatus: CourseStatus;
	index: number;
	nextToRevealId?: string;
	dragHandleProps?: Record<string, unknown>;
}) {
	const [expanded, setExpanded] = useState(false);

	const materials = (module.materials ?? []) as Material[];
	const quizzes = module.quizzes ?? [];

	const isDraft = courseStatus === "draft";
	const isLive = courseStatus === "live";
	const isArchived = courseStatus === "archived";
	const isNextToReveal = isLive && nextToRevealId === module.uuid;
	const showVisibilityBadge = !isDraft && !isArchived;

	return (
		<motion.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, delay: index * 0.03 }}
			className="bg-card/40 rounded-none border border-white/5 backdrop-blur-sm"
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
							<h3 className="text-foreground text-base font-semibold">{module.title}</h3>
							{showVisibilityBadge && (
								<span
									className={`rounded-full px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase ${
										module.visible
											? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-200"
											: "text-muted-foreground border border-white/10 bg-white/5"
									}`}
								>
									{module.visible ? "Revealed" : "Hidden"}
								</span>
							)}
							{isNextToReveal && (
								<span className="border-primary/20 bg-primary/10 text-primary rounded-full border px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase">
									Next
								</span>
							)}
						</div>
						<p className="text-muted-foreground mt-1 text-sm">
							{module.description || <span className="italic">No description</span>}
						</p>
					</div>
				</div>

				<div className="flex flex-wrap items-center gap-2">
					<ModuleFormDialog
						mode="edit"
						courseId={courseId}
						module={module}
						trigger={
							<Button variant="ghost" size="icon-sm" disabled={!isDraft}>
								<Edit2 />
							</Button>
						}
					/>
					<DeleteModuleDialog
						courseId={courseId}
						module={module}
						trigger={
							<Button variant="ghost" size="icon-sm" disabled={!isDraft}>
								<Trash2 />
							</Button>
						}
					/>
					{isDraft && dragHandleProps && (
						<button
							type="button"
							className="text-muted-foreground hover:text-foreground flex size-8 cursor-grab touch-none items-center justify-center active:cursor-grabbing"
							{...dragHandleProps}
						>
							<GripVertical className="size-4" />
						</button>
					)}
				</div>
			</div>

			<AnimatePresence>
				{expanded && (
					<motion.div
						initial={{ height: 0, opacity: 0 }}
						animate={{ height: "auto", opacity: 1 }}
						exit={{ height: 0, opacity: 0 }}
						className="overflow-hidden border-t border-white/5"
					>
						<div className="space-y-5 p-4">
							<div>
								<div className="mb-3 flex items-center justify-between">
									<h4 className="text-foreground text-sm font-semibold">Materials</h4>
									<MaterialFormDialog
										mode="add"
										courseId={courseId}
										moduleId={module.uuid}
										trigger={
											<Button variant="outline" size="sm" disabled={!isDraft}>
												<Plus className="size-3.5" />
												Add Material
											</Button>
										}
									/>
								</div>
								{materials.length === 0 ? (
									<p className="text-muted-foreground text-xs italic">No materials yet.</p>
								) : (
									<div className="space-y-2">
										{materials.map((material) => (
											<div
												key={material.uuid}
												className="bg-background/20 grid grid-cols-1 gap-2 rounded-none border border-white/5 p-3 sm:grid-cols-[auto_1fr_auto] sm:items-start sm:gap-3"
											>
												<div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
													{material.type === "url" && material.faviconUrl ? (
														<Image
															src={material.faviconUrl}
															alt={material.name}
															width={20}
															height={20}
															className="size-5"
															unoptimized
														/>
													) : (
														<MaterialTypeIcon material={material} />
													)}
												</div>
												<div className="min-w-0">
													<p className="text-foreground text-sm font-medium wrap-break-word">
														{material.name}
													</p>
													{material.description && (
														<p className="text-muted-foreground mt-0.5 text-xs wrap-break-word whitespace-pre-wrap">
															{material.description}
														</p>
													)}
													<p className="text-muted-foreground mt-1 text-xs wrap-break-word">
														{material.type === "file"
															? `${getFileTypeLabel(material.mimeType)}${material.sizeBytes ? ` • ${formatFileSize(material.sizeBytes)}` : ""}`
															: new URL(material.url).hostname}
													</p>
												</div>
												<div className="flex gap-1 justify-self-start sm:justify-self-end">
													{material.type === "url" ? (
														<Button
															variant="outline"
															size="sm"
															className="text-muted-foreground hover:border-primary/30 hover:text-primary shrink-0 gap-1.5 border-white/10"
															asChild
														>
															<a href={material.url} target="_blank" rel="noopener noreferrer">
																<ExternalLink className="size-3.5" />
																Visit Site
															</a>
														</Button>
													) : (
														<Button
															variant="outline"
															size="sm"
															className="text-muted-foreground hover:border-primary/30 hover:text-primary shrink-0 gap-1.5 border-white/10"
															asChild
														>
															<a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
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
															<Button variant="ghost" size="icon-sm" disabled={!isDraft}>
																<Edit2 />
															</Button>
														}
													/>
													<DeleteMaterialDialog
														courseId={courseId}
														moduleId={module.uuid}
														material={material}
														trigger={
															<Button variant="ghost" size="icon-sm" disabled={!isDraft}>
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
									<h4 className="text-foreground text-sm font-semibold">Quizzes</h4>
									<QuizFormDialog
										mode="create"
										courseId={courseId}
										moduleId={module.uuid}
										trigger={
											<Button variant="outline" size="sm" disabled={!isDraft}>
												<Plus className="size-3.5" />
												Add Quiz
											</Button>
										}
									/>
								</div>
								{quizzes.length === 0 ? (
									<p className="text-muted-foreground text-xs italic">No quizzes yet.</p>
								) : (
									<div className="space-y-2">
										{quizzes.map((quiz) => (
											<div
												key={quiz.uuid ?? quiz.title}
												className="bg-background/20 flex items-center justify-between gap-3 rounded-none border border-white/5 p-3"
											>
												<div className="min-w-0">
													<p className="text-foreground truncate text-sm font-medium">
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
															<Button variant="ghost" size="icon-sm" disabled={!isDraft}>
																<Edit2 />
															</Button>
														}
													/>
													<DeleteQuizDialog
														courseId={courseId}
														moduleId={module.uuid}
														quiz={quiz}
														trigger={
															<Button variant="ghost" size="icon-sm" disabled={!isDraft}>
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

function MaterialTypeIcon({ material }: { material: Material }) {
	const Icon = getMaterialIcon(material);

	return <Icon className="text-primary size-5" />;
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
		onSuccess: () => {
			form.reset();
			setOpen(false);
		},
	});
	const updateMutation = useMutation({
		...putCoursesByCourseIdModulesByModuleIdMutation(),
		onSuccess: () => {
			form.reset();
			setOpen(false);
		},
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
					<DialogTitle>{mode === "create" ? "Create Module" : "Edit Module"}</DialogTitle>
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
						{(field) => <field.TextField label="Title" placeholder="Module title" />}
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
							<form.SubscribeButton label={mode === "create" ? "Create Module" : "Save Changes"} />
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
						Are you sure you want to delete "<span className="text-accent">{module.title}</span>"?
						This action cannot be undone.
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
							<Loader2 className="text-muted-foreground animate-spin" />
						) : (
							"Delete"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
