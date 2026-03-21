import { format, isValid, parse } from "date-fns";
import { formatInTimeZone, fromZonedTime } from "date-fns-tz";

export const COURSE_TIMEZONE = "Europe/Bratislava";

export function formatCourseTime(value: string, timeZone: string = COURSE_TIMEZONE) {
	if (!value) return value;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return formatInTimeZone(date, timeZone, "EEE, MMM d, HH:mm");
}

export function toLocalInput(value: string, timeZone: string = COURSE_TIMEZONE) {
	if (!value) return value;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return formatInTimeZone(date, timeZone, "yyyy-MM-dd'T'HH:mm");
}

export function mergeDateTime(date: Date, time: string) {
	const [hours, minutes] = time.split(":").map(Number) as [number, number];
	if (Number.isNaN(hours) || Number.isNaN(minutes)) {
		return "";
	}
	const merged = new Date(date);
	merged.setHours(hours, minutes, 0, 0);
	return format(merged, "yyyy-MM-dd'T'HH:mm");
}

export function toUtcDate(value: string, timeZone: string = COURSE_TIMEZONE) {
	if (!value) return null;
	const parsed = parse(value, "yyyy-MM-dd'T'HH:mm", new Date());
	if (!isValid(parsed)) return null;
	return fromZonedTime(parsed, timeZone);
}

export function toUtcIso(value: string, timeZone: string = COURSE_TIMEZONE) {
	const utcDate = toUtcDate(value, timeZone);
	if (!utcDate) return value;
	return utcDate.toISOString();
}
