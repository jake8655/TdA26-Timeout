import type { Metadata, Viewport } from "next";
import "@/styles/globals.css";
import localFont from "next/font/local";
import Footer from "@/components/footer";
import Header from "@/components/header";
import { Providers } from "@/components/providers";

const fontSans = localFont({
	src: "./dosis.ttf",
	variable: "--font-sans",
});

export const metadata: Metadata = {
	title: "Think different Academy",
	description:
		"An educational platform that aims to show that learning doesn't have to mean endless reading of academic texts. Instead, it can be engaging, interactive, and fully online.",
};

export const viewport: Viewport = {
	colorScheme: "dark",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html
			lang="en"
			className={fontSans.variable}
			style={{ colorScheme: "dark" }}
		>
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
