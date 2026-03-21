import type { Metadata } from "next";
import Link from "next/link";

import BackgroundGrid from "@/components/background-grid";

export const metadata: Metadata = {
	title: "Privacy Policy",
	description:
		"Privacy Policy for Think different Academy. Learn about data collection, usage, and your GDPR rights.",
};

export default function PrivacyPage() {
	return (
		<section className="relative min-h-screen overflow-hidden pt-32 pb-24">
			<BackgroundGrid />
			<div className="relative z-10 mx-auto max-w-3xl px-6">
				<h1 className="text-foreground mb-4 text-3xl font-bold sm:text-4xl">Privacy Policy</h1>
				<p className="text-muted-foreground mb-10 max-w-2xl text-base sm:text-lg">
					We respect your privacy and keep data collection minimal. This policy outlines what we
					collect, why we collect it, and how you can manage it.
				</p>

				<div className="text-muted-foreground space-y-6 text-sm leading-relaxed">
					<div className="bg-card/40 border border-white/5 p-6 backdrop-blur-sm">
						<h2 className="text-foreground mb-2 text-lg font-semibold">What we collect</h2>
						<p>
							We collect basic account details for lecturers, course content you create, and
							anonymous usage data to improve the platform.
						</p>
					</div>

					<div className="bg-card/40 border border-white/5 p-6 backdrop-blur-sm">
						<h2 className="text-foreground mb-2 text-lg font-semibold">How we use data</h2>
						<p>
							We use data to provide course access, support quizzes and materials, and keep the
							service secure and reliable. We do not sell personal information.
						</p>
					</div>

					<div className="bg-card/40 border border-white/5 p-6 backdrop-blur-sm">
						<h2 className="text-foreground mb-2 text-lg font-semibold">Your rights (GDPR)</h2>
						<p>
							You can request access, correction, or deletion of personal data at any time. Contact
							us at{" "}
							<a
								href="mailto:contact@tda.com"
								className="text-foreground underline underline-offset-4"
							>
								contact@tda.com
							</a>
							.
						</p>
					</div>

					<div className="bg-card/40 border border-white/5 p-6 backdrop-blur-sm">
						<h2 className="text-foreground mb-2 text-lg font-semibold">Contact</h2>
						<p>
							For questions about this policy, email us or review our{" "}
							<Link href="/terms" className="text-foreground underline underline-offset-4">
								Terms of Use
							</Link>
							.
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
