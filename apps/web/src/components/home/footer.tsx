import { Heart } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function Footer() {
	return (
		<footer className="relative border-white/5 border-t bg-black/40 pt-16 pb-8 backdrop-blur-xl">
			<div className="mx-auto max-w-7xl px-6">
				<div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
					<div className="lg:col-span-2">
						<Link href="/" className="group mb-6 flex items-center gap-3">
							<Image
								src="/logo/logo.svg"
								alt="Think different Academy"
								width={40}
								height={44}
								className="h-10 w-auto transition-transform duration-300 group-hover:rotate-12"
							/>
							<span className="font-bold text-xl tracking-tight">
								Think <span className="text-primary">different</span> Academy
							</span>
						</Link>
						<p className="max-w-md text-muted-foreground leading-relaxed">
							A non-profit organization dedicated to revolutionizing education
							through critical and creative thinking. We believe in making
							learning accessible, engaging, and free for everyone.
						</p>
					</div>

					<div>
						<h4 className="mb-6 font-bold text-foreground">Quick Links</h4>
						<ul className="space-y-4 text-muted-foreground text-sm">
							<li>
								<Link
									href="/courses"
									className="transition-colors hover:text-primary"
								>
									Explore Courses
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
							<li>
								<Link
									href="/login"
									className="transition-colors hover:text-primary"
								>
									Lecturer Login
								</Link>
							</li>
						</ul>
					</div>

					<div>
						<h4 className="mb-6 font-bold text-foreground">Get in Touch</h4>
						<div className="space-y-4 text-muted-foreground text-sm">
							<p>
								Have questions or want to collaborate?
								<br />
								We'd love to hear from you.
							</p>
							<a
								href="mailto:contact@tda.com"
								className="inline-block text-accent hover:underline"
							>
								contact@tda.com
							</a>
						</div>
					</div>
				</div>

				<Separator className="my-12 bg-white/5" />

				<div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
					<p className="text-muted-foreground text-sm">
						© {new Date().getFullYear()} Think different Academy. All rights
						reserved.
					</p>
					<div className="flex items-center gap-1.5 rounded-full border border-white/5 bg-white/5 px-4 py-1.5 text-muted-foreground text-sm transition-colors hover:bg-white/10">
						<span>Made with</span>
						<Heart className="size-3.5 fill-current text-red-500" />
						<span>for education</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
