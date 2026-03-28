"use client";

import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import AboutLink from "@/components/about-link";
import { Separator } from "@/components/ui/separator";
import {
	getCountryPathFromPathname,
	getLocalizedLoginPath,
	getLocalizedManagerLoginPath,
} from "@/lib/tenant-routing";

export default function Footer() {
	const pathname = usePathname();
	const countryPath = getCountryPathFromPathname(pathname);
	const countryKey = countryPath.replace("/", "");

	return (
		<footer className="relative border-t border-white/5 bg-black/40 pt-16 pb-8 backdrop-blur-xl">
			<div className="mx-auto max-w-7xl px-6">
				<div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
					<div className="lg:col-span-2">
						<Link href={countryPath} className="group mb-6 flex items-center gap-3">
							<Image
								src="/logo/logo.svg"
								alt="Think different Academy"
								width={40}
								height={44}
								className="h-10 w-auto transition-transform duration-300 group-hover:rotate-12"
							/>
							<span className="text-xl font-bold tracking-tight">
								Think <span className="text-primary">different</span> Academy
							</span>
						</Link>
						<p className="text-muted-foreground max-w-md leading-relaxed">
							A non-profit organization dedicated to revolutionizing education through critical and
							creative thinking. We believe in making learning accessible, engaging, and free for
							everyone.
						</p>
					</div>

					<div>
						<h4 className="text-foreground mb-6 font-bold">Quick Links</h4>
						<ul className="text-muted-foreground space-y-4 text-sm">
							<li>
								<Link
									href={`${countryPath}/courses`}
									className="hover:text-primary transition-colors"
								>
									Explore Courses
								</Link>
							</li>
							<li>
								<AboutLink className="hover:text-primary transition-colors">About Us</AboutLink>
							</li>
							<li>
								<Link
									href={getLocalizedLoginPath(countryKey)}
									className="hover:text-primary transition-colors"
								>
									Lecturer Login
								</Link>
							</li>
							<li>
								<Link
									href={getLocalizedManagerLoginPath(countryKey)}
									className="hover:text-primary transition-colors"
								>
									Manager Login
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="text-foreground mb-6 font-bold">Legal</h4>
						<ul className="text-muted-foreground space-y-4 text-sm">
							<li>
								<Link
									href={`${countryPath}/privacy`}
									className="hover:text-primary transition-colors"
								>
									Privacy Policy
								</Link>
							</li>
							<li>
								<Link
									href={`${countryPath}/terms`}
									className="hover:text-primary transition-colors"
								>
									Terms of Use
								</Link>
							</li>
							<li>
								<span>GDPR Support</span>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="text-foreground mb-6 font-bold">Get in Touch</h4>
						<div className="text-muted-foreground space-y-4 text-sm">
							<p>
								Have questions or want to collaborate?
								<br />
								We'd love to hear from you.
							</p>
							<a href="mailto:contact@tda.com" className="text-accent inline-block hover:underline">
								contact@tda.com
							</a>
						</div>
					</div>
				</div>

				<Separator className="my-12 bg-white/5" />

				<div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
					<p className="text-muted-foreground text-sm">
						© {new Date().getFullYear()} Think different Academy. All rights reserved.
					</p>
					<div className="text-muted-foreground flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-4 py-1.5 text-sm">
						<span>Made with</span>
						<Heart className="size-3.5 fill-current text-red-500" />
						<span>for education</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
