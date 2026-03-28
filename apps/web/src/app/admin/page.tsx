"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Building2, Globe, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";

import { deleteAdminBranchesByBranchId, deleteAdminCountriesByCountryId } from "@/api-client";
import { getAdminBranches, getAdminCountries } from "@/api-client/sdk.gen";
import BranchFormDialog from "@/components/admin/branch-form-dialog";
import CountryFormDialog from "@/components/admin/country-form-dialog";
import { Button } from "@/components/animate-ui/components/buttons/button";
import BackgroundGrid from "@/components/background-grid";
import EmptyState from "@/components/empty-state";
import LoadingPlaceholder from "@/components/loading-placeholder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { logout } from "@/hooks/use-auth";
import { useRequireAuth } from "@/hooks/use-require-auth";

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

export default function AdminPage() {
	const router = useRouter();
	const { data: authData, isPending: authPending } = useRequireAuth();

	const countriesQuery = useQuery({
		queryKey: ["admin", "countries"],
		queryFn: async () => {
			const response = await getAdminCountries({
				throwOnError: true,
			});
			return response.data as Country[];
		},
	});

	const branchesQuery = useQuery({
		queryKey: ["admin", "branches"],
		queryFn: async () => {
			const response = await getAdminBranches({
				throwOnError: true,
			});
			return response.data as Branch[];
		},
	});

	const logoutMutation = useMutation({
		mutationFn: async () => logout(),
		onSuccess: () => router.push("/login"),
	});

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
		router.push("/login");
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
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => {
								countriesQuery.refetch();
								branchesQuery.refetch();
							}}
						>
							<RefreshCw className="size-4" />
							Refresh
						</Button>
						<Button variant="destructive" size="sm" onClick={() => logoutMutation.mutate()}>
							Logout
						</Button>
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
										<Button
											variant="ghost"
											size="icon"
											onClick={() => deleteCountryMutation.mutate(country.id)}
											disabled={deleteCountryMutation.isPending}
										>
											<Trash2 className="text-destructive size-4" />
										</Button>
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
											<Button
												variant="ghost"
												size="icon"
												onClick={() => deleteBranchMutation.mutate(branch.id)}
												disabled={deleteBranchMutation.isPending}
											>
												<Trash2 className="text-destructive size-4" />
											</Button>
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
			</div>
		</section>
	);
}
