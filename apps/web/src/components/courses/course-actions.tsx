"use client";

import {
	Archive,
	CalendarClock,
	Copy,
	Edit2,
	Loader2,
	PauseCircle,
	Play,
	Share2,
	Trash2,
} from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
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
	sharePath,
	duplicatePending = false,
	deletePending = false,
}: {
	course: CourseDetail;
	onSchedule: (payload: { scheduledStartAt: string }) => void;
	onStart: () => void;
	onPause: () => void;
	onArchive: () => void;
	onMoveToDraft: () => void;
	onDuplicate: (name: string) => void;
	onDelete: () => void;
	sharePath: string;
	duplicatePending?: boolean;
	deletePending?: boolean;
}) {
	const [duplicateName, setDuplicateName] = useState(`${course.name} Copy`);
	const [deleteConfirm, setDeleteConfirm] = useState("");
	const [copied, setCopied] = useState(false);
	const isDuplicatePending = duplicatePending;
	const isDeletePending = deletePending;
	const shareUrl =
		typeof window === "undefined"
			? sharePath
			: new URL(sharePath, window.location.origin).toString();
	const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=512x512&data=${encodeURIComponent(shareUrl)}`;

	useEffect(() => {
		setDuplicateName(`${course.name} Copy`);
		setDeleteConfirm("");
	}, [course.name]);

	useEffect(() => {
		if (!copied) {
			return;
		}

		const timeout = setTimeout(() => setCopied(false), 1800);
		return () => clearTimeout(timeout);
	}, [copied]);

	const canSchedule = courseStatusActions(
		course.status ?? CourseStatus.DRAFT,
		CourseAction.SCHEDULE,
	);
	const canStart = courseStatusActions(course.status ?? CourseStatus.DRAFT, CourseAction.START);
	const canPause = courseStatusActions(course.status ?? CourseStatus.DRAFT, CourseAction.PAUSE);
	const canMoveToDraft = courseStatusActions(
		course.status ?? CourseStatus.DRAFT,
		CourseAction.MOVE_TO_DRAFT,
	);
	const canArchive = courseStatusActions(course.status ?? CourseStatus.DRAFT, CourseAction.ARCHIVE);

	return (
		<div className="space-y-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="flex flex-wrap items-center gap-2"
			>
				<CourseFormDialog
					mode="edit"
					course={course}
					trigger={
						<Button
							variant="outline"
							size="sm"
							className="gap-2"
							disabled={
								course.status !== CourseStatus.DRAFT || isDuplicatePending || isDeletePending
							}
						>
							<Edit2 className="size-4" />
							Edit
						</Button>
					}
				/>
				<Dialog>
					<DialogTrigger
						render={
							<Button
								variant="outline"
								size="sm"
								className="gap-2"
								disabled={isDeletePending || isDuplicatePending}
							>
								<Share2 className="size-4" />
								Share
							</Button>
						}
					/>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Share course</DialogTitle>
							<DialogDescription>Copy the link or let students scan the QR code.</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<button
								type="button"
								onClick={async () => {
									await navigator.clipboard.writeText(shareUrl);
									setCopied(true);
								}}
								className="border-input bg-background hover:bg-accent hover:text-accent-foreground text-foreground mx-auto flex h-9 w-56 items-center justify-center gap-2 border px-4 py-2 text-sm transition-colors"
							>
								<Copy className="size-3.5 shrink-0" />
								<span className="text-center">{copied ? "Copied" : "Copy course link"}</span>
							</button>
							<div className="mx-auto w-fit">
								<Image
									src={qrImageUrl}
									alt="Course share QR code"
									width={224}
									height={224}
									className="border border-white/10 p-1"
									unoptimized
								/>
							</div>
						</div>
						<DialogFooter>
							<DialogClose render={<Button variant="outline">Close</Button>} />
						</DialogFooter>
					</DialogContent>
				</Dialog>
				<Dialog>
					<DialogTrigger
						render={
							<Button
								variant="outline"
								size="sm"
								className="gap-2"
								disabled={isDuplicatePending || isDeletePending}
							>
								<Copy className="size-4" />
								Duplicate
							</Button>
						}
					/>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Duplicate course</DialogTitle>
							<DialogDescription>Create a new draft course based on this one.</DialogDescription>
						</DialogHeader>
						<div className="space-y-3">
							<Input
								value={duplicateName}
								onChange={(event) => setDuplicateName(event.target.value)}
								className="h-10"
								disabled={isDuplicatePending || isDeletePending}
							/>
						</div>
						<DialogFooter>
							<DialogClose
								render={
									<Button variant="outline" disabled={isDuplicatePending || isDeletePending}>
										Cancel
									</Button>
								}
							/>
							<Button
								variant="accent"
								onClick={() => onDuplicate(duplicateName)}
								disabled={!duplicateName || isDuplicatePending || isDeletePending}
							>
								{isDuplicatePending ? (
									<>
										<Loader2 className="size-4 animate-spin" />
										Duplicating
									</>
								) : (
									"Duplicate Course"
								)}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
				<Dialog>
					<DialogTrigger
						render={
							<Button
								variant="destructive"
								size="sm"
								className="gap-2"
								disabled={isDeletePending || isDuplicatePending}
							>
								<Trash2 className="size-4" />
								Delete
							</Button>
						}
					/>
					<DialogContent className="sm:max-w-md">
						<DialogHeader>
							<DialogTitle>Delete course</DialogTitle>
							<DialogDescription>This deletes the course and kicks all students.</DialogDescription>
						</DialogHeader>
						<div className="space-y-2">
							<p className="text-muted-foreground text-sm">
								Type "<b>{course.name}</b>" to confirm.
							</p>
							<Input
								value={deleteConfirm}
								onChange={(event) => setDeleteConfirm(event.target.value)}
								className="h-10"
								disabled={isDeletePending || isDuplicatePending}
							/>
						</div>
						<DialogFooter>
							<DialogClose
								render={
									<Button variant="outline" disabled={isDeletePending || isDuplicatePending}>
										Cancel
									</Button>
								}
							/>
							<Button
								variant="destructive"
								onClick={() => onDelete()}
								disabled={deleteConfirm !== course.name || isDeletePending || isDuplicatePending}
							>
								{isDeletePending ? (
									<>
										<Loader2 className="size-4 animate-spin" />
										Deleting
									</>
								) : (
									"Delete permanently"
								)}
							</Button>
						</DialogFooter>
					</DialogContent>
				</Dialog>
			</motion.div>
			{canSchedule || canStart || canPause || canMoveToDraft || canArchive ? (
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="bg-card/50 space-y-3 rounded-none border border-white/5 p-4"
				>
					<p className="text-muted-foreground text-xs tracking-[0.2em] uppercase">Course Actions</p>
					<div className="grid gap-2 sm:grid-cols-3">
						{canSchedule && (
							<CourseScheduleDialog
								title="Schedule course"
								description="Pick when the course should go live"
								initialStartAt={course.scheduledStartAt}
								confirmLabel="Schedule"
								onConfirm={(payload) => {
									if (payload.scheduledStartAt) {
										onSchedule({
											scheduledStartAt: payload.scheduledStartAt,
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
							<Button variant="accent" className="justify-start gap-2" onClick={() => onStart()}>
								<Play className="size-4" />
								Go Live Now
							</Button>
						)}
						{canPause && (
							<Button variant="outline" className="justify-start gap-2" onClick={() => onPause()}>
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
							<Button variant="outline" className="justify-start gap-2" onClick={() => onArchive()}>
								<Archive className="size-4" />
								Archive Course
							</Button>
						)}
					</div>
				</motion.div>
			) : null}
		</div>
	);
}
