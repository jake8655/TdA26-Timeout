"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "../animate-ui/components/buttons/button";

export default function Header() {
	const pathname = usePathname();
	const router = useRouter();

	const handleAboutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();

		if (pathname === "/") {
			const aboutSection = document.getElementById("about");
			aboutSection?.scrollIntoView({ behavior: "smooth" });
		} else {
			router.push("/#about");
		}
	};

	return (
		<header className="fixed top-0 right-0 left-0 z-50 border-white/5 border-b bg-background/80 backdrop-blur-md transition-all duration-300">
			<div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
				<Link href="/" className="group relative z-50">
					<Image
						src="/logo/logo-official-dark-2.svg"
						alt="Think different Academy"
						width={144}
						height={44}
						className="h-10 w-auto transition-opacity duration-300 hover:opacity-90"
					/>
				</Link>

				<div className="hidden items-center gap-8 md:flex">
					<Link
						href="/courses"
						className="font-medium text-muted-foreground text-sm transition-colors hover:text-primary"
					>
						Courses
					</Link>
					<Link
						href="#about"
						onClick={handleAboutClick}
						className="font-medium text-muted-foreground text-sm transition-colors hover:text-primary"
					>
						About
					</Link>
				</div>

				<div className="flex items-center gap-4">
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
				</div>
			</div>
		</header>
	);
}
