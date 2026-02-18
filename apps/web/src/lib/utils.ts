import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CourseStatus } from "@/api-client";

export const CourseAction = {
	SCHEDULE: "schedule",
	START: "start",
	PAUSE: "pause",
	MOVE_TO_DRAFT: "move_to_draft",
	ARCHIVE: "archive",
} as const;

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

function makeArray(array: Array<unknown>) {
	return array as Array<unknown>;
}

export function courseStatusActions(
	status: CourseStatus,
	action: (typeof CourseAction)[keyof typeof CourseAction],
) {
	switch (status) {
		case CourseStatus.DRAFT:
			return makeArray([CourseAction.SCHEDULE, CourseAction.START]).includes(
				action,
			);

		case CourseStatus.SCHEDULED:
			return makeArray([
				CourseAction.START,
				CourseAction.MOVE_TO_DRAFT,
			]).includes(action);

		case CourseStatus.PAUSED:
			return makeArray([
				CourseAction.SCHEDULE,
				CourseAction.START,
				CourseAction.ARCHIVE,
			]).includes(action);

		case CourseStatus.LIVE:
			return makeArray([CourseAction.PAUSE, CourseAction.ARCHIVE]).includes(
				action,
			);

		case CourseStatus.ARCHIVED:
			return false;

		default:
			return false;
	}
}
