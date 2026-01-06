"use client";

import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Edit2, Loader2, Plus, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { use, useEffect } from "react";
import {
	getCoursesByCourseIdMaterialsOptions,
	getCoursesByCourseIdOptions,
} from "@/api-client/@tanstack/react-query.gen";
import type { FileMaterial, UrlMaterial } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import BackgroundGrid from "@/components/background-grid";
import { DeleteMaterialDialog } from "@/components/dashboard/delete-material-dialog";
import { MaterialFormDialog } from "@/components/dashboard/material-form-dialog";
import LoadingPlaceholder from "@/components/loading-placeholder";
import { useAuth } from "@/hooks/use-auth";
import {
	formatFileSize,
	getFileTypeLabel,
	getMaterialIcon,
} from "@/lib/material-utils";

type Material = FileMaterial | UrlMaterial;

export default function DashboardCourseDetailPage({
	params,
}: {
	params: Promise<{ uuid: string }>;
}) {
	const { uuid } = use(params);
	const router = useRouter();
	const { data: authData, isPending: authLoading } = useAuth();

	const {
		data: course,
		isPending: courseLoading,
		isError: courseError,
	} = useQuery({
		...getCoursesByCourseIdOptions({
			path: { courseId: uuid },
		}),
	});

	const {
		data: materials,
		isPending: materialsLoading,
		isError: materialsError,
	} = useQuery({
		...getCoursesByCourseIdMaterialsOptions({
			path: { courseId: uuid },
		}),
	});

	useEffect(() => {
		if (!authData && !authLoading) {
			router.push("/login");
		}
	}, [authData, router, authLoading]);

	if (!authData) {
		return <LoadingPlaceholder />;
	}

	if (!courseLoading && !courseError && !course) {
		notFound();
	}

	return (
		<section className="relative min-h-screen overflow-hidden pt-28 pb-16">
			<BackgroundGrid />

			<div className="relative z-10 mx-auto max-w-4xl px-6">
				<motion.div
					initial={{ opacity: 0, x: -20 }}
					animate={{ opacity: 1, x: 0 }}
					transition={{ duration: 0.4 }}
					className="mb-8"
				>
					<Link href="/dashboard">
						<Button
							variant="ghost"
							size="sm"
							className="text-muted-foreground hover:text-primary dark:hover:bg-transparent"
						>
							<ArrowLeft />
							Back to Dashboard
						</Button>
					</Link>
				</motion.div>

				{courseLoading ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="flex justify-center py-12"
					>
						<Loader2 className="size-16 animate-spin text-primary" />
					</motion.div>
				) : courseError ? (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						className="py-12 text-center text-muted-foreground"
					>
						<p>Failed to load course. Please try again later.</p>
					</motion.div>
				) : (
					<>
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="mb-8 border border-white/5 bg-card/40 p-6 backdrop-blur-sm"
						>
							<div className="flex items-center gap-4">
								<div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 shadow-inner shadow-primary/10">
									<Image
										src="/icons/Idea/zarivka_idea_blue.svg"
										alt="Course icon"
										width={32}
										height={32}
									/>
								</div>
								<div className="flex-1 overflow-hidden">
									<h1 className="font-bold text-primary text-xl sm:text-2xl">
										{course.name}
									</h1>
									{course?.description && (
										<p className="mt-1 truncate text-muted-foreground text-sm">
											{course.description}
										</p>
									)}
								</div>
							</div>
						</motion.div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.1 }}
						>
							<div className="mb-6 flex items-center justify-between">
								<h2 className="font-semibold text-foreground text-xl">
									Course Materials
								</h2>
								<MaterialFormDialog
									mode="add"
									courseId={uuid}
									trigger={
										<Button variant="accent" size="sm">
											<Plus />
											Add Material
										</Button>
									}
								/>
							</div>

							{materialsLoading ? (
								<div className="flex justify-center py-12">
									<Loader2 className="size-8 animate-spin text-primary" />
								</div>
							) : materialsError ? (
								<div className="py-12 text-center text-muted-foreground">
									<p>Failed to load materials. Please try again later.</p>
								</div>
							) : materials.length === 0 ? (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									className="flex flex-col items-center justify-center rounded-none border border-white/10 border-dashed py-16 text-center"
								>
									<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-primary/10">
										<Plus className="size-8 text-primary" />
									</div>
									<h3 className="mb-2 font-medium text-foreground">
										No materials yet
									</h3>
									<p className="mb-6 text-muted-foreground text-sm">
										Add files or links for your students.
									</p>
									<MaterialFormDialog
										mode="add"
										courseId={uuid}
										trigger={
											<Button variant="accent" size="sm">
												<Plus />
												Add First Material
											</Button>
										}
									/>
								</motion.div>
							) : (
								<div className="flex flex-col gap-3">
									<AnimatePresence mode="popLayout">
										{materials.map((material, index) => (
											<DashboardMaterialCard
												key={material.uuid}
												material={material}
												courseId={uuid}
												index={index}
											/>
										))}
									</AnimatePresence>
								</div>
							)}
						</motion.div>
					</>
				)}
			</div>
		</section>
	);
}

function DashboardMaterialCard({
	material,
	courseId,
	index,
}: {
	material: Material;
	courseId: string;
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
				{material.description && (
					<p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
						{material.description}
					</p>
				)}
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
						>
							<Trash2 />
						</Button>
					}
				/>
			</div>
		</motion.div>
	);
}
