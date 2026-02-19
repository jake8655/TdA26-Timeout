"use client";

import {
	Download,
	Edit2,
	ExternalLink,
	Loader2,
	Plus,
	Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import type { CourseDetail } from "@/api-client/types.gen";
import { CourseStatus } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { DeleteMaterialDialog } from "@/components/dashboard/delete-material-dialog";
import { MaterialFormDialog } from "@/components/dashboard/material-form-dialog";
import EmptyState from "@/components/empty-state";
import type { Material } from "@/lib/material-utils";
import {
	formatFileSize,
	getFileTypeLabel,
	getMaterialIcon,
} from "@/lib/material-utils";

export function CourseMaterialsSection({
	course,
	materials,
	loading,
	error,
	onRetry,
}: {
	course: CourseDetail;
	materials: Material[] | undefined;
	loading: boolean;
	error: boolean;
	onRetry: () => void;
}) {
	return (
		<div className="space-y-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.1 }}
				className="flex items-center justify-between"
			>
				<h2 className="font-semibold text-foreground text-xl">
					Course Materials
				</h2>
				<MaterialFormDialog
					mode="add"
					courseId={course.uuid}
					trigger={
						<Button
							variant="accent"
							size="sm"
							disabled={course.status !== CourseStatus.DRAFT}
						>
							<Plus />
							Add Material
						</Button>
					}
				/>
			</motion.div>

			{loading ? (
				<div className="flex justify-center py-12">
					<Loader2 className="size-8 animate-spin text-primary" />
				</div>
			) : error ? (
				<EmptyState
					title="Unable to load materials"
					description="Please try again in a moment."
					icon={<Download className="size-7 text-primary" />}
					action={
						<Button variant="outline" size="sm" onClick={onRetry}>
							Retry
						</Button>
					}
				/>
			) : !materials || materials.length === 0 ? (
				<EmptyState
					title="No materials yet"
					description="Add files or links for your students."
					icon={<Plus className="size-7 text-primary" />}
					action={
						<MaterialFormDialog
							mode="add"
							courseId={course.uuid}
							trigger={
								<Button
									variant="accent"
									size="sm"
									disabled={course.status !== CourseStatus.DRAFT}
								>
									<Plus />
									Add First Material
								</Button>
							}
						/>
					}
					className="border-dashed"
				/>
			) : (
				<div className="flex flex-col gap-3">
					<AnimatePresence mode="popLayout">
						{materials.map((material, index) => (
							<DashboardMaterialCard
								key={material.uuid}
								material={material}
								courseId={course.uuid}
								courseStatus={course.status ?? CourseStatus.DRAFT}
								index={index}
							/>
						))}
					</AnimatePresence>
				</div>
			)}
		</div>
	);
}

function DashboardMaterialCard({
	material,
	courseId,
	courseStatus,
	index,
}: {
	material: Material;
	courseId: string;
	courseStatus: CourseStatus;
	index: number;
}) {
	const Icon = getMaterialIcon(material);

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.95 }}
			transition={{ duration: 0.3, delay: index * 0.03 }}
			className="group flex items-start gap-4 rounded-none border border-white/5 bg-card/40 p-4 backdrop-blur-sm transition-colors duration-300 hover:border-white/10"
		>
			<div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
				{material.type === "url" && material.faviconUrl ? (
					<Image
						src={material.faviconUrl}
						alt={material.name}
						width={24}
						height={24}
						className="size-6"
						unoptimized
					/>
				) : (
					<Icon className="size-6 text-primary" />
				)}
			</div>

			<div className="flex-1 overflow-hidden">
				<h3 className="font-semibold text-foreground text-sm">
					{material.name}
				</h3>
				<p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
					{material.description || (
						<span className="italic">No description available</span>
					)}
				</p>
				<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-xs">
					{material.type === "url" ? (
						<span className="truncate">{new URL(material.url).hostname}</span>
					) : (
						<>
							<span>{getFileTypeLabel(material.mimeType)}</span>
							{material.sizeBytes && (
								<>
									<span className="text-white/20">•</span>
									<span>{formatFileSize(material.sizeBytes)}</span>
								</>
							)}
						</>
					)}
				</div>
			</div>

			<div className="flex flex-col items-end gap-2">
				{material.type === "url" ? (
					<Button
						variant="outline"
						size="sm"
						className="shrink-0 gap-1.5 border-white/10 text-muted-foreground hover:border-primary/30 hover:text-primary"
						asChild
					>
						<a href={material.url} target="_blank" rel="noopener noreferrer">
							<ExternalLink className="size-3.5" />
							<span className="hidden sm:inline">Visit Site</span>
						</a>
					</Button>
				) : (
					<Button
						variant="outline"
						size="sm"
						className="shrink-0 gap-1.5 border-white/10 text-muted-foreground hover:border-primary/30 hover:text-primary"
						asChild
					>
						<a
							href={material.fileUrl}
							target="_blank"
							rel="noopener noreferrer"
						>
							<Download className="size-3.5" />
							<span className="hidden sm:inline">Download</span>
						</a>
					</Button>
				)}

				<div className="flex gap-1 transition-opacity group-hover:opacity-100 lg:opacity-0">
					<MaterialFormDialog
						mode="edit"
						courseId={courseId}
						material={material}
						trigger={
							<Button
								variant="ghost"
								size="icon-sm"
								className="size-8 text-muted-foreground hover:text-primary dark:hover:bg-primary/10"
								aria-label="Edit material"
								disabled={courseStatus !== CourseStatus.DRAFT}
							>
								<Edit2 />
							</Button>
						}
					/>
					<DeleteMaterialDialog
						courseId={courseId}
						material={material}
						trigger={
							<Button
								variant="ghost"
								size="icon-sm"
								className="size-8 text-muted-foreground hover:text-destructive dark:hover:bg-destructive/10"
								aria-label="Delete material"
								disabled={courseStatus !== CourseStatus.DRAFT}
							>
								<Trash2 />
							</Button>
						}
					/>
				</div>
			</div>
		</motion.div>
	);
}
