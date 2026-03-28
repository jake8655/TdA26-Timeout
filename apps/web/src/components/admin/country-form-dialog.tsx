"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { postAdminCountries } from "@/api-client";
import type { CountryCreateRequest } from "@/api-client/types.gen";
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
import { useAppForm } from "@/hooks/form";

export default function CountryFormDialog() {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (values: CountryCreateRequest) => {
			await postAdminCountries({
				body: values,
				throwOnError: true,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries();
		},
	});

	const form = useAppForm({
		defaultValues: {
			isoCode: "",
			name: "",
			status: "active" as const,
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync(value);
		},
	});

	return (
		<Dialog>
			<DialogTrigger
				render={
					<Button variant="accent" size="sm">
						<Plus />
						Add Country
					</Button>
				}
			/>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Create country</DialogTitle>
					<DialogDescription>Add a country for localized branches.</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					<form.AppField name="isoCode">
						{(field) => <field.TextField label="ISO" placeholder="CZ" className="h-10" />}
					</form.AppField>
					<form.AppField name="name">
						{(field) => (
							<field.TextField label="Name" placeholder="Czech Republic" className="h-10" />
						)}
					</form.AppField>
					<form.AppField name="status">
						{(field) => (
							<field.TextField
								label="Status"
								placeholder="active / onboarding / waiting"
								className="h-10"
							/>
						)}
					</form.AppField>
					<DialogFooter>
						<DialogClose render={<Button variant="outline">Cancel</Button>} />
						<form.AppForm>
							<form.SubscribeButton label="Create" className="min-w-28" />
						</form.AppForm>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
