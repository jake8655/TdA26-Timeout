import {
	File,
	FileAudio,
	FileImage,
	FileText,
	FileVideo,
	Link,
	type LucideIcon,
} from "lucide-react";

import type { FileMaterial, UrlMaterial } from "@/api-client/types.gen";

export type Material = FileMaterial | UrlMaterial;

export const SUPPORTED_FILE_TYPES = {
	documents: [".pdf", ".docx", ".txt"],
	images: [".png", ".jpg", ".jpeg", ".gif"],
	videos: [".mp4"],
	audio: [".mp3"],
} as const;

export const SUPPORTED_MIME_TYPES = {
	"application/pdf": "PDF Document",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word Document",
	"text/plain": "Text File",
	"image/png": "PNG Image",
	"image/jpeg": "JPEG Image",
	"image/gif": "GIF Image",
	"video/mp4": "MP4 Video",
	"audio/mpeg": "MP3 Audio",
} as const;

export const ACCEPTED_FILE_TYPES = [
	"application/pdf",
	"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
	"text/plain",
	"image/png",
	"image/jpeg",
	"image/gif",
	"video/mp4",
	"audio/mpeg",
].join(",");

export const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30 MB

export function formatFileSize(bytes: number): string {
	if (bytes === 0) return "0 B";

	const units = ["B", "KB", "MB", "GB"];
	const k = 1024;
	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${units[i]}`;
}

export function getMaterialIcon(material: FileMaterial | UrlMaterial): LucideIcon {
	if (material.type === "url") {
		return Link;
	}

	const mimeType = material.mimeType;
	if (!mimeType) return File;

	if (mimeType.startsWith("image/")) return FileImage;
	if (mimeType.startsWith("video/")) return FileVideo;
	if (mimeType.startsWith("audio/")) return FileAudio;
	if (mimeType.includes("pdf") || mimeType.includes("document")) return FileText;

	return File;
}

export function getFileTypeLabel(mimeType: string | undefined): string {
	if (!mimeType) return "File";

	return SUPPORTED_MIME_TYPES[mimeType as keyof typeof SUPPORTED_MIME_TYPES] || "File";
}

export function isValidFileType(file: File): boolean {
	return Object.keys(SUPPORTED_MIME_TYPES).includes(file.type);
}

export function isValidFileSize(file: File): boolean {
	return file.size <= MAX_FILE_SIZE;
}

export function getFileExtension(filename: string): string {
	const parts = filename.split(".");
	return parts.length > 1 ? `.${parts.pop()?.toLowerCase()}` : "";
}
