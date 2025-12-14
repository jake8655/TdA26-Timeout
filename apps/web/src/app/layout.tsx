import type { Metadata } from "next";
import "@/styles/globals.css";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});
const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
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
		<html lang="en">
			<body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
				{children}
			</body>
		</html>
	);
}
