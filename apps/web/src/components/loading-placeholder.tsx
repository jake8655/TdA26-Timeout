import { Loader2 } from "lucide-react";

import BackgroundGrid from "./background-grid";

export default function LoadingPlaceholder() {
	return (
		<div className="flex min-h-screen items-center justify-center overflow-hidden pt-28">
			<BackgroundGrid />
			<Loader2 className="text-primary size-16 animate-spin" />
		</div>
	);
}
