"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { Building2, KeyRound, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { getManagerBranch, putManagerBranch, putManagerLecturerCredentials } from "@/api-client";
import type { ManagerBranch } from "@/api-client/types.gen";
import BackgroundGrid from "@/components/background-grid";
import LoadingPlaceholder from "@/components/loading-placeholder";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppForm } from "@/hooks/form";
import { useRequireAuth } from "@/hooks/use-require-auth";
import { getCountryPathFromPathname, getLocalizedManagerLoginPath } from "@/lib/tenant-routing";

export default function ManagerDashboardPage() {
	const router = useRouter();
	const pathname = usePathname();
	const countryKey = getCountryPathFromPathname(pathname).replace("/", "");
	const { data: authData, isPending: authPending } = useRequireAuth({
		redirectTo: getLocalizedManagerLoginPath(countryKey),
	});

	useEffect(() => {
		if (!authPending && authData && authData.role !== "manager") {
			router.push(getLocalizedManagerLoginPath(countryKey));
		}
	}, [authData, authPending, countryKey, router]);

	const branchQuery = useQuery({
		queryKey: ["manager", "branch"],
		enabled: authData?.role === "manager",
		queryFn: async () => {
			const response = await getManagerBranch({
				throwOnError: true,
			});
			return response.data as ManagerBranch;
		},
	});

	const branchMutation = useMutation({
		mutationFn: async (values: {
			name: string;
			city: string;
			address: string;
			postalCode: string;
			region: string;
			type: "branch" | "hq";
			status: "active" | "onboarding" | "waiting";
		}) => {
			await putManagerBranch({
				body: values,
				throwOnError: true,
			});
		},
		onSuccess: () => {
			branchQuery.refetch();
		},
	});

	const lecturerMutation = useMutation({
		mutationFn: async (values: { username: string; password: string }) => {
			await putManagerLecturerCredentials({
				body: values,
				throwOnError: true,
			});
		},
		onSuccess: () => {
			branchQuery.refetch();
		},
	});

	const branch = branchQuery.data;

	const branchForm = useAppForm({
		defaultValues: {
			name: branch?.name ?? "",
			city: branch?.city ?? "",
			address: branch?.address ?? "",
			postalCode: branch?.postalCode ?? "",
			region: branch?.region ?? "",
			type: (branch?.type as "branch" | "hq") ?? "branch",
			status: (branch?.status as "active" | "onboarding" | "waiting") ?? "active",
		},
		onSubmit: async ({ value }) => {
			await branchMutation.mutateAsync(value);
		},
	});

	const lecturerForm = useAppForm({
		defaultValues: {
			username: branch?.lecturerUsername ?? "",
			password: "",
		},
		onSubmit: async ({ value }) => {
			await lecturerMutation.mutateAsync(value);
		},
	});

	if (authPending) {
		return <LoadingPlaceholder />;
	}

	if (!authData || authData.role !== "manager") {
		return <LoadingPlaceholder />;
	}

	return (
		<section className="relative min-h-screen overflow-hidden pt-28 pb-16">
			<BackgroundGrid />

			<div className="relative z-10 mx-auto max-w-5xl space-y-6 px-6">
				<motion.div
					initial={{ opacity: 0, y: 16 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.4 }}
				>
					<h1 className="text-foreground text-3xl font-bold">Manager Workspace</h1>
					<p className="text-muted-foreground mt-2 text-sm sm:text-base">
						Update your branch details and maintain lecturer credentials.
					</p>
				</motion.div>

				{branchQuery.isPending || !branch ? (
					<Loader2 className="text-primary mx-auto size-8 animate-spin" />
				) : (
					<>
						<Card className="bg-card/40 border-white/5 backdrop-blur-sm">
							<CardHeader>
								<CardTitle className="text-foreground flex items-center gap-2 text-xl">
									<Building2 className="text-primary size-5" />
									Branch Profile
								</CardTitle>
							</CardHeader>
							<CardContent>
								<form
									onSubmit={(e) => {
										e.preventDefault();
										e.stopPropagation();
										branchForm.handleSubmit();
									}}
									className="grid gap-3 sm:grid-cols-2"
								>
									<branchForm.AppField name="name">
										{(field) => (
											<field.TextField label="Name" placeholder="Prague HQ" className="h-10" />
										)}
									</branchForm.AppField>
									<branchForm.AppField name="city">
										{(field) => (
											<field.TextField label="City" placeholder="Prague" className="h-10" />
										)}
									</branchForm.AppField>
									<branchForm.AppField name="address">
										{(field) => (
											<field.TextField
												label="Address"
												placeholder="Main Square 1"
												className="h-10"
											/>
										)}
									</branchForm.AppField>
									<branchForm.AppField name="postalCode">
										{(field) => (
											<field.TextField label="Postal code" placeholder="11000" className="h-10" />
										)}
									</branchForm.AppField>
									<branchForm.AppField name="region">
										{(field) => (
											<field.TextField
												label="Region"
												placeholder="Central Europe"
												className="h-10"
											/>
										)}
									</branchForm.AppField>
									<branchForm.AppField name="type">
										{(field) => (
											<field.TextField label="Type" placeholder="branch" className="h-10" />
										)}
									</branchForm.AppField>
									<branchForm.AppField name="status">
										{(field) => (
											<field.TextField label="Status" placeholder="active" className="h-10" />
										)}
									</branchForm.AppField>

									<div className="sm:col-span-2">
										<branchForm.AppForm>
											<branchForm.SubscribeButton
												label="Save branch"
												className="w-full sm:w-auto"
											/>
										</branchForm.AppForm>
									</div>
								</form>
							</CardContent>
						</Card>

						<Card className="bg-card/40 border-white/5 backdrop-blur-sm">
							<CardHeader>
								<CardTitle className="text-foreground flex items-center gap-2 text-xl">
									<KeyRound className="text-primary size-5" />
									Lecturer Credentials
								</CardTitle>
							</CardHeader>
							<CardContent>
								<form
									onSubmit={(e) => {
										e.preventDefault();
										e.stopPropagation();
										lecturerForm.handleSubmit();
									}}
									className="grid gap-3 sm:grid-cols-2"
								>
									<lecturerForm.AppField name="username">
										{(field) => (
											<field.TextField
												label="Username"
												placeholder="lecturer-prague"
												className="h-10"
											/>
										)}
									</lecturerForm.AppField>
									<lecturerForm.AppField name="password">
										{(field) => (
											<field.TextField
												label="New password"
												type="password"
												placeholder="********"
												className="h-10"
											/>
										)}
									</lecturerForm.AppField>

									<div className="sm:col-span-2">
										<lecturerForm.AppForm>
											<lecturerForm.SubscribeButton
												label="Update lecturer"
												className="w-full sm:w-auto"
											/>
										</lecturerForm.AppForm>
									</div>
								</form>
							</CardContent>
						</Card>
					</>
				)}

			</div>
		</section>
	);
}
