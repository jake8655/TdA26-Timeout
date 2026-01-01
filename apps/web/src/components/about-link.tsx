"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";

export default function AboutLink({
	className,
	children,
}: {
	className?: string;
	children: React.ReactNode;
}) {
	const pathname = usePathname();
	const router = useRouter();

	const handleAboutClick = (e: MouseEvent<HTMLAnchorElement>) => {
		e.preventDefault();

		if (pathname === "/") {
			const aboutSection = document.getElementById("about");
			aboutSection?.scrollIntoView({ behavior: "smooth" });
		} else {
			router.push("/#about");
		}
	};

	return (
		<Link href="#about" onClick={handleAboutClick} className={className}>
			{children}
		</Link>
	);
}
