"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	ArrowLeft,
	BookOpen,
	CalendarClock,
	Award,
	Download,
	ExternalLink,
	Loader2,
	MessageSquareText,
	ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useParams, usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import {
	getCoursesByCourseIdOptions,
	getCoursesByCourseIdProgressOptions,
	postCoursesByCourseIdMaterialsByMaterialIdInteractionsMutation,
	postCoursesByCourseIdSessionMutation,
} from "@/api-client/@tanstack/react-query.gen";
import { getCoursesByCourseIdCertificate } from "@/api-client";
import {
	CourseStatus,
	type CourseSessionResponse,
	type Material,
	type Module,
} from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import BackgroundGrid from "@/components/background-grid";
import { CourseFeed } from "@/components/courses/course-feed";
import { CourseKickDialog } from "@/components/courses/course-kick-dialog";
import EmptyState from "@/components/empty-state";
import { CourseQuizCard } from "@/components/quizzes/course-quiz-card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCourseTime } from "@/lib/course-date-utils";
import { formatFileSize, getFileTypeLabel, getMaterialIcon } from "@/lib/material-utils";
import { getScopedCoursesPathFromPathname } from "@/lib/tenant-routing";

function isNotFoundError(error: unknown) {
	if (!error || typeof error !== "object") {
		return false;
	}

	const maybeError = error as {
		response?: { status: number };
	};

	return maybeError.response?.status === 404;
}

export default function TenantCourseDetailClient() {
	const { uuid } = useParams<{ uuid: string }>();
	const pathname = usePathname();

	const [kickDialog, setKickDialog] = useState<{
		open: boolean;
		reason?: string;
	}>({ open: false });
	const [autoJoinFailed, setAutoJoinFailed] = useState(false);
	const [username, setUsername] = useState("");
	const [usernameLocked, setUsernameLocked] = useState(false);
	const [sessionReady, setSessionReady] = useState(false);
	const [usernameDialogOpen, setUsernameDialogOpen] = useState(false);
	const [pendingQuizStart, setPendingQuizStart] = useState<null | (() => void)>(null);
	const { data, error, isPending, isError, refetch } = useQuery({
		...getCoursesByCourseIdOptions({
			path: { courseId: uuid },
		}),
	});
	const progressQuery = useQuery({
		...getCoursesByCourseIdProgressOptions({
			path: { courseId: uuid },
		}),
		enabled: data?.status === CourseStatus.LIVE && sessionReady,
	});
	const sessionMutation = useMutation({
		...postCoursesByCourseIdSessionMutation(),
	});
	const certificateMutation = useMutation({
		mutationFn: async () => {
			const response = await getCoursesByCourseIdCertificate({
				path: { courseId: uuid },
				parseAs: "blob",
				responseStyle: "fields",
				throwOnError: true,
			});

			const contentDisposition = response.response.headers.get("Content-Disposition") ?? "";
			const filenameMatch = contentDisposition.match(/filename=([^;]+)/i);
			const filename = filenameMatch?.[1]?.replaceAll('"', "")?.trim() || `certificate-${uuid}.pdf`;

			const url = URL.createObjectURL(response.data);
			const anchor = document.createElement("a");
			anchor.href = url;
			anchor.download = filename;
			document.body.appendChild(anchor);
			anchor.click();
			anchor.remove();
			URL.revokeObjectURL(url);
		},
		onError: () => {
			toast.error("Certificate is not available yet");
		},
	});
	const hasAutoJoinedRef = useRef(false);

	const queryClient = useQueryClient();

	const hydrateSessionState = (sessionResponse: CourseSessionResponse | undefined) => {
		if (!sessionResponse) {
			return;
		}

		setUsername(sessionResponse.username ?? "");
		setUsernameLocked(Boolean(sessionResponse.usernameLocked));
		setSessionReady(true);
	};

	const startSession = async (providedUsername?: string) => {
		hasAutoJoinedRef.current = true;
		setAutoJoinFailed(false);
		return sessionMutation.mutateAsync(
			{
				path: { courseId: uuid },
				body: providedUsername ? { username: providedUsername } : undefined,
			},
			{
				onSuccess: (sessionResponse) => {
					hydrateSessionState(sessionResponse);
				},
				onError: () => {
					setAutoJoinFailed(true);
				},
			},
		);
	};

	const ensureUsernameBeforeQuiz = async () => {
		if (usernameLocked) {
			return true;
		}

		setUsernameDialogOpen(true);
		return false;
	};

	const confirmUsername = async () => {
		const normalized = username.trim();
		if (!normalized) {
			toast.error("Username is required");
			return;
		}

		try {
			const response = await sessionMutation.mutateAsync({
				path: { courseId: uuid },
				body: { username: normalized },
			});
			hydrateSessionState(response);
			setUsernameDialogOpen(false);
			progressQuery.refetch();
			if (pendingQuizStart) {
				pendingQuizStart();
				setPendingQuizStart(null);
			}
		} catch {
			toast.error("Username is already locked for this session");
		}
	};

	useEffect(() => {
		if (!data || data.status !== CourseStatus.LIVE || hasAutoJoinedRef.current) {
			return;
		}

		void startSession();
		// oxlint-disable-next-line react/exhaustive-deps Handled by React Compiler
	}, [data, startSession]);

	if ((!isPending && !isError && !data) || (isError && isNotFoundError(error))) {
		notFound();
	}

	if (data?.status === CourseStatus.DRAFT || data?.status === CourseStatus.ARCHIVED) {
		notFound();
	}

	return (
		<div className="relative min-h-screen overflow-hidden">
			<BackgroundGrid />
			<Dialog open={usernameDialogOpen} onOpenChange={setUsernameDialogOpen}>
				<DialogContent className="sm:max-w-md" showCloseButton={!sessionMutation.isPending}>
					<DialogTitle className="text-foreground text-lg font-semibold">
						Set your username
					</DialogTitle>
					<p className="text-muted-foreground text-sm">
						You will use this name for this course session.
					</p>
					<div className="space-y-2 pt-3">
						<Label htmlFor="course-username">Username</Label>
						<Input
							id="course-username"
							value={username}
							onChange={(event) => setUsername(event.target.value)}
							placeholder="Type your username"
							disabled={sessionMutation.isPending}
						/>
					</div>
					<div className="flex justify-end gap-2 pt-4">
						<Button
							variant="outline"
							onClick={() => {
								setPendingQuizStart(null);
								setUsernameDialogOpen(false);
							}}
							disabled={sessionMutation.isPending}
						>
							Cancel
						</Button>
						<Button variant="accent" onClick={() => void confirmUsername()}>
							{sessionMutation.isPending ? "Saving..." : "Save username"}
						</Button>
					</div>
				</DialogContent>
			</Dialog>
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
						<Link href={getScopedCoursesPathFromPathname(pathname)}>
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
						<Loader2 className="text-primary size-16 animate-spin" />
					</motion.div>
				) : isError ? (
					<EmptyState
						title="Unable to load course"
						description="Please try again in a moment."
						icon={<MessageSquareText className="text-primary size-7" />}
						action={
							<Button variant="outline" size="sm" onClick={() => refetch()}>
								Retry
							</Button>
						}
					/>
				) : data.status === CourseStatus.SCHEDULED || data.status === CourseStatus.PAUSED ? (
					<section className="bg-card/40 border border-white/5 p-8 backdrop-blur-sm md:p-12">
						<div className="mb-8 flex items-center gap-6">
							<div className="bg-primary/10 shadow-primary/10 flex size-16 shrink-0 items-center justify-center rounded-xl shadow-inner md:size-20">
								<Image
									src="/icons/Idea/zarivka_idea_blue.svg"
									alt="Course icon"
									width={40}
									height={40}
									className="size-10 md:size-12"
								/>
							</div>
							<div>
								<h1 className="text-primary text-2xl font-bold md:text-3xl lg:text-4xl">
									{data.name}
								</h1>
								<p className="text-muted-foreground mt-2">
									{data.description || "Course details will be available when it goes live."}
								</p>
								{data.status === CourseStatus.SCHEDULED && data.scheduledStartAt && (
									<div className="text-muted-foreground mt-3 flex flex-wrap items-center gap-3 text-xs">
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
						<div className="bg-card/50 text-muted-foreground rounded-none border border-white/5 p-6">
							This course is currently {data.status}.
						</div>
					</section>
				) : (
					<section className="bg-card/40 border border-white/5 p-8 backdrop-blur-sm md:p-12">
						<div className="mb-8 flex items-center gap-6">
							<div className="bg-primary/10 shadow-primary/10 flex size-16 shrink-0 items-center justify-center rounded-xl shadow-inner md:size-20">
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
									<h1 className="text-primary text-2xl font-bold md:text-3xl lg:text-4xl">
										{data.name}
									</h1>
									{data.scheduledStartAt && (
										<span className="text-muted-foreground inline-flex items-center gap-2 text-xs">
											<CalendarClock className="size-3.5" />
											Starts {formatCourseTime(data.scheduledStartAt)}
										</span>
									)}
								</div>
							</div>
						</div>

						{sessionMutation.isPending && (
							<div className="border-primary/20 bg-primary/5 text-muted-foreground mb-6 rounded-none border px-4 py-3 text-sm">
								Preparing your course session...
							</div>
						)}

						{autoJoinFailed && (
							<div className="border-destructive/20 bg-destructive/5 mb-6 flex flex-wrap items-center justify-between gap-3 rounded-none border px-4 py-3 text-sm">
								<p className="text-muted-foreground">
									We could not start your session. Some live actions may not work.
								</p>
								<Button
									variant="outline"
									size="sm"
									onClick={() => startSession()}
									disabled={sessionMutation.isPending}
								>
									Retry session
								</Button>
							</div>
						)}

						<div className="border-t border-white/5 pt-8">
							<h2 className="text-foreground mb-4 text-lg font-semibold">About this course</h2>
							<p className="text-muted-foreground max-w-2xl leading-relaxed">
								{data.description || <span className="italic">No description available</span>}
							</p>
						</div>

						<div className="mt-8 border-t border-white/5 pt-8">
							<div className="mb-4 flex items-center gap-3">
								<Award className="text-primary size-5" />
								<h2 className="text-foreground text-lg font-semibold">Certificate</h2>
							</div>
							<div className="bg-card/30 rounded-none border border-white/5 p-4">
								<div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
									<span className="text-muted-foreground">Session name:</span>
									<span className="text-foreground font-medium">
										{usernameLocked ? username : "Not set"}
									</span>
								</div>
								<div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
									<ShieldCheck className="text-primary size-4" />
									<span className="text-muted-foreground">
										Points: {progressQuery.data?.points ?? 0}/{progressQuery.data?.threshold ?? 10}
									</span>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => certificateMutation.mutate()}
									disabled={!progressQuery.data?.eligible || certificateMutation.isPending}
									className="text-muted-foreground hover:border-primary/30 hover:text-primary border-white/10"
								>
									<Download className="size-3.5" />
									{certificateMutation.isPending ? "Generating..." : "Download Certificate"}
								</Button>
							</div>
						</div>

						<div className="mt-8">
							<div className="mb-6 flex items-center gap-3">
								<BookOpen className="text-primary size-5" />
								<h2 className="text-foreground text-lg font-semibold">Course Feed</h2>
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

						<div className="mt-8 border-t border-white/5 pt-8">
							<div className="mb-6 flex items-center gap-3">
								<BookOpen className="text-primary size-5" />
								<h2 className="text-foreground text-lg font-semibold">Modules</h2>
							</div>
							<LiveModules
								modules={data.modules ?? []}
								courseId={uuid}
								onEnsureUsername={async (startQuiz) => {
									if (await ensureUsernameBeforeQuiz()) {
										startQuiz();
										return;
									}
									setPendingQuizStart(() => startQuiz);
								}}
							/>
						</div>
					</section>
				)}
			</main>
		</div>
	);
}

function LiveModules({
	modules,
	courseId,
	onEnsureUsername,
}: {
	modules: Module[];
	courseId: string;
	onEnsureUsername: (startQuiz: () => void) => void | Promise<void>;
}) {
	if (modules.length === 0) {
		return (
			<EmptyState
				title="No modules revealed yet"
				description="Your lecturer will reveal modules one by one during the session."
				icon={<BookOpen className="text-primary size-7" />}
			/>
		);
	}

	return (
		<div className="space-y-4">
			{modules.map((module) => (
				<div key={module.uuid} className="bg-card/30 rounded-none border border-white/5 p-4">
					<h3 className="text-foreground text-base font-semibold">{module.title}</h3>
					{module.description && (
						<p className="text-muted-foreground mt-1 text-sm">{module.description}</p>
					)}

					<div className="mt-4 space-y-4">
						<div>
							<p className="text-foreground mb-2 text-sm font-semibold">Materials</p>
							{(module.materials?.length ?? 0) === 0 ? (
								<p className="text-muted-foreground text-xs italic">No materials in this module.</p>
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
							<p className="text-foreground mb-2 text-sm font-semibold">Quizzes</p>
							{(module.quizzes?.length ?? 0) === 0 ? (
								<p className="text-muted-foreground text-xs italic">No quizzes in this module.</p>
							) : (
								<div className="space-y-3">
									{(module.quizzes ?? []).map((quiz) => (
										<CourseQuizCard
											key={quiz.uuid ?? quiz.title}
											quiz={quiz}
											courseId={courseId}
											moduleId={module.uuid}
											onSaveResult={() => {}}
											onEnsureUsername={async () => {
												let allowed = false;
												await onEnsureUsername(() => {
													allowed = true;
												});
												return allowed;
											}}
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

function ModuleMaterialRow({ material, courseId }: { material: Material; courseId: string }) {
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
			<div className="bg-background/20 hover:border-primary/30 grid grid-cols-1 gap-2 rounded-none border border-white/5 p-3 text-sm transition-colors sm:grid-cols-[auto_1fr_auto] sm:items-start sm:gap-3">
				<div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
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
						<Icon className="text-primary size-5" />
					)}
				</div>
				<div className="min-w-0">
					<p className="text-foreground font-medium wrap-break-word">{material.name}</p>
					{material.description && (
						<p className="text-muted-foreground mt-0.5 text-xs wrap-break-word whitespace-pre-wrap">
							{material.description}
						</p>
					)}
					<p className="text-muted-foreground mt-1 text-xs break-all">{material.url}</p>
				</div>
				<Button
					variant="outline"
					size="sm"
					className="text-muted-foreground hover:border-primary/30 hover:text-primary gap-1.5 justify-self-start border-white/10 sm:justify-self-end"
					onClick={() => handleInteraction(material.url)}
				>
					<ExternalLink className="size-3.5" />
					Visit Site
				</Button>
			</div>
		);
	}

	return (
		<div className="bg-background/20 hover:border-primary/30 grid grid-cols-1 gap-2 rounded-none border border-white/5 p-3 text-sm transition-colors sm:grid-cols-[auto_1fr_auto] sm:items-start sm:gap-3">
			<div className="bg-primary/10 flex size-10 shrink-0 items-center justify-center rounded-lg">
				<Icon className="text-primary size-5" />
			</div>
			<div className="min-w-0">
				<p className="text-foreground font-medium wrap-break-word">{material.name}</p>
				{material.description && (
					<p className="text-muted-foreground mt-0.5 text-xs wrap-break-word whitespace-pre-wrap">
						{material.description}
					</p>
				)}
				<p className="text-muted-foreground mt-1 text-xs wrap-break-word">
					{getFileTypeLabel(material.mimeType)}
					{material.sizeBytes ? ` • ${formatFileSize(material.sizeBytes)}` : ""}
				</p>
			</div>
			<Button
				variant="outline"
				size="sm"
				className="text-muted-foreground hover:border-primary/30 hover:text-primary gap-1.5 justify-self-start border-white/10 sm:justify-self-end"
				onClick={() => handleInteraction(material.fileUrl)}
			>
				<Download className="size-3.5" />
				Download
			</Button>
		</div>
	);
}
