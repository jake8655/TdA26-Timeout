"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { File, Link as LinkIcon } from "lucide-react";
import { useState } from "react";
import z from "zod";
import {
	postCoursesByCourseIdModulesByModuleIdMaterialsMutation,
	putCoursesByCourseIdModulesByModuleIdMaterialsByMaterialIdMutation,
} from "@/api-client/@tanstack/react-query.gen";
import type { FileMaterial, UrlMaterial } from "@/api-client/types.gen";
import { Button } from "@/components/animate-ui/components/buttons/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { env } from "@/env";
import { useAppForm } from "@/hooks/form";
import { getFileTypeLabel, SUPPORTED_MIME_TYPES } from "@/lib/material-utils";

type Material = FileMaterial | UrlMaterial;

const urlFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string(),
	url: z.url("Please enter a valid URL"),
});

const fileFormSchema = z.object({
	name: z.string().min(1, "Name is required"),
	description: z.string(),
	file: z
		.file()
		.nullable()
		.refine(
			(file) => {
				if (!file) return true;
				return Object.keys(SUPPORTED_MIME_TYPES).includes(file.type);
			},
			`Unsupported file type. Supported types: ${Object.keys(SUPPORTED_MIME_TYPES).map(getFileTypeLabel).join(", ")}`,
		),
});

interface MaterialFormDialogProps {
	mode: "add" | "edit";
	courseId: string;
	moduleId?: string;
	material?: Material;
	trigger: React.ReactElement;
}

export function MaterialFormDialog({
	mode,
	courseId,
	moduleId,
	material,
	trigger,
}: MaterialFormDialogProps) {
	const [open, setOpen] = useState(false);
	const [materialType, setMaterialType] = useState<"file" | "url">(
		material?.type === "url" ? "url" : "file",
	);
	const queryClient = useQueryClient();

	const createMutation = useMutation({
		...postCoursesByCourseIdModulesByModuleIdMaterialsMutation(),
	});

	const updateMutation = useMutation({
		...putCoursesByCourseIdModulesByModuleIdMaterialsByMaterialIdMutation(),
	});

	const urlForm = useAppForm({
		defaultValues: {
			name: material?.type === "url" ? material.name : "",
			description: material?.type === "url" ? (material.description ?? "") : "",
			url: material?.type === "url" ? material.url : "",
		},
		validators: {
			onChange: urlFormSchema,
		},
		onSubmit: async ({ value }) => {
			if (mode === "add") {
				await createMutation.mutateAsync({
					path: { courseId, moduleId: moduleId ?? "" },
					body: {
						type: "url",
						name: value.name,
						description: value.description,
						url: value.url,
					},
				});
			} else if (material) {
				await updateMutation.mutateAsync({
					path: {
						courseId,
						moduleId: moduleId ?? "",
						materialId: material.uuid,
					},
					body: {
						name: value.name,
						description: value.description,
						url: value.url,
					},
				});
			}
			urlForm.reset();
			setOpen(false);
		},
	});

	const fileForm = useAppForm({
		defaultValues: {
			name: material?.type === "file" ? material.name : "",
			description:
				material?.type === "file" ? (material.description ?? "") : "",
			file: null as File | null,
		},
		validators: {
			onChange: fileFormSchema,
		},
		onSubmit: async ({ value, formApi }) => {
			const formData = new FormData();
			formData.append("type", "file");
			formData.append("name", value.name);
			formData.append("description", value.description);
			if (value.file) {
				formData.append("file", value.file);
			}

			if (mode === "add") {
				if (!value.file) {
					formApi.setErrorMap({
						onChange: {
							fields: {
								file: { message: "Please select a file to upload." },
							},
						},
					});
					return;
				}

				await fetch(
					`${env.NEXT_PUBLIC_API_BASE}/courses/${courseId}/modules/${moduleId ?? ""}/materials`,
					{
						method: "POST",
						body: formData,
						credentials: "include",
					},
				);
				await queryClient.invalidateQueries();
			} else if (material) {
				await fetch(
					`${env.NEXT_PUBLIC_API_BASE}/courses/${courseId}/modules/${moduleId ?? ""}/materials/${material.uuid}`,
					{
						method: "PUT",
						credentials: "include",
						body: formData,
					},
				);
				await queryClient.invalidateQueries();
			}
			fileForm.reset();
			setOpen(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={trigger} />
			<DialogContent className="sm:max-w-lg">
				<DialogHeader>
					<DialogTitle>
						{mode === "add" ? "Add New Material" : "Edit Material"}
					</DialogTitle>
					<DialogDescription>
						{mode === "add"
							? "Add a file or link to your course."
							: "Update the material details."}
					</DialogDescription>
				</DialogHeader>

				{mode === "add" && (
					<div className="flex gap-2">
						<button
							type="button"
							onClick={() => setMaterialType("file")}
							className={`flex flex-1 items-center justify-center gap-2 rounded-none border p-3 text-sm transition-all ${
								materialType === "file"
									? "border-primary bg-primary/10 text-primary"
									: "border-white/10 text-muted-foreground hover:border-white/20"
							}`}
						>
							<File className="size-4" />
							File Upload
						</button>
						<button
							type="button"
							onClick={() => setMaterialType("url")}
							className={`flex flex-1 items-center justify-center gap-2 rounded-none border p-3 text-sm transition-all ${
								materialType === "url"
									? "border-primary bg-primary/10 text-primary"
									: "border-white/10 text-muted-foreground hover:border-white/20"
							}`}
						>
							<LinkIcon className="size-4" />
							Web Link
						</button>
					</div>
				)}

				{materialType === "url" ? (
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							urlForm.handleSubmit();
						}}
						className="space-y-4"
					>
						<urlForm.AppField name="name">
							{(field) => (
								<field.TextField
									label="Name"
									placeholder="Enter material name"
									className="h-10"
								/>
							)}
						</urlForm.AppField>

						<urlForm.AppField name="url">
							{(field) => (
								<field.TextField
									label="URL"
									placeholder="https://example.com/resource"
									className="h-10"
								/>
							)}
						</urlForm.AppField>

						<urlForm.AppField name="description">
							{(field) => (
								<field.TextareaField
									label="Description"
									placeholder="Brief description of this resource"
									rows={3}
								/>
							)}
						</urlForm.AppField>

						<DialogFooter>
							<DialogClose render={<Button variant="outline">Cancel</Button>} />
							<urlForm.AppForm>
								<urlForm.SubscribeButton
									label={mode === "add" ? "Add Material" : "Save Changes"}
								/>
							</urlForm.AppForm>
						</DialogFooter>
					</form>
				) : (
					<form
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							fileForm.handleSubmit();
						}}
						className="space-y-4"
					>
						<fileForm.AppField name="name">
							{(field) => (
								<field.TextField
									label="Name"
									placeholder="Enter material name"
									className="h-10"
								/>
							)}
						</fileForm.AppField>

						<fileForm.AppField name="file">
							{(field) => <field.FileUploadField label="File" />}
						</fileForm.AppField>

						<fileForm.AppField name="description">
							{(field) => (
								<field.TextareaField
									label="Description"
									placeholder="Brief description of this file"
									rows={3}
								/>
							)}
						</fileForm.AppField>

						<DialogFooter>
							<DialogClose render={<Button variant="outline">Cancel</Button>} />
							<fileForm.AppForm>
								<fileForm.SubscribeButton
									label={mode === "add" ? "Add Material" : "Save Changes"}
								/>
							</fileForm.AppForm>
						</DialogFooter>
					</form>
				)}
			</DialogContent>
		</Dialog>
	);
}
