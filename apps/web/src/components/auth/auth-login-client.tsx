"use client";

import { useMutation } from "@tanstack/react-query";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { z } from "zod";

import { getAuthMe, postAuthLogin, postAuthTenantsByCountryKeyLogin } from "@/api-client/sdk.gen";
import BackgroundGrid from "@/components/background-grid";
import { useAppForm } from "@/hooks/form";
import { authSchema, useAuth } from "@/hooks/use-auth";
import { getDashboardPath } from "@/lib/tenant-routing";

const loginSchema = z.object({
	username: z.string().min(3, "Username must be at least 3 characters"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormData = z.infer<typeof loginSchema>;

async function fetchMe() {
	const response = await getAuthMe({
		throwOnError: true,
	});

	const parsed = authSchema.safeParse(response.data);
	if (!parsed.success) {
		throw new Error("Failed to load profile");
	}

	return parsed.data;
}

export default function AuthLoginClient({
	mode,
	countryKey,
}: {
	mode: "lecturer" | "manager" | "admin";
	countryKey?: string;
}) {
	const router = useRouter();
	const { data, isPending } = useAuth();

	const loginMutation = useMutation({
		mutationFn: async (values: LoginFormData) => {
			if (countryKey) {
				await postAuthTenantsByCountryKeyLogin({
					body: values,
					path: {
						countryKey,
					},
					throwOnError: true,
				});
			} else {
				await postAuthLogin({
					body: values,
					throwOnError: true,
				});
			}

			return fetchMe();
		},
		onSuccess: (profile) => {
			router.push(getDashboardPath(profile));
		},
	});

	const form = useAppForm({
		defaultValues: {
			username: "",
			password: "",
		},
		validators: {
			onChange: loginSchema,
		},
		onSubmit: async ({ value }) => {
			await loginMutation.mutateAsync(value);
		},
	});

	useEffect(() => {
		if (!isPending && data) {
			router.push(getDashboardPath(data));
		}
	}, [data, isPending, router]);

	const roleLabel =
		mode === "admin"
			? "Global Admin Access"
			: mode === "manager"
				? "Branch Manager Access"
				: "Lecturer Access";
	const roleHint =
		mode === "admin"
			? "Use your global admin credentials to manage countries and branches"
			: mode === "manager"
				? "Use your branch manager credentials to manage local operations"
				: "Use your lecturer credentials to run courses and classroom sessions";
	const submitLabel =
		mode === "admin" ? "Admin Login" : mode === "manager" ? "Manager Login" : "Lecturer Login";

	return (
		<section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
			<BackgroundGrid />

			<div className="relative z-10 mx-auto w-full max-w-md px-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="bg-card/60 overflow-hidden border border-white/10 p-8 backdrop-blur-md"
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="mb-8 flex justify-center"
					>
						<div className="relative">
							<motion.div
								animate={{
									scale: [1, 1.1, 1],
								}}
								transition={{
									duration: 8,
									repeat: Number.POSITIVE_INFINITY,
									repeatType: "reverse",
								}}
								className="bg-primary/10 absolute -inset-6 rounded-full blur-xl"
							/>
							<Image
								src="/logo/logo.svg"
								alt="Think different Academy"
								width={80}
								height={88}
								className="h-22 w-20 drop-shadow-[0_0_15px_rgba(var(--primary),0.3)]"
							/>
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="mb-8 text-center"
					>
						<p className="text-primary mb-2 text-xs font-semibold tracking-[0.18em] uppercase">
							{roleLabel}
						</p>
						<h1 className="text-foreground mb-2 text-2xl font-bold">Welcome back</h1>
						<p className="text-muted-foreground text-sm">{roleHint}</p>
					</motion.div>

					<motion.form
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.3 }}
						onSubmit={(e) => {
							e.preventDefault();
							e.stopPropagation();
							form.handleSubmit();
						}}
						className="space-y-6"
					>
						<form.AppField name="username">
							{(field) => (
								<field.TextField
									label="Username"
									placeholder="Enter your username"
									autoComplete="username"
									className="focus-visible:border-primary focus-visible:ring-primary/20 h-11"
								/>
							)}
						</form.AppField>

						<form.AppField name="password">
							{(field) => (
								<field.TextField
									label="Password"
									type="password"
									placeholder="Enter your password"
									autoComplete="current-password"
									className="focus-visible:border-primary focus-visible:ring-primary/20 h-11"
								/>
							)}
						</form.AppField>

						<form.AppForm>
							<form.SubscribeButton label={submitLabel} className="w-full font-semibold" />
						</form.AppForm>
					</motion.form>
				</motion.div>
			</div>
		</section>
	);
}
