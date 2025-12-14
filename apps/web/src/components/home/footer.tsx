import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
	return (
		<footer className="border-t bg-card/30">
			<div className="mx-auto max-w-7xl px-6 py-12">
				<div className="grid gap-32 md:grid-cols-3">
					<div>
						<Link href="/" className="flex items-center gap-3">
							<Image
								src="/logo/logo.svg"
								alt="Think different Academy"
								width={40}
								height={44}
								className="h-11 w-10"
							/>
							<span className="font-semibold text-lg">
								Think different Academy
							</span>
						</Link>
						<p className="mt-4 text-muted-foreground text-sm">
							A non-profit organization developing critical and creative
							thinking among students and the general public.
						</p>
					</div>

					<div>
						<h4 className="mb-4 font-semibold">Quick Links</h4>
						<ul className="space-y-2 text-muted-foreground text-sm">
							<li>
								<Link
									href="/courses"
									className="transition-colors hover:text-primary"
								>
									Courses
								</Link>
							</li>
							<li>
								<Link
									href="#about"
									className="transition-colors hover:text-primary"
								>
									About Us
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="mb-4 font-semibold">Get in Touch</h4>
						<p className="text-muted-foreground text-sm">
							Interested in collaborating or have questions?
							<br />
							We'd love to hear from you.
							<br />
							Email us at contact@tda.com
						</p>
					</div>
				</div>

				<div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 sm:flex-row">
					<p className="text-muted-foreground text-sm">
						© {new Date().getFullYear()} Think different Academy. All rights
						reserved.
					</p>
					<div className="flex items-center gap-1 text-muted-foreground text-sm">
						<span>Made with</span>
						<Heart className="size-4 text-primary" />
						<span>for education</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
