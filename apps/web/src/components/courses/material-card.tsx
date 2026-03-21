"use client";

import { Download, ExternalLink } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";

import type { FileMaterial, UrlMaterial } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { formatFileSize, getFileTypeLabel, getMaterialIcon } from "@/lib/material-utils";

type Material = FileMaterial | UrlMaterial;

interface MaterialCardProps {
	material: Material;
	index: number;
}

export function MaterialCard({ material, index }: MaterialCardProps) {
	const Icon = getMaterialIcon(material);

	if (material.type === "url") {
		return (
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4, delay: index * 0.05 }}
				className="group bg-card/40 hover:border-primary/30 flex items-start gap-4 rounded-none border border-white/5 p-4 backdrop-blur-sm transition-colors duration-300"
			>
				<div className="bg-primary/10 relative flex size-12 shrink-0 items-center justify-center rounded-lg">
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
						<Icon className="text-primary size-6" />
					)}
				</div>

				<div className="flex-1 overflow-hidden">
					<h3 className="text-foreground text-sm font-semibold">{material.name}</h3>
					{material.description && (
						<p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
							{material.description}
						</p>
					)}
					<div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
						<ExternalLink className="size-3" />
						<span className="truncate">{new URL(material.url).hostname}</span>
					</div>
				</div>

				<Button
					variant="outline"
					size="sm"
					className="text-muted-foreground hover:border-primary/30 hover:text-primary shrink-0 gap-1.5 border-white/10"
					asChild
				>
					<a href={material.url} target="_blank" rel="noopener noreferrer">
						<ExternalLink className="size-3.5" />
						<span className="hidden sm:inline">Visit Site</span>
					</a>
				</Button>
			</motion.div>
		);
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, delay: index * 0.05 }}
			className="group bg-card/40 hover:border-primary/30 flex items-start gap-4 rounded-none border border-white/5 p-4 backdrop-blur-sm transition-colors duration-300"
		>
			<div className="bg-primary/10 flex size-12 shrink-0 items-center justify-center rounded-lg">
				<Icon className="text-primary size-6" />
			</div>

			<div className="min-w-0 flex-1">
				<h3 className="text-foreground line-clamp-2 text-sm font-semibold">{material.name}</h3>
				{material.description && (
					<p className="text-muted-foreground mt-1 text-xs wrap-break-word whitespace-pre-wrap">
						{material.description}
					</p>
				)}
				<div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
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
				className="text-muted-foreground hover:border-primary/30 hover:text-primary shrink-0 gap-1.5 border-white/10"
				asChild
			>
				<a href={material.fileUrl} target="_blank" rel="noopener noreferrer">
					<Download className="size-3.5" />
					<span className="hidden sm:inline">Download</span>
				</a>
			</Button>
		</motion.div>
	);
}
