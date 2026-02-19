"use client";

import {
	Archive,
	CalendarClock,
	Copy,
	Edit2,
	PauseCircle,
	Play,
	Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { CourseDetail } from "@/api-client/types.gen";
import { CourseStatus } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { CourseScheduleDialog } from "@/components/courses/course-schedule-dialog";
import { CourseFormDialog } from "@/components/dashboard/course-form-dialog";
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
import { Input } from "@/components/ui/input";
import { CourseAction, courseStatusActions } from "@/lib/utils";

export function CourseActions({
	course,
	onSchedule,
	onStart,
	onPause,
	onArchive,
	onMoveToDraft,
	onDuplicate,
	onDelete,
}: {
	course: CourseDetail;
	onSchedule: (payload: {
		scheduledStartAt: string;
		scheduledEndAt: string;
	}) => void;
	onStart: (endAt: string) => void;
	onPause: () => void;
	onArchive: () => void;
	onMoveToDraft: () => void;
	onDuplicate: (name: string) => void;
	onDelete: () => void;
}) {
	const [duplicateName, setDuplicateName] = useState(`${course.name} Copy`);
	const [deleteConfirm, setDeleteConfirm] = useState("");

	useEffect(() => {
		setDuplicateName(`${course.name} Copy`);
		setDeleteConfirm("");
	}, [course.name]);

	const canSchedule = courseStatusActions(
		course.status ?? CourseStatus.DRAFT,
		CourseAction.SCHEDULE,
	);
	const canStart = courseStatusActions(
		course.status ?? CourseStatus.DRAFT,
		CourseAction.START,
	);
	const canPause = courseStatusActions(
		course.status ?? CourseStatus.DRAFT,
		CourseAction.PAUSE,
	);
	const canMoveToDraft = courseStatusActions(
		course.status ?? CourseStatus.DRAFT,
		CourseAction.MOVE_TO_DRAFT,
	);
	const canArchive = courseStatusActions(
		course.status ?? CourseStatus.DRAFT,
		CourseAction.ARCHIVE,
	);

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-2">
				<CourseFormDialog
					mode="edit"
					course={course}
					trigger={
						<Button
							variant="outline"
							size="sm"
							className="gap-2"
							disabled={course.status !== CourseStatus.DRAFT}
						>
							<Edit2 className="size-4" />
							Edit
						</Button>
					}
				/>
				<Dialog>
					<DialogTrigger
						render={
							<Button variant="outline" size="sm" className="gap-2">
								<Copy className="size-4" />
								Duplicate
							</Button>
						}
					/>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Duplicate course</DialogTitle>
							<DialogDescription>
								Create a new draft course based on this one.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-3">
							<Input
								value={duplicateName}
								onChange={(event) => setDuplicateName(event.target.value)}
								className="h-10"
							/>
						</div>
						<DialogFooter>
							<DialogClose render={<Button variant="outline">Cancel</Button>} />
							<Button
								variant="accent"
								onClick={() => onDuplicate(duplicateName)}
								disabled={!duplicateName}
							>
								Duplicate Course
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
				<Dialog>
					<DialogTrigger
						render={
							<Button variant="destructive" size="sm" className="gap-2">
								<Trash2 className="size-4" />
								Delete
							</Button>
						}
					/>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Delete course</DialogTitle>
							<DialogDescription>
								This deletes the course and kicks all students.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-2">
							<p className="text-muted-foreground text-sm">
								Type "<b>{course.name}</b>" to confirm.
							</p>
							<Input
								value={deleteConfirm}
								onChange={(event) => setDeleteConfirm(event.target.value)}
								className="h-10"
							/>
						</div>
						<DialogFooter>
							<DialogClose render={<Button variant="outline">Cancel</Button>} />
							<Button
								variant="destructive"
								onClick={() => onDelete()}
								disabled={deleteConfirm !== course.name}
							>
								Delete permanently
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</div>
			{canSchedule || canStart || canPause || canMoveToDraft || canArchive ? (
				<div className="space-y-3 rounded-none border border-white/5 bg-card/50 p-4">
					<p className="text-muted-foreground text-xs uppercase tracking-[0.2em]">
						Course Actions
					</p>
					<div className="grid gap-2 sm:grid-cols-3">
						{canSchedule && (
							<CourseScheduleDialog
								title="Schedule course"
								description="Pick start and end times"
								initialStartAt={course.scheduledStartAt}
								initialEndAt={course.scheduledEndAt}
								confirmLabel="Schedule"
								onConfirm={(payload) => {
									if (payload.scheduledStartAt) {
										onSchedule({
											scheduledStartAt: payload.scheduledStartAt,
											scheduledEndAt: payload.scheduledEndAt,
										});
									}
								}}
								trigger={
									<Button variant="outline" className="justify-start gap-2">
										<CalendarClock className="size-4" />
										Schedule Course
									</Button>
								}
							/>
						)}
						{canStart && (
							<CourseScheduleDialog
								mode="start"
								title="Start the course"
								description="Set the end time before going live"
								initialEndAt={course.scheduledEndAt}
								confirmLabel="Start Now"
								onConfirm={(payload) => onStart(payload.scheduledEndAt)}
								trigger={
									<Button variant="accent" className="justify-start gap-2">
										<Play className="size-4" />
										Go Live Now
									</Button>
								}
							/>
						)}
						{canPause && (
							<Button
								variant="outline"
								className="justify-start gap-2"
								onClick={() => onPause()}
							>
								<PauseCircle className="size-4" />
								Pause Course
							</Button>
						)}
						{canMoveToDraft && (
							<Button
								variant="outline"
								className="justify-start gap-2"
								onClick={() => onMoveToDraft()}
							>
								<Copy className="size-4" />
								Move to Draft
							</Button>
						)}
						{canArchive && (
							<Button
								variant="outline"
								className="justify-start gap-2"
								onClick={() => onArchive()}
							>
								<Archive className="size-4" />
								Archive Course
							</Button>
						)}
					</div>
				</div>
			) : null}
		</div>
	);
}
