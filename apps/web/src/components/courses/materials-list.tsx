"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2, PackageOpen } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { getCoursesByCourseIdMaterialsOptions } from "@/api-client/@tanstack/react-query.gen";
import type { FileMaterial, UrlMaterial } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import EmptyState from "../empty-state";
import { MaterialCard } from "./material-card";

type Material = FileMaterial | UrlMaterial;

export function MaterialsList({ courseId }: { courseId: string }) {
	const { data, isPending, isError, refetch } = useQuery({
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
			<EmptyState
				title="Unable to load materials"
				description="Please try again in a moment."
				action={
					<Button variant="outline" size="sm" onClick={() => refetch()}>
						Retry
					</Button>
				}
			/>
		);
	}

	const materials = data as Material[] | undefined;

	if (!materials || materials.length === 0) {
		return (
			<EmptyState
				title="No materials yet"
				description="Course materials will appear here once added."
				icon={<PackageOpen className="size-7 text-primary" />}
			/>
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
