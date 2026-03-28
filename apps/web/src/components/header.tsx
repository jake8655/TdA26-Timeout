"use client";

import { useMutation } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { LayoutDashboard, Loader2, LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { logout, useAuth } from "@/hooks/use-auth";
import {
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

export default function Header() {
	const router = useRouter();
	const queryClient = useQueryClient();
	const pathname = usePathname();
	const { data } = useAuth();
	const countryPath = getCountryPathFromPathname(pathname);
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
