"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowLeft,
	BookOpen,
	CalendarClock,
	Download,
	ExternalLink,
	Loader2,
	MessageSquareText,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import {
	getCoursesByCourseIdOptions,
	postCoursesByCourseIdJoinMutation,
	postCoursesByCourseIdMaterialsByMaterialIdInteractionsMutation,
	postCoursesByCourseIdSessionMutation,
} from "@/api-client/@tanstack/react-query.gen";
import {
	CourseStatus,
	type Material,
	type Module,
} from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import BackgroundGrid from "@/components/background-grid";
import { CourseFeed } from "@/components/courses/course-feed";
import { CourseKickDialog } from "@/components/courses/course-kick-dialog";
import EmptyState from "@/components/empty-state";
import { CourseQuizCard } from "@/components/quizzes/course-quiz-card";
import { formatCourseTime } from "@/lib/course-date-utils";
import {
	formatFileSize,
	getFileTypeLabel,
	getMaterialIcon,
} from "@/lib/material-utils";

function isNotFoundError(error: unknown) {
	if (!error || typeof error !== "object") {
		return false;
	}

	const maybeError = error as {
		response?: { status: number };
	};

	return maybeError.response?.status === 404;
}

export default function CourseDetailClient() {
	const { uuid } = useParams<{ uuid: string }>();

	const [kickDialog, setKickDialog] = useState<{
		open: boolean;
		reason?: string;
	}>({ open: false });
	const { data, error, isPending, isError, refetch } = useQuery({
		...getCoursesByCourseIdOptions({
			path: { courseId: uuid },
		}),
	});
	const joinMutation = useMutation({
		...postCoursesByCourseIdJoinMutation(),
	});
	const sessionMutation = useMutation({
		...postCoursesByCourseIdSessionMutation(),
	});

	const queryClient = useQueryClient();

	if (
		(!isPending && !isError && !data) ||
		(isError && isNotFoundError(error))
	) {
		notFound();
	}

	if (
		data?.status === CourseStatus.DRAFT ||
		data?.status === CourseStatus.ARCHIVED
	) {
		notFound();
	}

	return (
		<div className="relative min-h-screen overflow-hidden">
			<BackgroundGrid />
			<CourseKickDialog
				open={kickDialog.open}
				reason={kickDialog.reason}
				onClose={() => {
					setKickDialog({ open: false });
					queryClient.invalidateQueries();
				}}
			/>

			<main className="relative z-10 mx-auto max-w-4xl px-6 pt-32 pb-24">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.4 }}
					className="mb-8"
				>
					<Button
						variant="ghost"
						size="sm"
						className="text-muted-foreground hover:text-primary dark:hover:bg-transparent"
						asChild
					>
						<Link href="/courses">
							<ArrowLeft />
							Back to Courses
						</Link>
					</Button>
				</motion.div>

				{isPending ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5 }}
						className="flex justify-center"
					>
						<Loader2 className="size-16 animate-spin text-primary" />
					</motion.div>
				) : isError ? (
					<EmptyState
						title="Unable to load course"
						description="Please try again in a moment."
						icon={<MessageSquareText className="size-7 text-primary" />}
						action={
							<Button variant="outline" size="sm" onClick={() => refetch()}>
								Retry
							</Button>
						}
					/>
				) : data.status === CourseStatus.SCHEDULED ||
					data.status === CourseStatus.PAUSED ? (
					<section className="border border-white/5 bg-card/40 p-8 backdrop-blur-sm md:p-12">
						<div className="mb-8 flex items-center gap-6">
							<div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 shadow-inner shadow-primary/10 md:size-20">
								<Image
									src="/icons/Idea/zarivka_idea_blue.svg"
									alt="Course icon"
									width={40}
									height={40}
									className="size-10 md:size-12"
								/>
							</div>
							<div>
								<h1 className="font-bold text-2xl text-primary md:text-3xl lg:text-4xl">
									{data.name}
								</h1>
								<p className="mt-2 text-muted-foreground">
									{data.description ||
										"Course details will be available when it goes live."}
								</p>
								{data.status === CourseStatus.SCHEDULED &&
									data.scheduledStartAt && (
										<div className="mt-3 flex flex-wrap items-center gap-3 text-muted-foreground text-xs">
											{data.scheduledStartAt && (
												<span className="inline-flex items-center gap-2">
													<CalendarClock className="size-3.5" />
													Starts {formatCourseTime(data.scheduledStartAt)}
												</span>
											)}
										</div>
									)}
							</div>
						</div>
						<div className="rounded-none border border-white/5 bg-card/50 p-6 text-muted-foreground">
							This course is currently {data.status}.
						</div>
					</section>
				) : (
					<section className="border border-white/5 bg-card/40 p-8 backdrop-blur-sm md:p-12">
						<div className="mb-8 flex items-center gap-6">
							<div className="flex size-16 shrink-0 items-center justify-center rounded-xl bg-primary/10 shadow-inner shadow-primary/10 md:size-20">
								<Image
									src="/icons/Idea/zarivka_idea_blue.svg"
									alt="Course icon"
									width={40}
									height={40}
									className="size-10 md:size-12"
								/>
							</div>
							<div className="flex flex-1 flex-wrap items-start justify-between gap-4">
								<div className="space-y-2">
									<h1 className="font-bold text-2xl text-primary md:text-3xl lg:text-4xl">
										{data.name}
									</h1>
									{data.scheduledStartAt && (
										<span className="inline-flex items-center gap-2 text-muted-foreground text-xs">
											<CalendarClock className="size-3.5" />
											Starts {formatCourseTime(data.scheduledStartAt)}
										</span>
									)}
								</div>
								<div className="ml-auto">
									{!data.joined && !joinMutation.isSuccess && (
										<Button
											variant="accent"
											disabled={
												joinMutation.isPending || sessionMutation.isPending
											}
											onClick={() => {
												sessionMutation.mutate(
													{ path: { courseId: uuid } },
													{
														onSuccess: () =>
															joinMutation.mutate({ path: { courseId: uuid } }),
													},
												);
											}}
										>
											{joinMutation.isPending || sessionMutation.isPending ? (
												<>
													<Loader2 className="size-4 animate-spin" />
													Joining
												</>
											) : (
												"Join course"
											)}
										</Button>
									)}
									{(data.joined || joinMutation.isSuccess) && (
										<span className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-semibold text-[11px] text-emerald-200 uppercase tracking-wide">
											Joined
										</span>
									)}
								</div>
							</div>
						</div>

						{data.joined || joinMutation.isSuccess ? (
							<>
								<div className="border-white/5 border-t pt-8">
									<h2 className="mb-4 font-semibold text-foreground text-lg">
										About this course
									</h2>
									<p className="max-w-2xl text-muted-foreground leading-relaxed">
										{data.description || (
											<span className="italic">No description available</span>
										)}
									</p>
								</div>

								<div className="mt-8">
									<div className="mb-6 flex items-center gap-3">
										<BookOpen className="size-5 text-primary" />
										<h2 className="font-semibold text-foreground text-lg">
											Course Feed
										</h2>
									</div>
									<CourseFeed
										courseId={uuid}
										onKick={(payload) =>
											setKickDialog({
												open: true,
												reason: payload.reason,
											})
										}
										onModuleReveal={() => queryClient.invalidateQueries()}
										onModuleHidden={() => queryClient.invalidateQueries()}
									/>
								</div>

								<div className="mt-8 border-white/5 border-t pt-8">
									<div className="mb-6 flex items-center gap-3">
										<BookOpen className="size-5 text-primary" />
										<h2 className="font-semibold text-foreground text-lg">
											Modules
										</h2>
									</div>
									<LiveModules modules={data.modules ?? []} courseId={uuid} />
								</div>
							</>
						) : (
							<div className="border-white/5 border-t pt-8">
								<EmptyState
									title="Join to view course content"
									description="Once you join, the feed and modules will unlock."
									icon={<BookOpen className="size-7 text-primary" />}
								/>
							</div>
						)}
					</section>
				)}
			</main>
		</div>
	);
}

function LiveModules({
	modules,
	courseId,
}: {
	modules: Module[];
	courseId: string;
}) {
	if (modules.length === 0) {
		return (
			<EmptyState
				title="No modules revealed yet"
				description="Your lecturer will reveal modules one by one during the session."
				icon={<BookOpen className="size-7 text-primary" />}
			/>
		);
	}

	return (
		<div className="space-y-4">
			{modules.map((module) => (
				<div
					key={module.uuid}
					className="rounded-none border border-white/5 bg-card/30 p-4"
				>
					<h3 className="font-semibold text-base text-foreground">
						{module.title}
					</h3>
					{module.description && (
						<p className="mt-1 text-muted-foreground text-sm">
							{module.description}
						</p>
					)}

					<div className="mt-4 space-y-4">
						<div>
							<p className="mb-2 font-semibold text-foreground text-sm">
								Materials
							</p>
							{(module.materials?.length ?? 0) === 0 ? (
								<p className="text-muted-foreground text-xs italic">
									No materials in this module.
								</p>
							) : (
								<div className="space-y-2">
									{(module.materials ?? []).map((material) => (
										<ModuleMaterialRow
											key={material.uuid}
											material={material}
											courseId={courseId}
										/>
									))}
								</div>
							)}
						</div>

						<div>
							<p className="mb-2 font-semibold text-foreground text-sm">
								Quizzes
							</p>
							{(module.quizzes?.length ?? 0) === 0 ? (
								<p className="text-muted-foreground text-xs italic">
									No quizzes in this module.
								</p>
							) : (
								<div className="space-y-3">
									{(module.quizzes ?? []).map((quiz) => (
										<CourseQuizCard
											key={quiz.uuid ?? quiz.title}
											quiz={quiz}
											courseId={courseId}
											moduleId={module.uuid}
											onSaveResult={() => {}}
										/>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			))}
		</div>
	);
}

function ModuleMaterialRow({
	material,
	courseId,
}: {
	material: Material;
	courseId: string;
}) {
	const Icon = getMaterialIcon(material);
	const interactionMutation = useMutation({
		...postCoursesByCourseIdMaterialsByMaterialIdInteractionsMutation(),
	});

	const handleInteraction = (url: string) => {
		interactionMutation.mutate({
			path: { courseId, materialId: material.uuid },
		});
		window.open(url, "_blank", "noopener,noreferrer");
	};

	if (material.type === "url") {
		return (
			<div className="flex items-center justify-between rounded-none border border-white/5 bg-background/20 p-3 text-sm transition-colors hover:border-primary/30">
				<div className="flex min-w-0 items-center gap-3">
					<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
						{material.faviconUrl ? (
							<Image
								src={material.faviconUrl}
								alt={material.name}
								width={20}
								height={20}
								className="size-5"
								unoptimized
							/>
						) : (
							<Icon className="size-5 text-primary" />
						)}
					</div>
					<div className="min-w-0">
						<p className="truncate font-medium text-foreground">
							{material.name}
						</p>
						<p className="truncate text-muted-foreground text-xs">
							{material.url}
						</p>
					</div>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="shrink-0 gap-1.5 border-white/10 text-muted-foreground hover:border-primary/30 hover:text-primary"
					onClick={() => handleInteraction(material.url)}
				>
					<ExternalLink className="size-3.5" />
					Visit Site
				</Button>
			</div>
		);
	}

	return (
		<div className="flex items-center justify-between rounded-none border border-white/5 bg-background/20 p-3 text-sm transition-colors hover:border-primary/30">
			<div className="flex min-w-0 items-center gap-3">
				<div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
					<Icon className="size-5 text-primary" />
				</div>
				<div className="min-w-0">
					<p className="truncate font-medium text-foreground">
						{material.name}
					</p>
					<p className="truncate text-muted-foreground text-xs">
						{getFileTypeLabel(material.mimeType)}
						{material.sizeBytes
							? ` • ${formatFileSize(material.sizeBytes)}`
							: ""}
					</p>
				</div>
			</div>
			<Button
				variant="outline"
				size="sm"
				className="shrink-0 gap-1.5 border-white/10 text-muted-foreground hover:border-primary/30 hover:text-primary"
				onClick={() => handleInteraction(material.fileUrl)}
			>
				<Download className="size-3.5" />
				Download
			</Button>
		</div>
	);
}
