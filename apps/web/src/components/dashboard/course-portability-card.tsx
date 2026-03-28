"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Download, History, Loader2 } from "lucide-react";
import { useMemo, useState } from "react";

import {
	getCoursesByCourseIdVersions,
	postCoursesByCourseIdExport,
	postCoursesImport,
} from "@/api-client";
import { Button } from "@/components/animate-ui/components/buttons/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm } from "@/hooks/form";

export default function CoursePortabilityCard({ courseId }: { courseId: string }) {
	const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

	const versionsQuery = useQuery({
		queryKey: ["course", courseId, "versions"],
		queryFn: async () => {
			const response = await getCoursesByCourseIdVersions({
				path: { courseId },
				throwOnError: true,
			});
			return response.data;
		},
	});

	const exportMutation = useMutation({
		mutationFn: async () => {
			const response = await postCoursesByCourseIdExport({
				path: { courseId },
				throwOnError: true,
			});
			return response.data;
		},
		onSuccess: (payload) => {
			const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
			const objectUrl = URL.createObjectURL(blob);
			setDownloadUrl((old) => {
				if (old) {
					URL.revokeObjectURL(old);
				}
				return objectUrl;
			});
		},
	});

	const importMutation = useMutation({
		mutationFn: async (jsonPayload: string) => {
			const parsed = JSON.parse(jsonPayload) as Parameters<typeof postCoursesImport>[0]["body"];
			await postCoursesImport({
				body: parsed,
				throwOnError: true,
			});
		},
		onSuccess: () => {
			versionsQuery.refetch();
		},
	});

	const form = useAppForm({
		defaultValues: {
			payload: "",
		},
		onSubmit: async ({ value }) => {
			await importMutation.mutateAsync(value.payload);
		},
	});

	const versionList = useMemo(() => versionsQuery.data ?? [], [versionsQuery.data]);

	return (
		<Card className="bg-card/40 border-white/5 backdrop-blur-sm">
			<CardHeader>
				<CardTitle className="text-foreground flex items-center gap-2 text-lg">
					<History className="text-primary size-5" />
					Portability & Version History
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-5">
				<div className="flex flex-wrap gap-2">
					<Button variant="outline" size="sm" onClick={() => exportMutation.mutate()}>
						<Download className="size-4" />
						Export JSON
					</Button>
					{exportMutation.isPending && <Loader2 className="text-primary size-4 animate-spin" />}
					{downloadUrl && (
						<Button asChild size="sm" variant="accent">
							<a href={downloadUrl} download={`course-${courseId}.json`}>
								Download File
							</a>
						</Button>
					)}
				</div>

				<form
					onSubmit={(event) => {
						event.preventDefault();
						event.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-3"
				>
					<form.AppField name="payload">
						{(field) => (
							<field.TextareaField
								label="Import JSON"
								placeholder="Paste exported course JSON here"
								className="min-h-36"
							/>
						)}
					</form.AppField>
					<form.AppForm>
						<form.SubscribeButton label="Import Course" className="w-full sm:w-auto" />
					</form.AppForm>
				</form>

				<div className="space-y-2">
					<p className="text-muted-foreground text-sm font-medium">Latest versions</p>
					{versionsQuery.isPending ? (
						<Loader2 className="text-primary size-4 animate-spin" />
					) : versionList.length === 0 ? (
						<p className="text-muted-foreground text-xs">No versions recorded yet.</p>
					) : (
						<div className="space-y-2">
							{versionList.slice(0, 5).map((version) => (
								<div
									key={version.versionNo}
									className="bg-background/20 border border-white/5 p-2 text-xs"
								>
									<p className="text-foreground font-medium">v{version.versionNo}</p>
									<p className="text-muted-foreground">{version.reason}</p>
								</div>
							))}
						</div>
					)}
				</div>
			</CardContent>
		</Card>
	);
}
