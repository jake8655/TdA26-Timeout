"use client";

import { Clock2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	InputGroup,
	InputGroupAddon,
	InputGroupInput,
} from "@/components/ui/input-group";
import {
	COURSE_TIMEZONE,
	mergeDateTime,
	toLocalInput,
	toUtcIso,
} from "@/lib/course-date-utils";

function formatTimeInput(date: Date) {
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	return `${hours}:${minutes}`;
}

function addMinutes(date: Date, minutes: number) {
	return new Date(date.getTime() + minutes * 60000);
}

export function CourseScheduleDialog({
	trigger,
	title,
	description,
	mode = "schedule",
	initialStartAt,
	initialEndAt,
	confirmLabel,
	onConfirm,
}: {
	trigger: React.ReactElement;
	title: string;
	description: string;
	mode?: "schedule" | "start";
	initialStartAt?: string;
	initialEndAt?: string;
	confirmLabel: string;
	onConfirm: (payload: {
		scheduledStartAt?: string;
		scheduledEndAt: string;
	}) => void;
}) {
	const [open, setOpen] = useState(false);
	const [startDate, setStartDate] = useState<Date | undefined>(undefined);
	const [endDate, setEndDate] = useState<Date | undefined>(undefined);
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const showStart = mode === "schedule";

	useEffect(() => {
		if (!open) return;

		const now = new Date();
		now.setSeconds(0, 0);
		const defaultStart = addMinutes(now, 5);
		const defaultEnd = addMinutes(defaultStart, 60);
		const defaultLiveEnd = addMinutes(now, 60);
		const resolvedStart = initialStartAt
			? new Date(initialStartAt)
			: defaultStart;
		const resolvedEnd = initialEndAt
			? new Date(initialEndAt)
			: showStart
				? defaultEnd
				: defaultLiveEnd;

		setStartDate(showStart ? resolvedStart : undefined);
		setEndDate(resolvedEnd);
		setStartTime(
			showStart
				? initialStartAt
					? (toLocalInput(initialStartAt).split("T")[1] ?? "")
					: formatTimeInput(resolvedStart)
				: "",
		);
		setEndTime(
			initialEndAt
				? (toLocalInput(initialEndAt).split("T")[1] ?? "")
				: formatTimeInput(resolvedEnd),
		);
	}, [open, initialStartAt, initialEndAt, showStart]);

	const scheduleStartAt = useMemo(
		() =>
			showStart
				? toUtcIso(
						startDate && startTime ? mergeDateTime(startDate, startTime) : "",
					)
				: "",
		[startDate, startTime, showStart],
	);
	const scheduleEndAt = useMemo(
		() => toUtcIso(endDate && endTime ? mergeDateTime(endDate, endTime) : ""),
		[endDate, endTime],
	);
	const canSubmit = showStart
		? Boolean(scheduleStartAt && scheduleEndAt)
		: Boolean(scheduleEndAt);

	useEffect(() => {
		if (!showStart || !startDate || !endDate || !startTime || !endTime) return;
		const startIso = mergeDateTime(startDate, startTime);
		const endIso = mergeDateTime(endDate, endTime);
		const startUtc = toUtcIso(startIso);
		const endUtc = toUtcIso(endIso);
		const start = startUtc ? new Date(startUtc) : null;
		const end = endUtc ? new Date(endUtc) : null;
		if (
			!start ||
			!end ||
			Number.isNaN(start.getTime()) ||
			Number.isNaN(end.getTime())
		) {
			return;
		}
		if (end < start) {
			const nextEnd = addMinutes(start, 60);
			setEndDate(nextEnd);
			setEndTime(formatTimeInput(nextEnd));
		}
	}, [startDate, startTime, endDate, endTime, showStart]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={trigger} />
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>
						{description} ({COURSE_TIMEZONE} timezone).
					</DialogDescription>
				</DialogHeader>
				<div className={showStart ? "grid gap-4 sm:grid-cols-2" : "space-y-4"}>
					{showStart && (
						<div className="space-y-2">
							<p className="font-semibold text-foreground text-sm">Start</p>
							<Calendar
								mode="single"
								selected={startDate}
								onSelect={setStartDate}
								className="w-full rounded-none border border-white/10 bg-white/5"
								weekStartsOn={1}
								startMonth={new Date()}
								fixedWeeks
							/>
							<InputGroup>
								<InputGroupInput
									type="time"
									value={startTime}
									onChange={(event) => setStartTime(event.target.value)}
									className="h-10"
								/>
								<InputGroupAddon>
									<Clock2 className="text-muted-foreground" />
								</InputGroupAddon>
							</InputGroup>
						</div>
					)}
					<div className="space-y-2">
						<p className="font-semibold text-foreground text-sm">End</p>
						<Calendar
							mode="single"
							selected={endDate}
							onSelect={setEndDate}
							className="w-full rounded-none border border-white/10 bg-white/5"
							weekStartsOn={1}
							startMonth={new Date()}
							fixedWeeks
						/>
						<InputGroup>
							<InputGroupInput
								type="time"
								value={endTime}
								onChange={(event) => setEndTime(event.target.value)}
								className="h-10"
							/>
							<InputGroupAddon>
								<Clock2 className="text-muted-foreground" />
							</InputGroupAddon>
						</InputGroup>
					</div>
				</div>
				<DialogFooter>
					<Button
						variant="accent"
						onClick={() => {
							if (!scheduleEndAt) return;
							onConfirm({
								scheduledStartAt:
									showStart && scheduleStartAt ? scheduleStartAt : undefined,
								scheduledEndAt: scheduleEndAt,
							});
							setOpen(false);
						}}
						disabled={!canSubmit}
					>
						{confirmLabel}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
