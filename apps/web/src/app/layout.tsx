import type { Metadata, Viewport } from "next";

import "@/styles/globals.css";
import localFont from "next/font/local";

import Footer from "@/components/footer";
import Header from "@/components/header";
import { Providers } from "@/components/providers";

const fontSans = localFont({
	src: "./dosis.ttf",
	variable: "--font-sans",
	preload: false,
});

const siteTitle = "Think different Academy";
const siteDescription =
	"An educational platform that aims to show that learning doesn't have to mean endless reading of academic texts. Instead, it can be engaging, interactive, and fully online.";
const siteUrl = "https://tda.com";

export const metadata: Metadata = {
	metadataBase: new URL(siteUrl),
	title: {
		default: siteTitle,
		template: `%s | ${siteTitle}`,
	},
	description: siteDescription,
	openGraph: {
		title: siteTitle,
		description: siteDescription,
		url: siteUrl,
		siteName: siteTitle,
		type: "website",
	},
	twitter: {
		card: "summary",
		title: siteTitle,
		description: siteDescription,
	},
	robots: {
		index: true,
		follow: true,
	},
};

export const viewport: Viewport = {
	colorScheme: "dark",
	themeColor: "#0f0f0f",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={fontSans.variable} style={{ colorScheme: "dark" }}>
			<body className="dark antialiased">
				<Providers>
					<Header />
					{children}
					<Footer />
				</Providers>
			</body>
		</html>
	);
}
