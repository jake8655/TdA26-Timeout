"use client";

import { useMutation } from "@tanstack/react-query";
import { useQuery } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Loader2, LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

import type { TenantCountry } from "@/api-client";
import { getAuthTenants } from "@/api-client/sdk.gen";
import { logout, useAuth } from "@/hooks/use-auth";
import {
	getBranchKeyFromPathname,
	getCountryPathFromPathname,
	getCoursesPath,
	getDashboardPath,
	getLocalizedLoginPath,
} from "@/lib/tenant-routing";

import AboutLink from "./about-link";
import { Button } from "./animate-ui/components/buttons/button";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

function HeaderInner() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const { data } = useAuth();
	const countryPath = getCountryPathFromPathname(pathname);
	const selectedCountryKey = countryPath.replace("/", "");
	const selectedBranchKey = getBranchKeyFromPathname(pathname);
	const tenantsQuery = useQuery<TenantCountry[]>({
		queryKey: ["auth", "tenants"],
		queryFn: async () => {
			const response = await getAuthTenants({
				throwOnError: true,
			});

			return response.data as TenantCountry[];
		},
	});
	const selectedCountry = tenantsQuery.data?.find((t) => t.countryKey === selectedCountryKey);
	const branches = selectedCountry?.branches ?? [];
	const logoutMutation = useMutation({
		mutationFn: async () => {
			await logout();
		},
		meta: {
			skipInvalidate: true,
		},
		onSuccess: () => {
			queryClient.setQueryData(["auth"], null);
			router.push(countryPath);
		},
	});

	const replaceCountryInPathname = (nextCountryKey: string, nextBranchKey?: string) => {
		const chunks = pathname.split("/").filter(Boolean);
		if (chunks.length > 0 && /^[a-z]{2}-\d+$/i.test(chunks[0] || "")) {
			chunks[0] = nextCountryKey;
			if (nextBranchKey && chunks.length > 1 && /^branch-\d+$/i.test(chunks[1] || "")) {
				chunks[1] = nextBranchKey;
			}
			return `/${chunks.join("/")}`;
		}

		return `/${nextCountryKey}`;
	};

	const handleCountryChange = (nextCountryKey: string | null) => {
		if (!nextCountryKey || nextCountryKey === selectedCountryKey) {
			return;
		}

		const nextCountry = tenantsQuery.data?.find((t) => t.countryKey === nextCountryKey);
		const nextBranchKey = nextCountry?.branches?.[0]?.branchKey;
		const nextPath = replaceCountryInPathname(nextCountryKey, nextBranchKey);
		const search = searchParams.toString();
		const hash = typeof window === "undefined" ? "" : window.location.hash;
		const nextUrl = `${nextPath}${search ? `?${search}` : ""}${hash}`;
		router.push(nextUrl);
	};

	const handleBranchChange = (nextBranchKey: string | null) => {
		if (!nextBranchKey || nextBranchKey === selectedBranchKey) {
			return;
		}

		const chunks = pathname.split("/").filter(Boolean);
		if (chunks.length > 1 && /^branch-\d+$/i.test(chunks[1] || "")) {
			chunks[1] = nextBranchKey;
		}
		const nextPath = `/${chunks.join("/")}`;
		const search = searchParams.toString();
		const hash = typeof window === "undefined" ? "" : window.location.hash;
		const nextUrl = `${nextPath}${search ? `?${search}` : ""}${hash}`;
		router.push(nextUrl);
	};

	return (
		<header className="bg-background/80 fixed top-0 right-0 left-0 z-50 border-b border-white/5 backdrop-blur-md transition-all duration-300">
			<div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
				<Link
					href={countryPath}
					className="group relative z-50 flex items-center gap-4 transition-opacity duration-300 hover:opacity-90"
				>
					<Image
						src="/logo/logo.svg"
						alt="Think different Academy"
						width={40}
						height={40}
						className="size-10"
					/>
					<span className="text-lg font-semibold text-white">Think different Academy</span>
				</Link>

				<nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
					<Link
						href={getCoursesPath(data)}
						className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors"
					>
						Courses
					</Link>
					<AboutLink className="text-muted-foreground hover:text-primary text-sm font-medium transition-colors">
						About
					</AboutLink>
				</nav>

				<div className="flex items-center gap-4">
					<Select
						value={selectedCountryKey}
						onValueChange={handleCountryChange}
						disabled={tenantsQuery.isPending || (tenantsQuery.data?.length ?? 0) === 0}
					>
						<SelectTrigger className="min-w-22 sm:min-w-26" aria-label="Select region">
							<SelectValue placeholder="Region" />
						</SelectTrigger>
						<SelectContent align="end">
							{(tenantsQuery.data ?? []).map((tenant) => (
								<SelectItem key={tenant.countryKey} value={tenant.countryKey}>
									{tenant.countryKey.toUpperCase()}
								</SelectItem>
							))}
						</SelectContent>
					</Select>

					{branches.length > 1 && (
						<Select value={selectedBranchKey} onValueChange={handleBranchChange}>
							<SelectTrigger className="min-w-22 sm:min-w-26" aria-label="Select branch">
								<SelectValue placeholder="Branch" />
							</SelectTrigger>
							<SelectContent align="end">
								{branches.map((branch) => (
									<SelectItem key={branch.branchKey} value={branch.branchKey}>
										{branch.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					)}

					{data ? (
						<DropdownMenu>
							<DropdownMenuTrigger>
								<Avatar size="lg" aria-label="User menu">
									<AvatarFallback className="bg-primary/10 text-primary">
										{data.username.slice(0, 2).toUpperCase()}
									</AvatarFallback>
								</Avatar>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end" className="w-40">
								<DropdownMenuGroup>
									<DropdownMenuLabel className="flex items-center gap-2">
										<User className="text-muted-foreground size-4 shrink-0" />
										<div className="flex flex-col">
											<span className="text-foreground text-sm font-medium">{data.username}</span>
											<span className="text-muted-foreground text-xs">{data.role}</span>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem className="p-0">
										<Link
											href={getDashboardPath(data)}
											className="flex w-full items-center gap-2 p-2"
										>
											<LayoutDashboard />
											Dashboard
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => logoutMutation.mutate()}
										variant="destructive"
										disabled={logoutMutation.isPending}
									>
										{logoutMutation.isPending ? (
											<>
												<Loader2 className="text-muted-foreground animate-spin" />
												Logging out...
											</>
										) : (
											<>
												<LogOut />
												Log out
											</>
										)}
									</DropdownMenuItem>
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<>
							<Button
								variant="outline"
								size="sm"
								className="border-primary/20 text-primary hover:border-primary hover:bg-primary/10 hover:text-primary hidden sm:inline-flex"
								asChild
							>
								<Link href={getLocalizedLoginPath(countryPath.replace("/", ""))}>
									Lecturer Login
								</Link>
							</Button>
							<Button variant="accent" size="sm" asChild>
								<Link href={getCoursesPath(data)}>Explore Courses</Link>
							</Button>
						</>
					)}
				</div>
			</div>
		</header>
	);
}

export default function Header() {
	return (
		<Suspense>
			<HeaderInner />
		</Suspense>
	);
}
