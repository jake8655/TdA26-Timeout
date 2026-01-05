"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, PackageOpen } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { getCoursesByCourseIdMaterialsOptions } from "@/api-client/@tanstack/react-query.gen";
import type { FileMaterial, UrlMaterial } from "@/api-client/types.gen";
import { MaterialCard } from "./material-card";

type Material = FileMaterial | UrlMaterial;

interface MaterialsListProps {
	courseId: string;
}

export function MaterialsList({ courseId }: MaterialsListProps) {
	const { data, isPending, isError } = useQuery({
		...getCoursesByCourseIdMaterialsOptions({
			path: { courseId },
		}),
	});

	if (isPending) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="flex justify-center py-12"
			>
				<Loader2 className="size-8 animate-spin text-primary" />
			</motion.div>
		);
	}

	if (isError) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="py-8 text-center text-muted-foreground"
			>
				<p>Failed to load materials. Please try again later.</p>
			</motion.div>
		);
	}

	const materials = data as Material[] | undefined;

	if (!materials || materials.length === 0) {
		return (
			<motion.div
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				className="flex flex-col items-center justify-center py-12 text-center"
			>
				<div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted/20">
					<PackageOpen className="size-8 text-muted-foreground" />
				</div>
				<h3 className="font-medium text-foreground">No materials yet</h3>
				<p className="mt-1 text-muted-foreground text-sm">
					Course materials will appear here once added.
				</p>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.4 }}
			className="flex flex-col gap-3"
		>
			<AnimatePresence mode="popLayout">
				{materials.map((material, index) => (
					<MaterialCard key={material.uuid} material={material} index={index} />
				))}
			</AnimatePresence>
		</motion.div>
	);
}
