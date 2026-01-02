"use client";

import { useMutation } from "@tanstack/react-query";
import { LayoutDashboard, LogOut, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout, useAuthContext } from "@/hooks/use-auth";
import AboutLink from "../about-link";
import { Button } from "../animate-ui/components/buttons/button";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function Header() {
	const router = useRouter();
	const { data } = useAuthContext();
	const logoutMutation = useMutation({
		mutationFn: async () => {
			await logout();
		},
		onSuccess: () => {
			router.push("/");
		},
	});

	return (
		<header className="fixed top-0 right-0 left-0 z-50 border-white/5 border-b bg-background/80 backdrop-blur-md transition-all duration-300">
			<div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
				<Link
					href="/"
					className="group relative z-50 flex items-center gap-4 transition-opacity duration-300 hover:opacity-90"
				>
					<Image
						src="/logo/logo.svg"
						alt="Think different Academy"
						width={40}
						height={40}
						className="size-10"
					/>
					<span className="font-semibold text-lg text-white">
						Think different Academy
					</span>
				</Link>

				<div className="hidden items-center gap-8 md:flex">
					<Link
						href="/courses"
						className="font-medium text-muted-foreground text-sm transition-colors hover:text-primary"
					>
						Courses
					</Link>
					<AboutLink className="font-medium text-muted-foreground text-sm transition-colors hover:text-primary">
						About
					</AboutLink>
				</div>

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
							<DropdownMenuContent align="end" className="w-32">
								<DropdownMenuGroup>
									<DropdownMenuLabel className="flex items-center gap-2">
										<User className="size-4 shrink-0 text-muted-foreground" />
										<div className="flex flex-col">
											<span className="font-medium text-foreground text-sm">
												{data.username}
											</span>
											<span className="text-muted-foreground text-xs">
												Lecturer
											</span>
										</div>
									</DropdownMenuLabel>
									<DropdownMenuSeparator />
									<DropdownMenuItem className="p-0">
										<Link
											href="/dashboard"
											className="flex w-full cursor-auto items-center gap-2 p-2"
										>
											<LayoutDashboard />
											Dashboard
										</Link>
									</DropdownMenuItem>
									<DropdownMenuSeparator />
									<DropdownMenuItem
										onClick={() => logoutMutation.mutate()}
										variant="destructive"
									>
										<LogOut />
										Log out
									</DropdownMenuItem>
								</DropdownMenuGroup>
							</DropdownMenuContent>
						</DropdownMenu>
					) : (
						<>
							<Link href="/login" className="hidden sm:block">
								<Button
									variant="outline"
									size="sm"
									className="border-primary/20 text-primary hover:border-primary hover:bg-primary/10 hover:text-primary"
								>
									Lecturer Login
								</Button>
							</Link>
							<Link href="/courses">
								<Button variant="accent" size="sm">
									Explore Courses
								</Button>
							</Link>
						</>
					)}
				</div>
			</div>
		</header>
	);
}
