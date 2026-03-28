"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";

import { postAdminBranches } from "@/api-client";
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

export default function BranchFormDialog({
	countries,
}: {
	countries: { id: number; name: string }[];
}) {
	const queryClient = useQueryClient();
	const mutation = useMutation({
		mutationFn: async (values: {
			countryId: string;
			name: string;
			city: string;
			address: string;
			postalCode: string;
			region: string;
			type: "branch" | "hq";
			status: "active" | "onboarding" | "waiting";
			managerUsername: string;
			managerPassword: string;
			managerDisplayName: string;
			lecturerUsername: string;
			lecturerPassword: string;
		}) => {
			await postAdminBranches({
				body: {
					...values,
					countryId: Number(values.countryId),
				},
				throwOnError: true,
			});
		},
		onSuccess: () => {
			queryClient.invalidateQueries();
		},
	});

	const defaultCountry = countries[0]?.id ? String(countries[0].id) : "";
	const form = useAppForm({
		defaultValues: {
			countryId: defaultCountry,
			name: "",
			city: "",
			address: "",
			postalCode: "",
			region: "",
			type: "branch" as const,
			status: "active" as const,
			managerUsername: "",
			managerPassword: "",
			managerDisplayName: "",
			lecturerUsername: "",
			lecturerPassword: "",
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
						Add Branch
					</Button>
				}
			/>
			<DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Create branch</DialogTitle>
					<DialogDescription>
						Create a branch with manager and lecturer credentials.
					</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="grid gap-3 sm:grid-cols-2"
				>
					<form.AppField name="countryId">
						{(field) => (
							<field.TextField
								label="Country ID"
								placeholder={defaultCountry || "1"}
								className="h-10"
							/>
						)}
					</form.AppField>
					<form.AppField name="name">
						{(field) => (
							<field.TextField label="Branch name" placeholder="Prague HQ" className="h-10" />
						)}
					</form.AppField>
					<form.AppField name="city">
						{(field) => <field.TextField label="City" placeholder="Prague" className="h-10" />}
					</form.AppField>
					<form.AppField name="address">
						{(field) => (
							<field.TextField label="Address" placeholder="Main Square 1" className="h-10" />
						)}
					</form.AppField>
					<form.AppField name="postalCode">
						{(field) => (
							<field.TextField label="Postal code" placeholder="11000" className="h-10" />
						)}
					</form.AppField>
					<form.AppField name="region">
						{(field) => (
							<field.TextField label="Region" placeholder="Central Europe" className="h-10" />
						)}
					</form.AppField>
					<form.AppField name="type">
						{(field) => <field.TextField label="Type" placeholder="hq / branch" className="h-10" />}
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
					<form.AppField name="managerDisplayName">
						{(field) => (
							<field.TextField
								label="Manager display name"
								placeholder="John Manager"
								className="h-10"
							/>
						)}
					</form.AppField>
					<form.AppField name="managerUsername">
						{(field) => (
							<field.TextField
								label="Manager username"
								placeholder="manager-prg"
								className="h-10"
							/>
						)}
					</form.AppField>
					<form.AppField name="managerPassword">
						{(field) => (
							<field.TextField
								label="Manager password"
								type="password"
								placeholder="********"
								className="h-10"
							/>
						)}
					</form.AppField>
					<form.AppField name="lecturerUsername">
						{(field) => (
							<field.TextField
								label="Lecturer username"
								placeholder="lecturer-prg"
								className="h-10"
							/>
						)}
					</form.AppField>
					<form.AppField name="lecturerPassword">
						{(field) => (
							<field.TextField
								label="Lecturer password"
								type="password"
								placeholder="********"
								className="h-10"
							/>
						)}
					</form.AppField>

					<div className="sm:col-span-2">
						<DialogFooter>
							<DialogClose render={<Button variant="outline">Cancel</Button>} />
							<form.AppForm>
								<form.SubscribeButton label="Create branch" className="min-w-32" />
							</form.AppForm>
						</DialogFooter>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
