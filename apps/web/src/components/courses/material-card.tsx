"use client";

import { Download, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import type { FileMaterial, UrlMaterial } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import {
	formatFileSize,
	getFileTypeLabel,
	getMaterialIcon,
} from "@/lib/material-utils";

type Material = FileMaterial | UrlMaterial;

interface MaterialCardProps {
	material: Material;
	index: number;
}

export function MaterialCard({ material, index }: MaterialCardProps) {
	const Icon = getMaterialIcon(material);

	if (material.type === "url") {
		return (
			<motion.a
				href={material.url}
				target="_blank"
				rel="noopener noreferrer"
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, delay: index * 0.05 }}
				className="group flex items-start gap-4 rounded-none border border-white/5 bg-card/40 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/60 hover:shadow-lg"
			>
				<div className="relative flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
					{material.faviconUrl ? (
						<Image
							src={material.faviconUrl}
							alt=""
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
					<h3 className="font-semibold text-foreground text-sm transition-colors group-hover:text-primary">
						{material.name}
					</h3>
					{material.description && (
						<p className="mt-1 line-clamp-2 text-muted-foreground text-xs">
							{material.description}
						</p>
					)}
					<div className="mt-2 flex items-center gap-2 text-muted-foreground text-xs">
						<ExternalLink className="size-3" />
						<span className="truncate">{new URL(material.url).hostname}</span>
					</div>
				</div>

				<motion.div
					initial={{ opacity: 0, x: -10 }}
					whileHover={{ scale: 1.1 }}
					className="opacity-0 transition-opacity group-hover:opacity-100"
				>
					<ExternalLink className="size-5 text-primary" />
				</motion.div>
			</motion.a>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: index * 0.05 }}
			className="group flex items-start gap-4 rounded-none border border-white/5 bg-card/40 p-4 backdrop-blur-sm transition-all duration-300 hover:border-primary/30 hover:bg-card/60"
		>
			<div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
				<Icon className="size-6 text-primary" />
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
					<span>{getFileTypeLabel(material.mimeType)}</span>
					{material.sizeBytes && (
						<>
							<span className="text-white/20">•</span>
							<span>{formatFileSize(material.sizeBytes)}</span>
						</>
					)}
				</div>
			</div>

			<Button
				variant="outline"
				size="sm"
				className="shrink-0 gap-1.5 border-white/10 text-muted-foreground hover:border-primary/30 hover:text-primary"
				onClick={() => {
					window.open(material.fileUrl, "_blank");
				}}
			>
				<Download className="size-3.5" />
				<span className="hidden sm:inline">Download</span>
			</Button>
		</motion.div>
	);
}
