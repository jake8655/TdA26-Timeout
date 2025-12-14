import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Header() {
	return (
		<header className="fixed top-0 right-0 left-0 z-50 border-b bg-background/80 backdrop-blur-md">
			<div className="mx-auto flex max-w-7xl items-center justify-between p-6">
				<Link href="/">
					<Image
						src="/logo/logo-official-dark-2.svg"
						alt="Think different Academy"
						width={144}
						height={44}
						className="h-11 w-36"
					/>
				</Link>

				<nav>
					<ul>
						<li>
							<Link href="/courses">
								<Button variant="accent" size="lg" className="px-4 text-sm">
									Get Started
								</Button>
							</Link>
						</li>
					</ul>
				</nav>
			</div>
		</header>
	);
}
