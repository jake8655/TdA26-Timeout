"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import {
	ArrowLeft,
	ChartColumnDecreasing,
	Download,
	Edit2,
	ExternalLink,
	HelpCircle,
	Loader2,
	Plus,
	Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useState } from "react";
import {
	getCoursesByCourseIdMaterialsOptions,
	getCoursesByCourseIdOptions,
	getCoursesByCourseIdQuizzesOptions,
	postCoursesByCourseIdArchiveMutation,
	postCoursesByCourseIdDuplicateMutation,
	postCoursesByCourseIdPauseMutation,
	postCoursesByCourseIdStartMutation,
	putCoursesByCourseIdStatusMutation,
} from "@/api-client/@tanstack/react-query.gen";
import type { CourseDetail, Quiz } from "@/api-client/types.gen";
import { CourseStatus } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import BackgroundGrid from "@/components/background-grid";
import { CourseFeed } from "@/components/courses/course-feed";
import { CourseKickDialog } from "@/components/courses/course-kick-dialog";
import { DeleteFeedPostButton } from "@/components/courses/delete-feed-post-dialog";
import {
	CreateFeedPostButton,
	EditFeedPostButton,
} from "@/components/courses/feed-post-form-dialog";
import { CourseFormDialog } from "@/components/dashboard/course-form-dialog";
import { DeleteMaterialDialog } from "@/components/dashboard/delete-material-dialog";
import { MaterialFormDialog } from "@/components/dashboard/material-form-dialog";
import {
	DeleteQuizDialog,
	QuizFormDialog,
} from "@/components/dashboard/quiz-form-dialog";
import EmptyState from "@/components/empty-state";
import LoadingPlaceholder from "@/components/loading-placeholder";
import { QuizStatsDialog } from "@/components/quizzes/quiz-stats-dialog";
import { Input } from "@/components/ui/input";
import { useRequireAuth } from "@/hooks/use-require-auth";
import {
	formatFileSize,
	getFileTypeLabel,
	getMaterialIcon,
	type Material,
} from "@/lib/material-utils";

const COURSE_TIMEZONE = "Europe/Bratislava";

export default function DashboardCourseDetailPage({
	params,
}: {
	params: Promise<{ uuid: string }>;
}) {
	const { uuid } = use(params);
	const { data: authData } = useRequireAuth();
	const [kickDialog, setKickDialog] = useState<{
		open: boolean;
		reason?: string;
	}>({ open: false });

	const {
		data: course,
		isPending: courseLoading,
		isError: courseError,
		refetch: refetchCourse,
	} = useQuery({
		...getCoursesByCourseIdOptions({
			path: { courseId: uuid },
		}),
	});

	const {
		data: materials,
		isPending: materialsLoading,
		isError: materialsError,
		refetch: refetchMaterials,
	} = useQuery({
		...getCoursesByCourseIdMaterialsOptions({
			path: { courseId: uuid },
		}),
	});

	const {
		data: quizzes,
		isPending: quizzesLoading,
		isError: quizzesError,
		refetch: refetchQuizzes,
	} = useQuery({
		...getCoursesByCourseIdQuizzesOptions({
			path: { courseId: uuid },
		}),
	});

	const kickMutation = useMutation({
		...postCoursesByCourseIdPauseMutation(),
	});
	const startMutation = useMutation({
		...postCoursesByCourseIdStartMutation(),
	});
	const archiveMutation = useMutation({
		...postCoursesByCourseIdArchiveMutation(),
	});
	const statusMutation = useMutation({
		...putCoursesByCourseIdStatusMutation(),
	});
	const duplicateMutation = useMutation({
		...postCoursesByCourseIdDuplicateMutation(),
	});

	if (!authData) {
		return <LoadingPlaceholder />;
	}

	if (!courseLoading && !courseError && !course) {
		notFound();
	}

	return (
		<section className="relative min-h-screen overflow-hidden pt-28 pb-16">
			<BackgroundGrid />
			<CourseKickDialog
				open={kickDialog.open}
				reason={kickDialog.reason}
				redirectTo="/dashboard"
				onClose={() => setKickDialog({ open: false })}
			/>

			<div className="relative z-10 mx-auto max-w-4xl space-y-8 px-6">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.4 }}
				>
					<Button
						variant="ghost"
						size="sm"
						className="text-muted-foreground hover:text-primary dark:hover:bg-transparent"
						asChild
					>
						<Link href="/dashboard">
							<ArrowLeft />
							Back to Dashboard
						</Link>
					</Button>
				</motion.div>

				{courseLoading ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="flex justify-center py-12"
					>
						<Loader2 className="size-16 animate-spin text-primary" />
					</motion.div>
				) : courseError ? (
					<EmptyState
						title="Unable to load course"
						description="Please try again in a moment."
						icon={<HelpCircle className="size-7 text-primary" />}
						action={
							<Button
								variant="outline"
								size="sm"
								onClick={() => refetchCourse()}
							>
								Retry
							</Button>
						}
					/>
				) : (
					<>
						<CourseStatusPanel
							course={course}
							onUpdateStatus={(next) =>
								statusMutation.mutate({
									path: { courseId: uuid },
									body: next,
								})
							}
							onStart={(endAt) =>
								startMutation.mutate({
									path: { courseId: uuid },
									body: { scheduledEndAt: endAt },
								})
							}
							onPause={(payload) =>
								kickMutation.mutate({
									path: { courseId: uuid },
									body: payload,
								})
							}
							onArchive={() =>
								archiveMutation.mutate({
									path: { courseId: uuid },
								})
							}
							onDuplicate={(name) =>
								duplicateMutation.mutate({
									path: { courseId: uuid },
									body: { name },
								})
							}
						/>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="border border-white/5 bg-card/40 p-6 backdrop-blur-sm"
						>
							<div className="flex items-center gap-4">
								<div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 shadow-inner shadow-primary/10">
									<Image
										src="/icons/Idea/zarivka_idea_blue.svg"
										alt="Course icon"
										width={32}
										height={32}
									/>
								</div>
								<div className="flex-1 overflow-hidden">
									<div className="flex items-start justify-between">
										<h1 className="font-bold text-primary text-xl sm:text-2xl">
											{course.name}
										</h1>
										<CourseFormDialog
											mode="edit"
											course={course}
											trigger={
												<Button
													variant="ghost"
													size="sm"
													className="ml-2"
													aria-label="Edit course"
													disabled={course.status !== CourseStatus.DRAFT}
												>
													<Edit2 />
												</Button>
											}
										/>
									</div>
									<p className="mt-1 line-clamp-2 text-muted-foreground text-sm leading-relaxed">
										{course.description || (
											<span className="italic">No description available</span>
										)}
									</p>
								</div>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="flex items-center justify-between"
						>
							<h2 className="font-semibold text-foreground text-xl">
								Course Feed
							</h2>
							<CreateFeedPostButton
								courseId={uuid}
								disabled={course.status !== CourseStatus.DRAFT}
							/>
						</motion.div>

						<CourseFeed
							courseId={uuid}
							showActions
							editTrigger={(item) => (
								<EditFeedPostButton post={item} courseId={uuid} />
							)}
							deleteTrigger={(item) => (
								<DeleteFeedPostButton post={item} courseId={uuid} />
							)}
							onKick={(payload) =>
								setKickDialog({
									open: true,
									reason: payload.reason,
								})
							}
						/>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="flex items-center justify-between"
						>
							<h2 className="font-semibold text-foreground text-xl">
								Course Materials
							</h2>
							<MaterialFormDialog
								mode="add"
								courseId={uuid}
								trigger={
									<Button
										variant="accent"
										size="sm"
										disabled={course.status !== CourseStatus.DRAFT}
									>
										<Plus />
										Add Material
									</Button>
								}
							/>
						</motion.div>

						{materialsLoading ? (
							<div className="flex justify-center py-12">
								<Loader2 className="size-8 animate-spin text-primary" />
							</div>
						) : materialsError ? (
							<EmptyState
								title="Unable to load materials"
								description="Please try again in a moment."
								icon={<Download className="size-7 text-primary" />}
								action={
									<Button
										variant="outline"
										size="sm"
										onClick={() => refetchMaterials()}
									>
										Retry
									</Button>
								}
							/>
						) : materials.length === 0 ? (
							<EmptyState
								title="No materials yet"
								description="Add files or links for your students."
								icon={<Plus className="size-7 text-primary" />}
								action={
									<MaterialFormDialog
										mode="add"
										courseId={uuid}
										trigger={
											<Button
												variant="accent"
												size="sm"
												disabled={course.status !== CourseStatus.DRAFT}
											>
												<Plus />
												Add First Material
											</Button>
										}
									/>
								}
								className="border-dashed"
							/>
						) : (
							<div className="flex flex-col gap-3">
								<AnimatePresence mode="popLayout">
									{materials.map((material, index) => (
										<DashboardMaterialCard
											key={material.uuid}
											material={material}
											courseId={uuid}
											courseStatus={course.status ?? CourseStatus.DRAFT}
											index={index}
										/>
									))}
								</AnimatePresence>
							</div>
						)}

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
								courseId={uuid}
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

						{quizzesLoading ? (
							<div className="flex justify-center py-12">
								<Loader2 className="size-8 animate-spin text-primary" />
							</div>
						) : quizzesError ? (
							<EmptyState
								title="Unable to load quizzes"
								description="Please try again in a moment."
								icon={<HelpCircle className="size-7 text-primary" />}
								action={
									<Button
										variant="outline"
										size="sm"
										onClick={() => refetchQuizzes()}
									>
										Retry
									</Button>
								}
							/>
						) : quizzes.length === 0 ? (
							<EmptyState
								title="No quizzes yet"
								description="Create your first quiz to test student knowledge."
								icon={<Plus className="size-7 text-primary" />}
								action={
									<QuizFormDialog
										mode="create"
										courseId={uuid}
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
											courseId={uuid}
											courseStatus={course.status ?? CourseStatus.DRAFT}
											index={index}
										/>
									))}
								</AnimatePresence>
							</div>
						)}
					</>
				)}
			</div>
		</section>
	);
}

function CourseStatusPanel({
	course,
	onUpdateStatus,
	onStart,
	onPause,
	onArchive,
	onDuplicate,
}: {
	course: CourseDetail;
	onUpdateStatus: (payload: {
		status: string;
		scheduledStartAt?: string;
		scheduledEndAt?: string;
	}) => void;
	onStart: (endAt: string) => void;
	onPause: (payload: {
		scheduledStartAt?: string;
		scheduledEndAt?: string;
	}) => void;
	onArchive: () => void;
	onDuplicate: (name: string) => void;
}) {
	const [startAt, setStartAt] = useState(
		course.scheduledStartAt ? toLocalInput(course.scheduledStartAt) : "",
	);
	const [endAt, setEndAt] = useState(
		course.scheduledEndAt ? toLocalInput(course.scheduledEndAt) : "",
	);
	const [duplicateName, setDuplicateName] = useState(course.name);

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="border border-white/5 bg-card/40 p-6 backdrop-blur-sm"
		>
			<div className="flex flex-wrap items-center justify-between gap-4">
				<div>
					<p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
						Course Status
					</p>
					<p className="mt-2 font-semibold text-foreground text-lg">
						{course.status ?? "draft"}
					</p>
				</div>
				<div className="flex flex-wrap items-center gap-2">
					<Button
						variant="outline"
						onClick={() => onUpdateStatus({ status: "draft" })}
						disabled={course.status === CourseStatus.DRAFT}
					>
						Move to Draft
					</Button>
					<Button
						variant="outline"
						onClick={() => onArchive()}
						disabled={course.status === CourseStatus.ARCHIVED}
					>
						Archive
					</Button>
				</div>
			</div>
			<div className="mt-6 grid gap-4 lg:grid-cols-3">
				<div className="space-y-3 rounded-none border border-white/5 bg-card/50 p-4">
					<p className="font-semibold text-foreground text-sm">Schedule</p>
					<Input
						type="datetime-local"
						value={startAt}
						onChange={(event) => setStartAt(event.target.value)}
						className="h-10"
					/>
					<Input
						type="datetime-local"
						value={endAt}
						onChange={(event) => setEndAt(event.target.value)}
						className="h-10"
					/>
					<Button
						variant="accent"
						onClick={() =>
							onUpdateStatus({
								status: "scheduled",
								scheduledStartAt: toUtcIso(startAt),
								scheduledEndAt: toUtcIso(endAt),
							})
						}
						disabled={!startAt || !endAt}
					>
						Schedule
					</Button>
				</div>
				<div className="space-y-3 rounded-none border border-white/5 bg-card/50 p-4">
					<p className="font-semibold text-foreground text-sm">Go Live</p>
					<Input
						type="datetime-local"
						value={endAt}
						onChange={(event) => setEndAt(event.target.value)}
						className="h-10"
					/>
					<Button
						variant="accent"
						onClick={() => onStart(toUtcIso(endAt))}
						disabled={!endAt}
					>
						Start Now
					</Button>
				</div>
				<div className="space-y-3 rounded-none border border-white/5 bg-card/50 p-4">
					<p className="font-semibold text-foreground text-sm">Pause</p>
					<Button
						variant="outline"
						onClick={() =>
							onPause({
								scheduledStartAt: toUtcIso(startAt),
								scheduledEndAt: toUtcIso(endAt),
							})
						}
					>
						Pause Course
					</Button>
				</div>
			</div>
			<div className="mt-6 flex flex-wrap items-center gap-3">
				<Input
					value={duplicateName}
					onChange={(event) => setDuplicateName(event.target.value)}
					className="h-10 max-w-sm"
				/>
				<Button
					variant="outline"
					onClick={() => onDuplicate(duplicateName)}
					disabled={!duplicateName}
				>
					Duplicate Course
				</Button>
			</div>
		</motion.div>
	);
}

function toUtcIso(value: string) {
	if (!value) return value;
	const [datePart, timePart] = value.split("T");
	if (!datePart || !timePart) return value;
	const dateParts = datePart.split("-");
	const timeParts = timePart.split(":");
	if (dateParts.length !== 3 || timeParts.length < 2) return value;
	const year = Number(dateParts[0]);
	const month = Number(dateParts[1]);
	const day = Number(dateParts[2]);
	const hour = Number(timeParts[0]);
	const minute = Number(timeParts[1]);
	if ([year, month, day, hour, minute].some(Number.isNaN)) return value;
	const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute));
	const offsetMinutes = getTimeZoneOffsetMinutes(utcDate, COURSE_TIMEZONE);
	return new Date(utcDate.getTime() - offsetMinutes * 60000).toISOString();
}

function toLocalInput(value: string) {
	if (!value) return value;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	const parts = getTimeZoneParts(date, COURSE_TIMEZONE);
	return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string) {
	const parts = getTimeZoneParts(date, timeZone);
	const year = Number(parts.year);
	const month = Number(parts.month);
	const day = Number(parts.day);
	const hour = Number(parts.hour);
	const minute = Number(parts.minute);
	if ([year, month, day, hour, minute].some(Number.isNaN)) return 0;
	const utcFromParts = Date.UTC(year, month - 1, day, hour, minute, 0);
	return (utcFromParts - date.getTime()) / 60000;
}

function getTimeZoneParts(date: Date, timeZone: string) {
	const formatter = new Intl.DateTimeFormat("en-GB", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
	const parts = formatter.formatToParts(date);
	const map = new Map(parts.map((part) => [part.type, part.value]));
	return {
		year: map.get("year") ?? "",
		month: map.get("month") ?? "",
		day: map.get("day") ?? "",
		hour: map.get("hour") ?? "",
		minute: map.get("minute") ?? "",
	};
}

function DashboardMaterialCard({
	material,
	courseId,
	courseStatus,
	index,
}: {
	material: Material;
	courseId: string;
	courseStatus: CourseStatus;
	index: number;
}) {
	const Icon = getMaterialIcon(material);

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ duration: 0.3, delay: index * 0.03 }}
			className="group flex items-start gap-4 rounded-none border border-white/5 bg-card/40 p-4 backdrop-blur-sm transition-colors duration-300 hover:border-white/10"
		>
			<div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
				{material.type === "url" && material.faviconUrl ? (
					<Image
						src={material.faviconUrl}
						alt={material.name}
						width={24}
						height={24}
						className="size-6"
						unoptimized
					/>
				) : (
					<Icon className="size-6 text-primary" />
				)}
			</div>

			<div className="flex-1 overflow-hidden">
				<h3 className="font-semibold text-foreground text-sm">
					{material.name}
				</h3>
				<p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
					{material.description || (
						<span className="italic">No description available</span>
					)}
				</p>
				<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
					{material.type === "url" ? (
						<span className="truncate">{new URL(material.url).hostname}</span>
					) : (
						<>
							<span>{getFileTypeLabel(material.mimeType)}</span>
							{material.sizeBytes && (
								<>
									<span className="text-white/20">•</span>
									<span>{formatFileSize(material.sizeBytes)}</span>
								</>
							)}
						</>
					)}
				</div>
			</div>

			<div className="flex flex-col items-end gap-2">
				{material.type === "url" ? (
					<Button
						variant="outline"
						size="sm"
						className="shrink-0 gap-1.5 border-white/10 text-muted-foreground hover:border-primary/30 hover:text-primary"
						asChild
					>
						<a href={material.url} target="_blank" rel="noopener noreferrer">
							<ExternalLink className="size-3.5" />
							<span className="hidden sm:inline">Visit Site</span>
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
							<span className="hidden sm:inline">Download</span>
						</a>
					</Button>
				)}

				<div className="flex gap-1 transition-opacity group-hover:opacity-100 lg:opacity-0">
					<MaterialFormDialog
						mode="edit"
						courseId={courseId}
						material={material}
						trigger={
							<Button
								variant="ghost"
								size="icon-sm"
								className="size-8 text-muted-foreground hover:text-primary dark:hover:bg-primary/10"
								aria-label="Edit material"
								disabled={courseStatus !== CourseStatus.DRAFT}
							>
								<Edit2 />
							</Button>
						}
					/>
					<DeleteMaterialDialog
						courseId={courseId}
						material={material}
						trigger={
							<Button
								variant="ghost"
								size="icon-sm"
								className="size-8 text-muted-foreground hover:text-destructive dark:hover:bg-destructive/10"
								aria-label="Delete material"
								disabled={courseStatus !== CourseStatus.DRAFT}
							>
								<Trash2 />
							</Button>
						}
					/>
				</div>
			</div>
		</motion.div>
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
					quizId={quiz.uuid ?? ""}
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
