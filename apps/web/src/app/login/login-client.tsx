"use client";

import { useMutation } from "@tanstack/react-query";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { z } from "zod";
import BackgroundGrid from "@/components/background-grid";
import { env } from "@/env";
import { useAppForm } from "@/hooks/form";
import { useAuth } from "@/hooks/use-auth";

const loginSchema = z.object({
	username: z.string().min(3, "Username must be at least 3 characters"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});
type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginClient() {
	const router = useRouter();
	const { data, isPending } = useAuth();

	const loginMutation = useMutation({
		mutationFn: async (data: LoginFormData) => {
			const res = await fetch(`${env.NEXT_PUBLIC_API_BASE}/auth/login`, {
				headers: {
					"Content-Type": "application/json",
				},
				credentials: "include",
				method: "POST",
				body: JSON.stringify(data),
			});

			if (!res.ok) {
				throw new Error("Login failed");
			}

			return { success: true };
		},
		onSuccess: () => {
			router.push("/dashboard");
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
			router.push("/dashboard");
		}
	}, [data, isPending, router]);

	return (
		<section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
			<BackgroundGrid />

			<div className="relative z-10 mx-auto w-full max-w-md px-6">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
					className="overflow-hidden border border-white/10 bg-card/60 p-8 backdrop-blur-md"
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
								className="absolute -inset-6 rounded-full bg-primary/10 blur-xl"
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
						<h1 className="mb-2 font-bold text-2xl text-foreground">
							Welcome back
						</h1>
						<p className="text-muted-foreground text-sm">
							Log in to access your lecturer dashboard
						</p>
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
									className="h-11 focus-visible:border-primary focus-visible:ring-primary/20"
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
									className="h-11 focus-visible:border-primary focus-visible:ring-primary/20"
								/>
							)}
						</form.AppField>

						<form.AppForm>
							<form.SubscribeButton
								label="Login"
								className="w-full font-semibold"
							/>
						</form.AppForm>
					</motion.form>

					<motion.p
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.5, delay: 0.5 }}
						className="mt-6 text-center text-muted-foreground text-xs"
					>
						Contact an administrator if you need access
					</motion.p>
				</motion.div>
			</div>
		</section>
	);
}
