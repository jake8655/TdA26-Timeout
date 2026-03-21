"use client";

import { Clock2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

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
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { COURSE_TIMEZONE, mergeDateTime, toLocalInput, toUtcIso } from "@/lib/course-date-utils";

function formatTimeInput(date: Date) {
	const hours = String(date.getHours()).padStart(2, "0");
	const minutes = String(date.getMinutes()).padStart(2, "0");
	return `${hours}:${minutes}`;
}

function addMinutes(date: Date, minutes: number) {
	return new Date(date.getTime() + minutes * 60000);
}

function isPastDate(date: Date) {
	const startOfToday = new Date();
	startOfToday.setHours(0, 0, 0, 0);
	const candidate = new Date(date);
	candidate.setHours(0, 0, 0, 0);
	return candidate < startOfToday;
}

export function CourseScheduleDialog({
	trigger,
	title,
	description,
	mode = "schedule",
	initialStartAt,
	confirmLabel,
	onConfirm,
}: {
	trigger: React.ReactElement;
	title: string;
	description: string;
	mode?: "schedule" | "start";
	initialStartAt?: string;
	confirmLabel: string;
	onConfirm: (payload: { scheduledStartAt?: string }) => void;
}) {
	const [open, setOpen] = useState(false);
	const [startDate, setStartDate] = useState<Date | undefined>(undefined);
	const [startTime, setStartTime] = useState("");
	const showStart = mode === "schedule";

	useEffect(() => {
		if (!open) return;

		const now = new Date();
		now.setSeconds(0, 0);
		const defaultStart = addMinutes(now, showStart ? 5 : 0);
		const resolvedStart = initialStartAt ? new Date(initialStartAt) : defaultStart;

		setStartDate(showStart ? resolvedStart : undefined);
		setStartTime(
			showStart
				? initialStartAt
					? (toLocalInput(initialStartAt).split("T")[1] ?? "")
					: formatTimeInput(resolvedStart)
				: "",
		);
	}, [open, initialStartAt, showStart]);

	const scheduleStartAt = showStart
		? toUtcIso(startDate && startTime ? mergeDateTime(startDate, startTime) : "")
		: "";

	const canSubmit = showStart ? Boolean(scheduleStartAt) : true;

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={trigger} />
			<DialogContent className="max-h-[90vh] overflow-y-auto sm:w-auto sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>{title}</DialogTitle>
					<DialogDescription>
						{description} ({COURSE_TIMEZONE} timezone).
					</DialogDescription>
				</DialogHeader>
				<div className={showStart ? "space-y-4" : "space-y-0"}>
					{showStart && (
						<div className="space-y-2">
							<p className="text-foreground text-sm font-semibold">Start</p>
							<Calendar
								mode="single"
								selected={startDate}
								onSelect={setStartDate}
								className="w-full rounded-none border border-white/10 bg-white/5"
								weekStartsOn={1}
								startMonth={new Date()}
								disabled={isPastDate}
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
				</div>
				<DialogFooter>
					<Button
						variant="accent"
						onClick={() => {
							const now = new Date();
							const start = scheduleStartAt ? new Date(scheduleStartAt) : null;
							if (showStart && start && start < now) {
								toast.error("Please select a valid date and time.");
								return;
							}

							onConfirm({
								scheduledStartAt: showStart ? scheduleStartAt || undefined : undefined,
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
