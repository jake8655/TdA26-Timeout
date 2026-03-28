"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, HelpCircle, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { notFound, useParams, useRouter } from "next/navigation";

import {
	deleteCoursesByCourseIdMutation,
	getCoursesLecturerByCourseIdOptions,
	postCoursesByCourseIdArchiveMutation,
	postCoursesByCourseIdDuplicateMutation,
	postCoursesByCourseIdPauseMutation,
	postCoursesByCourseIdStartMutation,
	putCoursesByCourseIdStatusMutation,
} from "@/api-client/@tanstack/react-query.gen";
import { CourseStatus } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import BackgroundGrid from "@/components/background-grid";
import { CourseActions } from "@/components/courses/course-actions";
import { CourseFeed } from "@/components/courses/course-feed";
import { CourseHeader } from "@/components/courses/course-header";
import { CourseModulesSection } from "@/components/courses/course-modules-section";
import { CourseStatsSection } from "@/components/courses/course-stats-section";
import { DeleteFeedPostButton } from "@/components/courses/delete-feed-post-dialog";
import {
	CreateFeedPostButton,
	EditFeedPostButton,
} from "@/components/courses/feed-post-form-dialog";
import CoursePortabilityCard from "@/components/dashboard/course-portability-card";
import EmptyState from "@/components/empty-state";
import LoadingPlaceholder from "@/components/loading-placeholder";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { getCoursePath, getDashboardPath, getManageCoursePath } from "@/lib/tenant-routing";

export default function DashboardCourseClient() {
	const { uuid } = useParams<{ uuid: string }>();

	const { data: authData } = useRequireAuth();
	const router = useRouter();
	const queryClient = useQueryClient();

	const {
		data: course,
		isPending: courseLoading,
		isError: courseError,
		refetch: refetchCourse,
	} = useQuery({
		...getCoursesLecturerByCourseIdOptions({
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
		onSuccess: (data) => {
			if (data?.uuid) {
				router.push(getManageCoursePath(authData, data.uuid));
			}
		},
	});
	const deleteMutation = useMutation({
		...deleteCoursesByCourseIdMutation(),
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
						<Link href={getDashboardPath(authData)}>
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
						<Loader2 className="text-primary size-16 animate-spin" />
					</motion.div>
				) : courseError ? (
					<EmptyState
						title="Unable to load course"
						description="Please try again in a moment."
						icon={<HelpCircle className="text-primary size-7" />}
						action={
							<Button variant="outline" size="sm" onClick={() => refetchCourse()}>
								Retry
							</Button>
						}
					/>
				) : course ? (
					<>
						<div className="bg-card/40 space-y-4 border border-white/5 p-6 backdrop-blur-sm">
							<CourseHeader course={course} />
							<CourseActions
								course={course}
								sharePath={getCoursePath(authData, uuid)}
								duplicatePending={duplicateMutation.isPending}
								deletePending={deleteMutation.isPending}
								onSchedule={(payload) =>
									statusMutation.mutate({
										path: { courseId: uuid },
										body: {
											status: "scheduled",
											scheduledStartAt: payload.scheduledStartAt,
										},
									})
								}
								onStart={() =>
									startMutation.mutate({
										path: { courseId: uuid },
										body: {},
									})
								}
								onPause={() =>
									kickMutation.mutate({
										path: { courseId: uuid },
										body: {},
									})
								}
								onArchive={() =>
									archiveMutation.mutate({
										path: { courseId: uuid },
									})
								}
								onMoveToDraft={() =>
									statusMutation.mutate({
										path: { courseId: uuid },
										body: { status: "draft" },
									})
								}
								onDuplicate={(name) =>
									duplicateMutation.mutate({
										path: { courseId: uuid },
										body: { name },
									})
								}
								onDelete={() => {
									deleteMutation.mutate({
										path: { courseId: uuid },
										// @ts-expect-error server requires a JSON body
										body: {},
									});
									// This is very cursed, do NOT do this or repeat this pattern
									// It should be done in the onSuccess callback of the mutation, but all queries are invalidated (and the invalidation is awaited) on every mutation which causes the current (deleted) course's data to be refetched but it does not exist anymore so it throws an error
									router.push(getDashboardPath(authData));
								}}
							/>
						</div>

						<CourseStatsSection courseId={uuid} isLive={course.status === CourseStatus.LIVE} />

						<CoursePortabilityCard courseId={uuid} />

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
							className="flex items-center justify-between"
						>
							<h2 className="text-foreground text-xl font-semibold">Course Feed</h2>
							<CreateFeedPostButton
								courseId={uuid}
								disabled={course.status !== CourseStatus.LIVE}
							/>
						</motion.div>

						<CourseFeed
							courseId={uuid}
							showActions
							isLecturer
							editTrigger={(item) => <EditFeedPostButton post={item} courseId={uuid} />}
							deleteTrigger={(item) => <DeleteFeedPostButton post={item} courseId={uuid} />}
							onKick={() => queryClient.invalidateQueries()}
							onModuleReveal={() => queryClient.invalidateQueries()}
							onModuleHidden={() => queryClient.invalidateQueries()}
						/>

						<CourseModulesSection
							courseId={uuid}
							courseStatus={course.status ?? CourseStatus.DRAFT}
						/>
					</>
				) : null}
			</div>
		</section>
	);
}
