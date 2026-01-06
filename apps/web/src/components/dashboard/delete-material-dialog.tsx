"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { deleteCoursesByCourseIdMaterialsByMaterialIdMutation } from "@/api-client/@tanstack/react-query.gen";
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

type Material = FileMaterial | UrlMaterial;

interface DeleteMaterialDialogProps {
	courseId: string;
	material: Material;
	trigger: React.ReactElement;
}

export function DeleteMaterialDialog({
	courseId,
	material,
	trigger,
}: DeleteMaterialDialogProps) {
	const [open, setOpen] = useState(false);

	const deleteMutation = useMutation({
		...deleteCoursesByCourseIdMaterialsByMaterialIdMutation(),
		onSuccess: () => {
			setOpen(false);
		},
	});

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger render={trigger} />
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Delete Material</DialogTitle>
					<DialogDescription>
						Are you sure you want to delete "
						<span className="text-accent">{material.name}</span>"? This action
						cannot be undone.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<DialogClose render={<Button variant="outline">Cancel</Button>} />
					<Button
						variant="destructive"
						disabled={deleteMutation.isPending}
						onClick={() =>
							deleteMutation.mutate({
								// @ts-expect-error TdA requires json body even for DELETE
								body: {},
								path: { courseId, materialId: material.uuid },
							})
						}
					>
						{deleteMutation.isPending ? (
							<Loader2 className="animate-spin text-muted-foreground" />
						) : (
							"Delete"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
