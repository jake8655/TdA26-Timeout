import type { Metadata } from "next";
import "@/styles/globals.css";
import localFont from "next/font/local";
import Header from "@/components/home/header";
import { Providers } from "@/components/providers";

const fontSans = localFont({
	src: "./dosis.ttf",
	variable: "--font-sans",
});

export const metadata: Metadata = {
	title: "Think different Academy",
	description:
		"An educational platform that aims to show that learning doesn’t have to mean endless reading of academic texts. Instead, it can be engaging, interactive, and fully online.",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className={fontSans.variable}>
			<body className="dark antialiased">
				<Providers>
					<Header />
					{children}
				</Providers>
			</body>
		</html>
	);
}
