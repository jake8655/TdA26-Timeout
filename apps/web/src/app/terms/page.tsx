import type { Metadata } from "next";
import Link from "next/link";
import BackgroundGrid from "@/components/background-grid";

export const metadata: Metadata = {
	title: "Terms of Use",
	description:
		"Terms of Use for Think different Academy. Learn about usage guidelines, account responsibilities, and legal information.",
};

export default function TermsPage() {
	return (
		<section className="relative min-h-screen overflow-hidden pt-32 pb-24">
			<BackgroundGrid />
			<div className="relative z-10 mx-auto max-w-3xl px-6">
				<h1 className="mb-4 font-bold text-3xl text-foreground sm:text-4xl">
					Terms of Use
				</h1>
				<p className="mb-10 max-w-2xl text-base text-muted-foreground sm:text-lg">
					These terms explain how to use Think different Academy and what to
					expect when accessing our courses and tools.
				</p>

				<div className="space-y-6 text-muted-foreground text-sm leading-relaxed">
					<div className="border border-white/5 bg-card/40 p-6 backdrop-blur-sm">
						<h2 className="mb-2 font-semibold text-foreground text-lg">
							Usage guidelines
						</h2>
						<p>
							Use the platform for educational purposes only. Do not upload
							harmful, illegal, or infringing content.
						</p>
					</div>

					<div className="border border-white/5 bg-card/40 p-6 backdrop-blur-sm">
						<h2 className="mb-2 font-semibold text-foreground text-lg">
							Accounts and content
						</h2>
						<p>
							Lecturers are responsible for the content they publish. We may
							remove content that violates these terms.
						</p>
					</div>

					<div className="border border-white/5 bg-card/40 p-6 backdrop-blur-sm">
						<h2 className="mb-2 font-semibold text-foreground text-lg">
							Legal and GDPR
						</h2>
						<p>
							We comply with GDPR requirements for data handling. Review the{" "}
							<Link
								href="/privacy"
								className="text-foreground underline underline-offset-4"
							>
								Privacy Policy
							</Link>
							for details on data usage.
						</p>
						<p className="mt-3">
							All course materials and platform content are © Think different
							Academy unless otherwise noted.
						</p>
					</div>

					<div className="border border-white/5 bg-card/40 p-6 backdrop-blur-sm">
						<h2 className="mb-2 font-semibold text-foreground text-lg">
							Contact
						</h2>
						<p>
							Questions? Email{" "}
							<a
								href="mailto:contact@tda.com"
								className="text-foreground underline underline-offset-4"
							>
								contact@tda.com
							</a>
							.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
