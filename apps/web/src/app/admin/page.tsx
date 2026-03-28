"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Building2, Globe, Loader2, Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
	deleteAdminBranchesByBranchId,
	deleteAdminCountriesByCountryId,
	putAdminBranchesByBranchId,
	putAdminCountriesByCountryId,
} from "@/api-client";
import { client } from "@/api-client/client.gen";
import { getAdminBranches, getAdminCountries } from "@/api-client/sdk.gen";
import type { BranchUpdateRequest, CountryUpdateRequest } from "@/api-client/types.gen";
import BranchFormDialog from "@/components/admin/branch-form-dialog";
import CountryFormDialog from "@/components/admin/country-form-dialog";
import { Button } from "@/components/animate-ui/components/buttons/button";
import BackgroundGrid from "@/components/background-grid";
import EmptyState from "@/components/empty-state";
import LoadingPlaceholder from "@/components/loading-placeholder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useRequireAuth } from "@/hooks/use-require-auth";
import { getAdminLoginPath } from "@/lib/tenant-routing";

type Country = {
	id: number;
	isoCode: string;
	name: string;
	status: string;
};

type Branch = {
	id: number;
	countryId: number;
	countryKey: string;
	name: string;
	city: string;
	address: string;
	postalCode: string;
	region: string;
	type: string;
	status: string;
	managerDisplayName: string;
	managerUsername: string;
	lecturerUsername: string;
	branchKey: string;
};

type SupportMessage = {
	uuid: string;
	subject: string;
	pageUrl: string;
	stepsToReproduce: string;
	createdAt: string;
	submittedBy: {
		uuid: string;
		username: string;
		displayName: string;
	};
	attachments: Array<{
		uuid: string;
		fileName: string;
		fileUrl: string;
		mimeType: string;
		sizeBytes: number;
	}>;
};

function EditCountryDialog({ country, onSaved }: { country: Country; onSaved: () => void }) {
	const mutation = useMutation({
		mutationFn: async (values: CountryUpdateRequest) => {
			const payload: CountryUpdateRequest = {
				name: values.name,
				status: values.status,
			};

			await putAdminCountriesByCountryId({
				path: {
					countryId: country.id,
				},
				body: payload,
				throwOnError: true,
			});
		},
		onSuccess: () => onSaved(),
	});

	const form = useAppForm({
		defaultValues: {
			name: country.name,
			status: country.status as "active" | "onboarding" | "waiting",
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync(value);
		},
	});

	return (
		<Dialog>
			<DialogTrigger
				render={
					<Button variant="ghost" size="icon">
						<Pencil className="size-4" />
					</Button>
				}
			/>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Edit country</DialogTitle>
					<DialogDescription>Update country metadata and status.</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="space-y-4"
				>
					<form.AppField name="name">
						{(field) => (
							<field.TextField label="Name" placeholder="Country name" className="h-10" />
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
							<form.SubscribeButton label="Save" className="min-w-28" />
						</form.AppForm>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

function EditBranchDialog({ branch, onSaved }: { branch: Branch; onSaved: () => void }) {
	const mutation = useMutation({
		mutationFn: async (values: BranchUpdateRequest) => {
			await putAdminBranchesByBranchId({
				path: {
					branchId: branch.id,
				},
				body: values,
				throwOnError: true,
			});
		},
		onSuccess: () => onSaved(),
	});

	const form = useAppForm({
		defaultValues: {
			name: branch.name,
			city: branch.city,
			address: branch.address,
			postalCode: branch.postalCode,
			region: branch.region,
			type: branch.type as "branch" | "hq",
			status: branch.status as "active" | "onboarding" | "waiting",
		},
		onSubmit: async ({ value }) => {
			await mutation.mutateAsync(value);
		},
	});

	return (
		<Dialog>
			<DialogTrigger
				render={
					<Button variant="ghost" size="icon">
						<Pencil className="size-4" />
					</Button>
				}
			/>
			<DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Edit branch</DialogTitle>
					<DialogDescription>Update branch details and local settings.</DialogDescription>
				</DialogHeader>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						e.stopPropagation();
						form.handleSubmit();
					}}
					className="grid gap-3 sm:grid-cols-2"
				>
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

					<div className="sm:col-span-2">
						<DialogFooter>
							<DialogClose render={<Button variant="outline">Cancel</Button>} />
							<form.AppForm>
								<form.SubscribeButton label="Save changes" className="min-w-32" />
							</form.AppForm>
						</DialogFooter>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}

export default function AdminPage() {
	const router = useRouter();
	const { data: authData, isPending: authPending } = useRequireAuth({
		redirectTo: getAdminLoginPath(),
	});

	const countriesQuery = useQuery({
		queryKey: ["admin", "countries"],
		enabled: authData?.role === "admin",
		queryFn: async () => {
			const response = await getAdminCountries({
				throwOnError: true,
			});
			return response.data as Country[];
		},
	});

	const branchesQuery = useQuery({
		queryKey: ["admin", "branches"],
		enabled: authData?.role === "admin",
		queryFn: async () => {
			const response = await getAdminBranches({
				throwOnError: true,
			});
			return response.data as Branch[];
		},
	});

	const supportMessagesQuery = useQuery({
		queryKey: ["admin", "support-messages"],
		enabled: authData?.role === "admin",
		queryFn: async () => {
			const response = await client.get({
				url: "/support-messages",
				throwOnError: true,
			});
			return response.data as SupportMessage[];
		},
	});

	useEffect(() => {
		if (!authPending && (!authData || authData.role !== "admin")) {
			router.push(getAdminLoginPath());
		}
	}, [authData, authPending, router]);

	const deleteCountryMutation = useMutation({
		mutationFn: async (countryId: number) => {
			await deleteAdminCountriesByCountryId({
				path: {
					countryId,
				},
				throwOnError: true,
			});
		},
		onSuccess: () => {
			countriesQuery.refetch();
			branchesQuery.refetch();
		},
	});

	const deleteBranchMutation = useMutation({
		mutationFn: async (branchId: number) => {
			await deleteAdminBranchesByBranchId({
				path: {
					branchId,
				},
				throwOnError: true,
			});
		},
		onSuccess: () => {
			branchesQuery.refetch();
		},
	});

	if (authPending) {
		return <LoadingPlaceholder />;
	}

	if (!authData || authData.role !== "admin") {
		return <LoadingPlaceholder />;
	}

	const countries = countriesQuery.data ?? [];
	const branches = branchesQuery.data ?? [];

	return (
		<section className="relative min-h-screen overflow-hidden pt-28 pb-16">
			<BackgroundGrid />

			<div className="relative z-10 mx-auto max-w-7xl space-y-8 px-6">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
					className="flex flex-wrap items-start justify-between gap-4"
				>
					<div>
						<h1 className="text-foreground text-3xl font-bold">Global Admin</h1>
						<p className="text-muted-foreground mt-2 max-w-2xl text-sm sm:text-base">
							Manage countries, branches, and local account ownership.
						</p>
					</div>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.05 }}
					className="grid gap-6 lg:grid-cols-2"
				>
					<Card className="bg-card/40 border-white/5 backdrop-blur-sm">
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle className="text-foreground flex items-center gap-2 text-xl">
								<Globe className="text-primary size-5" />
								Countries
							</CardTitle>
							<CountryFormDialog />
						</CardHeader>
						<CardContent className="space-y-3">
							{countriesQuery.isPending ? (
								<Loader2 className="text-primary mx-auto size-8 animate-spin" />
							) : countries.length === 0 ? (
								<EmptyState
									title="No countries yet"
									description="Create your first country to start onboarding branches."
									icon={<Globe className="text-primary size-7" />}
									iconClassName="bg-primary/10"
								/>
							) : (
								countries.map((country) => (
									<div
										key={country.id}
										className="bg-background/20 flex items-center justify-between border border-white/5 p-3"
									>
										<div>
											<p className="text-foreground text-sm font-semibold">
												{country.name} ({country.isoCode})
											</p>
											<p className="text-muted-foreground text-xs">
												Status: {country.status.toLowerCase()}
											</p>
										</div>
										<div className="flex items-center">
											<EditCountryDialog
												country={country}
												onSaved={() => {
													countriesQuery.refetch();
													branchesQuery.refetch();
												}}
											/>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => deleteCountryMutation.mutate(country.id)}
												disabled={deleteCountryMutation.isPending}
											>
												<Trash2 className="text-destructive size-4" />
											</Button>
										</div>
									</div>
								))
							)}
						</CardContent>
					</Card>

					<Card className="bg-card/40 border-white/5 backdrop-blur-sm">
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle className="text-foreground flex items-center gap-2 text-xl">
								<Building2 className="text-primary size-5" />
								Branches
							</CardTitle>
							<BranchFormDialog
								countries={countries.map((country) => ({ id: country.id, name: country.name }))}
							/>
						</CardHeader>
						<CardContent className="space-y-3">
							{branchesQuery.isPending ? (
								<Loader2 className="text-primary mx-auto size-8 animate-spin" />
							) : branches.length === 0 ? (
								<EmptyState
									title="No branches yet"
									description="Create a branch and assign manager + lecturer credentials."
									icon={<Building2 className="text-primary size-7" />}
									iconClassName="bg-primary/10"
								/>
							) : (
								branches.map((branch) => (
									<div
										key={branch.id}
										className="bg-background/20 space-y-2 border border-white/5 p-3"
									>
										<div className="flex items-center justify-between gap-3">
											<p className="text-foreground text-sm font-semibold">
												{branch.name} ({branch.city})
											</p>
											<div className="flex items-center">
												<EditBranchDialog
													branch={branch}
													onSaved={() => {
														branchesQuery.refetch();
													}}
												/>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => deleteBranchMutation.mutate(branch.id)}
													disabled={deleteBranchMutation.isPending}
												>
													<Trash2 className="text-destructive size-4" />
												</Button>
											</div>
										</div>
										<p className="text-muted-foreground text-xs">
											{branch.countryKey} • {branch.branchKey}
										</p>
										<p className="text-muted-foreground text-xs">
											{branch.type} • {branch.status}
										</p>
										<p className="text-muted-foreground text-xs">
											Manager: {branch.managerDisplayName} ({branch.managerUsername})
										</p>
										<p className="text-muted-foreground text-xs">
											Lecturer: {branch.lecturerUsername}
										</p>
									</div>
								))
							)}
						</CardContent>
					</Card>
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4, delay: 0.1 }}
				>
					<Card className="bg-card/40 border-white/5 backdrop-blur-sm">
						<CardHeader>
							<CardTitle className="text-foreground text-xl">Support Messages</CardTitle>
						</CardHeader>
						<CardContent className="space-y-3">
							{supportMessagesQuery.isPending ? (
								<Loader2 className="text-primary mx-auto size-8 animate-spin" />
							) : (supportMessagesQuery.data ?? []).length === 0 ? (
								<EmptyState
									title="No support messages"
									description="Student messages will show here with page URL, steps, and attachments."
									icon={<Globe className="text-primary size-7" />}
									iconClassName="bg-primary/10"
								/>
							) : (
								(supportMessagesQuery.data ?? []).map((message) => (
									<div
										key={message.uuid}
										className="bg-background/20 space-y-3 border border-white/5 p-3"
									>
										<div className="flex flex-wrap items-center justify-between gap-2">
											<p className="text-foreground text-sm font-semibold">{message.subject}</p>
											<p className="text-muted-foreground text-xs">
												{new Date(message.createdAt).toLocaleString()}
											</p>
										</div>
										<p className="text-muted-foreground text-xs">
											From: {message.submittedBy.displayName} ({message.submittedBy.username})
										</p>
										<p className="text-muted-foreground break-all text-xs">
											URL: {message.pageUrl}
										</p>
										<p className="text-foreground text-xs whitespace-pre-wrap">
											{message.stepsToReproduce}
										</p>
										{message.attachments.length > 0 && (
											<div className="space-y-1">
												<p className="text-muted-foreground text-xs font-semibold">Attachments</p>
												<div className="space-y-1">
													{message.attachments.map((attachment) => (
														<a
															key={attachment.uuid}
															href={attachment.fileUrl}
															target="_blank"
															rel="noreferrer"
															className="text-primary block text-xs underline"
														>
															{attachment.fileName}
														</a>
													))}
												</div>
											</div>
										)}
									</div>
								))
							)}
						</CardContent>
					</Card>
				</motion.div>
			</div>
		</section>
	);
}
